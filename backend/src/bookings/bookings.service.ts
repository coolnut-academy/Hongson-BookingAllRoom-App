import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from '../schemas/booking.schema';
import { RoomStatus } from '../schemas/room-status.schema';
import { CustomRoom } from '../schemas/custom-room.schema';
import { BookingDate } from '../schemas/booking-date.schema';
import { AppSettings } from '../schemas/app-settings.schema';
import { User } from '../schemas/user.schema';
import * as ExcelJS from 'exceljs';

interface BookingSelection {
  roomId: string;
  slot: 'am' | 'pm';
}

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(RoomStatus.name) private roomStatusModel: Model<RoomStatus>,
    @InjectModel(CustomRoom.name) private customRoomModel: Model<CustomRoom>,
    @InjectModel(BookingDate.name) private bookingDateModel: Model<BookingDate>,
    @InjectModel(AppSettings.name) private appSettingsModel: Model<AppSettings>,
  ) {}

  // Create single booking (for backward compatibility)
  async create(roomId: string, date: Date, slot: string, userId: string) {
    // ตรวจสอบว่ามีการจองซ้ำหรือไม่
    const existing = await this.bookingModel.findOne({
      roomId,
      date: new Date(date),
      slot,
    });

    if (existing) {
      throw new ConflictException('This time slot is already booked');
    }

    const booking = new this.bookingModel({
      roomId,
      date: new Date(date),
      slot,
      bookedBy: userId,
    });

    return booking.save();
  }

  // Create multiple bookings (Phase 2 requirement)
  // userIdForBooking: userId ที่จะใช้ในการจอง (admin สามารถจองแทนคนอื่นได้)
  async createMultiple(
    date: string,
    selections: BookingSelection[],
    userId: string,
    userIdForBooking?: string,
    isAdmin: boolean = false,
  ) {
    // ตรวจสอบสถานะห้อง (ถ้าไม่ใช่ admin)
    if (!isAdmin) {
      const roomStatus = await this.getRoomStatus();
      // getRoomStatus() จะเพิ่ม defaultClosedRooms เข้าไปแล้ว
      for (const selection of selections) {
        if (roomStatus.closedRooms.includes(selection.roomId)) {
          throw new ConflictException(
            `ห้อง ${selection.roomId} ถูกปิดการจอง กรุณาติดต่อผู้ดูแลระบบ`,
          );
        }
      }
    }

    // ถ้า admin ระบุ userIdForBooking ให้ใช้ userId นั้น แทนที่จะเป็น userId ของตัวเอง
    const targetUserId = userIdForBooking || userId;
    // ใช้ UTC date เพื่อให้ตรงกันทุกที่
    const bookingDate = new Date(date + 'T00:00:00.000Z');

    // ตรวจสอบ conflict ทั้งหมดก่อนบันทึก
    const conflicts: string[] = [];
    for (const selection of selections) {
      const existing = await this.bookingModel.findOne({
        roomId: selection.roomId,
        date: bookingDate,
        slot: selection.slot,
      });

      if (existing) {
        conflicts.push(`${selection.roomId} (${selection.slot})`);
      }
    }

    if (conflicts.length > 0) {
      throw new ConflictException(
        `These time slots are already booked: ${conflicts.join(', ')}`,
      );
    }

    // สร้าง bookings ทั้งหมด
    const bookings = selections.map((selection) => ({
      roomId: selection.roomId,
      date: bookingDate,
      slot: selection.slot,
      bookedBy: targetUserId,
    }));

    const created = await this.bookingModel.insertMany(bookings);
    return {
      message: 'Bookings created successfully',
      count: created.length,
      bookings: created.map((b) => ({
        id: b._id,
        roomId: b.roomId,
        slot: b.slot,
        date: b.date,
      })),
    };
  }

  // GET /bookings?date=2025-12-22
  // Returns: Full booking data with populated bookedBy
  async getBookingsByDate(date: string) {
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    return this.bookingModel
      .find({
        date: {
          $gte: bookingDate,
          $lte: endOfDay,
        },
      })
      .populate<{ bookedBy: User }>('bookedBy', 'name username')
      .exec();
  }

  // [เพิ่มใหม่] ฟังก์ชันสำหรับหน้าสรุปรายการแข่งขัน
  async findAllBookings(): Promise<Booking[]> {
    return this.bookingModel
      .find()
      .populate<{ bookedBy: User }>('bookedBy', 'name username')
      .sort({ date: 1, roomId: 1, slot: 1 }) // เรียงข้อมูล
      .exec();
  }

  // [เพิ่มใหม่] ฟังก์ชันสำหรับอัปเดตรายละเอียด
  async updateDetails(id: string, details: string, requester: any): Promise<Booking> {
    const booking = await this.bookingModel.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // (ตรรกะตรวจสอบสิทธิ์)
    // requester มาจาก req.user ซึ่งมี userId และ isAdmin
    const requesterId = requester.userId || requester._id || requester.id;
    const isAdmin = requester.isAdmin === true;
    const isGod = requester.username === 'admingod';
    const isOwner = booking.bookedBy.toString() === requesterId.toString();

    const canEdit = isAdmin || isGod || isOwner;

    if (!canEdit) {
      throw new ForbiddenException('You do not have permission to edit this booking.');
    }

    booking.details = details;
    return booking.save();
  }

  // GET /bookings/details?date=2025-12-22
  // Returns: [{ roomId: "131", slot: "am", bookedBy: { username: "...", displayName: "..." } }]
  async getBookingsWithDetails(date: string) {
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await this.bookingModel
      .find({
        date: {
          $gte: bookingDate,
          $lte: endOfDay,
        },
      })
      .populate('bookedBy', 'username displayName')
      .select('roomId slot bookedBy')
      .exec();

    return bookings.map((booking) => ({
      roomId: booking.roomId,
      slot: booking.slot,
      bookedBy: booking.bookedBy
        ? {
            username: booking.bookedBy.username,
            displayName:
              booking.bookedBy.displayName || booking.bookedBy.username,
          }
        : null,
    }));
  }

  async findByDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.bookingModel
      .find({
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .populate('bookedBy', 'username displayName')
      .exec();
  }

  async getBookingStatus(date: Date) {
    const bookings = await this.findByDate(date);
    const statusMap: Record<string, { am?: boolean; pm?: boolean }> = {};

    bookings.forEach((booking) => {
      if (!statusMap[booking.roomId]) {
        statusMap[booking.roomId] = {};
      }
      statusMap[booking.roomId][booking.slot] = true;
    });

    return statusMap;
  }

  // Old summary method (for backward compatibility)
  async getSummary(startDate: Date, endDate: Date) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const bookings = await this.bookingModel
      .find({
        date: {
          $gte: start,
          $lte: end,
        },
      })
      .populate('bookedBy', 'username displayName')
      .exec();

    // จัดกลุ่มตามอาคารและวันที่
    const summary: Record<string, any> = {};

    bookings.forEach((booking) => {
      const dateStr = booking.date.toISOString().split('T')[0];
      const building = this.getBuildingFromRoomId(booking.roomId);
      const key = `${building}_${dateStr}`;

      if (!summary[key]) {
        summary[key] = {
          building,
          date: dateStr,
          available: 0,
          booked: 0,
          details: [],
        };
      }

      summary[key].booked += 1;
      summary[key].details.push({
        roomId: booking.roomId,
        slot: booking.slot,
        bookedBy: booking.bookedBy,
      });
    });

    return Object.values(summary);
  }

  // GET /bookings/summary (Phase 2 requirement)
  // Returns format: { "2025-12-22": { "building1": { "bookedSlots": 6, "availableSlots": 18 }, ... } }
  async getSummaryFormatted() {
    // ดึงสถานะห้องที่ปิด
    const roomStatus = await this.getRoomStatus();
    const closedRoomsSet = new Set(roomStatus.closedRooms);

    // ดึงห้องพิเศษทั้งหมด
    const customRooms = await this.getAllCustomRooms();

    // กำหนดวันที่ 22 และ 23 ธันวาคม 2568
    // Query ทั้งวันที่ 22 และ 23 โดยใช้ range ที่กว้างเพื่อให้ครอบคลุมทุก timezone
    // Query ตั้งแต่ 21 ธันวาคม ถึง 24 ธันวาคม เพื่อให้ครอบคลุมทุก timezone
    const date21Start = new Date('2025-12-21T00:00:00.000Z');
    const date24End = new Date('2025-12-24T23:59:59.999Z');

    const allBookings = await this.bookingModel
      .find({
        date: {
          $gte: date21Start,
          $lte: date24End,
        },
      })
      .populate('bookedBy', 'username displayName')
      .exec();

    // Filter bookings to only include dates 2025-12-22 and 2025-12-23
    const bookings = allBookings.filter((booking) => {
      const bookingDateStr = new Date(booking.date).toISOString().split('T')[0];
      return bookingDateStr === '2025-12-22' || bookingDateStr === '2025-12-23';
    });

    // Debug: Log bookings to see if data is being fetched
    // Removed console.log for production

    // นับจำนวน slots ทั้งหมดต่ออาคาร (คำนวณจาก availableRoomsByBuilding)
    // จะคำนวณใหม่หลังจากได้ availableRoomsByBuilding แล้ว

    // รายชื่อห้องทั้งหมดในแต่ละอาคาร (รวมห้องที่ blocked แต่จะกรองห้องที่ปิดออกทีหลัง)
    const allRooms: Record<string, string[]> = {
      building1: [
        '131',
        '132',
        '133',
        '134',
        '135',
        '136',
        '121',
        '122',
        '123',
        '124',
        '125',
        '126',
        '111',
        '112',
        '113',
        '114',
        '115',
        '116',
      ],
      building2: [
        '231',
        '232',
        '233',
        '234',
        '235',
        '236',
        '221',
        'english',
        '211',
        '212',
        '213',
        '214',
        '215',
        '216',
      ],
      building3: [
        '331',
        '332',
        '333',
        '334',
        '335',
        '336',
        '337',
        '338',
        '321',
        '322',
        '323',
        '324',
        '325',
        '326',
        '327',
        '328',
        '311',
        '312',
        '317',
        '318',
        'library',
        'innovation',
      ],
      building4: [
        '441',
        '442',
        '443',
        '444',
        '445',
        '446',
        '447',
        '448',
        '431',
        '432',
        '433',
        '434',
        '435',
        '436',
        '437',
        '438',
        '421',
        '422',
        '423',
        '424',
        '425',
        '426',
        '427',
        '428',
        'fablab',
        'meeting1',
        'meeting2',
        'hcec',
      ],
      building5: ['A4', 'A3', 'A2', 'A1'],
      building6: [
        'music1',
        'music2',
        'home1',
        'home2',
        'phet',
        'phet-canteen',
        'industry1',
        'industry2',
        'canteen',
      ],
    };

    // เพิ่มห้องพิเศษเข้าไปใน building6 (หรือสร้าง building7 ใหม่)
    // สำหรับความง่าย ให้เพิ่มเข้า building6
    const customRoomIds = customRooms.map((room) => room.roomId);
    if (customRoomIds.length > 0) {
      allRooms.building6 = [...(allRooms.building6 || []), ...customRoomIds];
    }

    // กรองห้องที่ปิดออกจาก allRooms
    const availableRoomsByBuilding: Record<string, string[]> = {};
    Object.keys(allRooms).forEach((building) => {
      availableRoomsByBuilding[building] = allRooms[building].filter(
        (roomId) => !closedRoomsSet.has(roomId),
      );
    });

    // จัดกลุ่มตามวันที่และอาคาร
    const summary: Record<
      string,
      Record<
        string,
        {
          bookedSlots: number;
          availableSlots: number;
          bookedRooms: Array<{
            roomId: string;
            slot: string;
            bookedBy: string;
          }>;
          availableRooms: string[];
        }
      >
    > = {};

    // Initialize summary structure
    ['2025-12-22', '2025-12-23'].forEach((dateStr) => {
      summary[dateStr] = {};
      Object.keys(availableRoomsByBuilding).forEach((building) => {
        // คำนวณ availableSlots จากห้องที่เปิด (ไม่รวมห้องที่ปิด)
        const availableRooms = availableRoomsByBuilding[building] || [];
        const availableSlots = availableRooms.length * 2; // แต่ละห้องมี 2 slots (am, pm)

        summary[dateStr][building] = {
          bookedSlots: 0,
          availableSlots: availableSlots,
          bookedRooms: [],
          availableRooms: [...availableRooms],
        };
      });
    });

    // Process bookings - group by date, building, and room
    const bookingsByDateAndBuilding: Record<
      string,
      Record<string, Record<string, { am: boolean; pm: boolean }>>
    > = {};

    for (const booking of bookings) {
      // ใช้ UTC date เพื่อให้ตรงกับ date ที่บันทึก
      const bookingDate = new Date(booking.date);
      const dateStr = bookingDate.toISOString().split('T')[0];
      const building = this.getBuildingKeyFromRoomId(booking.roomId);

      // Debug: Log each booking - Removed console.log for production

      if (!bookingsByDateAndBuilding[dateStr]) {
        bookingsByDateAndBuilding[dateStr] = {};
      }
      if (!bookingsByDateAndBuilding[dateStr][building]) {
        bookingsByDateAndBuilding[dateStr][building] = {};
      }
      if (!bookingsByDateAndBuilding[dateStr][building][booking.roomId]) {
        bookingsByDateAndBuilding[dateStr][building][booking.roomId] = {
          am: false,
          pm: false,
        };
      }

      bookingsByDateAndBuilding[dateStr][building][booking.roomId][
        booking.slot as 'am' | 'pm'
      ] = true;
    }

    // Process summary with booked rooms
    for (const [dateStr, buildings] of Object.entries(
      bookingsByDateAndBuilding,
    )) {
      for (const [building, rooms] of Object.entries(buildings)) {
        for (const [roomId, slots] of Object.entries(rooms)) {
          if (summary[dateStr] && summary[dateStr][building]) {
            if (slots.am) {
              summary[dateStr][building].bookedSlots += 1;
              summary[dateStr][building].availableSlots -= 1;

              const booking = bookings.find((b) => {
                const bDateStr = new Date(b.date).toISOString().split('T')[0];
                return (
                  b.roomId === roomId && b.slot === 'am' && bDateStr === dateStr
                );
              });

              // Handle populated bookedBy (could be ObjectId or populated object)
              let displayName = 'Unknown';
              if (booking?.bookedBy) {
                if (
                  typeof booking.bookedBy === 'object' &&
                  booking.bookedBy !== null
                ) {
                  displayName =
                    (booking.bookedBy as any).displayName ||
                    (booking.bookedBy as any).username ||
                    'Unknown';
                } else {
                  // If it's just an ObjectId, we need to populate it
                  displayName = 'Unknown';
                }
              }

              summary[dateStr][building].bookedRooms.push({
                roomId,
                slot: 'am',
                bookedBy: displayName,
              });
            }

            if (slots.pm) {
              summary[dateStr][building].bookedSlots += 1;
              summary[dateStr][building].availableSlots -= 1;

              const booking = bookings.find((b) => {
                const bDateStr = new Date(b.date).toISOString().split('T')[0];
                return (
                  b.roomId === roomId && b.slot === 'pm' && bDateStr === dateStr
                );
              });

              // Handle populated bookedBy (could be ObjectId or populated object)
              let displayName = 'Unknown';
              if (booking?.bookedBy) {
                if (
                  typeof booking.bookedBy === 'object' &&
                  booking.bookedBy !== null
                ) {
                  displayName =
                    (booking.bookedBy as any).displayName ||
                    (booking.bookedBy as any).username ||
                    'Unknown';
                } else {
                  // If it's just an ObjectId, we need to populate it
                  displayName = 'Unknown';
                }
              }

              summary[dateStr][building].bookedRooms.push({
                roomId,
                slot: 'pm',
                bookedBy: displayName,
              });
            }

            // Remove room from available if both slots are booked
            // (ห้องที่ปิดจะไม่อยู่ใน availableRooms อยู่แล้ว)
            if (slots.am && slots.pm) {
              const index =
                summary[dateStr][building].availableRooms.indexOf(roomId);
              if (index > -1) {
                summary[dateStr][building].availableRooms.splice(index, 1);
              }
            }
          }
        }
      }
    }

    return summary;
  }

  private getBuildingKeyFromRoomId(roomId: string): string {
    // Map roomId to building key
    if (roomId.startsWith('custom-')) return 'building6'; // ห้องพิเศษไปที่ building6
    if (roomId.startsWith('1')) return 'building1';
    if (roomId.startsWith('2')) return 'building2';
    if (roomId.startsWith('3')) return 'building3';
    if (roomId.startsWith('4')) return 'building4';
    if (roomId.startsWith('A')) return 'building5';
    return 'building6';
  }

  async delete(bookingId: string, userId: string, isAdmin: boolean = false) {
    const booking = await this.bookingModel.findById(bookingId).exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Admin สามารถลบการจองของทุกคนได้
    if (!isAdmin && booking.bookedBy.toString() !== userId) {
      throw new ConflictException('You can only delete your own bookings');
    }

    return this.bookingModel.findByIdAndDelete(bookingId).exec();
  }

  // Reset room: ลบทุกการจองในห้องที่ระบุ (สำหรับ admin)
  async resetRoom(roomId: string, date: string, isAdmin: boolean) {
    if (!isAdmin) {
      throw new ConflictException('Only admin can reset room bookings');
    }

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.bookingModel
      .deleteMany({
        roomId,
        date: {
          $gte: bookingDate,
          $lte: endOfDay,
        },
      })
      .exec();

    return {
      message: `Reset room ${roomId} successfully`,
      deletedCount: result.deletedCount,
    };
  }

  // Reset all: ลบทุกการจองทั้งหมด (สำหรับ admin)
  async resetAll(isAdmin: boolean) {
    if (!isAdmin) {
      throw new ConflictException('Only admin can reset all bookings');
    }

    const result = await this.bookingModel.deleteMany({}).exec();

    return {
      message: 'Reset all bookings successfully',
      deletedCount: result.deletedCount,
    };
  }

  private getBuildingFromRoomId(roomId: string): string {
    // ตรรกะง่ายๆ: ดูจากตัวเลขแรกของ roomId
    if (roomId.startsWith('1')) return 'อาคาร 1';
    if (roomId.startsWith('2')) return 'อาคาร 2';
    if (roomId.startsWith('3')) return 'อาคาร 3';
    if (roomId.startsWith('4')) return 'อาคาร 4';
    if (roomId.startsWith('A')) return 'อาคารใหม่';
    return 'อาคารอื่นๆ';
  }

  // Room Status Management Methods

  // รายการห้องที่ตั้งค่าตั้งต้นว่าเต็มแล้ว (isBlocked)
  private readonly defaultClosedRooms: string[] = [
    // Building 1
    '132',
    '134',
    '121',
    '122',
    '124',
    '111',
    '112',
    '114',
    // Building 2
    '221',
    'english',
    // Building 3
    '333',
    '338',
    '321',
    'library',
    'innovation',
    // Building 4
    '431',
  ];

  // ดึงสถานะห้องปัจจุบัน (มีแค่ record เดียว)
  async getRoomStatus(): Promise<RoomStatus> {
    let status = await this.roomStatusModel.findOne().exec();
    if (!status) {
      // สร้าง default status ถ้ายังไม่มี และเพิ่มห้องที่ตั้งค่าตั้งต้นว่าเต็มแล้ว
      status = new this.roomStatusModel({
        closedRooms: [...this.defaultClosedRooms],
      });
      await status.save();
      return status;
    }

    // ไม่ต้องเพิ่ม defaultClosedRooms กลับเข้าไปอีก
    // เพราะถ้า admin เปิดห้องไว้แล้ว (ไม่อยู่ใน closedRooms)
    // ไม่ควรเพิ่มกลับเข้าไปอีก

    return status;
  }

  // เปิดห้อง (Admin only) - เอา roomId ออกจาก closedRooms
  async openRoom(
    roomId: string,
  ): Promise<{ message: string; closedRooms: string[] }> {
    let status = await this.roomStatusModel.findOne().exec();
    if (!status) {
      status = new this.roomStatusModel({ closedRooms: [] });
    }

    // เอา roomId ออกจาก closedRooms ถ้ามี
    status.closedRooms = status.closedRooms.filter((id) => id !== roomId);
    await status.save();

    return {
      message: `เปิดห้อง ${roomId} ให้สามารถจองได้แล้ว`,
      closedRooms: status.closedRooms,
    };
  }

  // ปิดห้อง (Admin only) - เพิ่ม roomId เข้า closedRooms
  async closeRoom(
    roomId: string,
  ): Promise<{ message: string; closedRooms: string[] }> {
    let status = await this.roomStatusModel.findOne().exec();
    if (!status) {
      status = new this.roomStatusModel({ closedRooms: [] });
    }

    // เพิ่ม roomId เข้า closedRooms ถ้ายังไม่มี
    if (!status.closedRooms.includes(roomId)) {
      status.closedRooms.push(roomId);
    }
    await status.save();

    return {
      message: `ปิดห้อง ${roomId} ไม่ให้จองแล้ว`,
      closedRooms: status.closedRooms,
    };
  }

  // Toggle ห้อง (Admin only) - สลับสถานะเปิด/ปิด
  async toggleRoom(
    roomId: string,
  ): Promise<{ message: string; isClosed: boolean; closedRooms: string[] }> {
    let status = await this.roomStatusModel.findOne().exec();
    if (!status) {
      status = new this.roomStatusModel({ closedRooms: [] });
    }

    const isCurrentlyClosed = status.closedRooms.includes(roomId);

    if (isCurrentlyClosed) {
      // เปิดห้อง (เอาออก)
      status.closedRooms = status.closedRooms.filter((id) => id !== roomId);
      await status.save();
      return {
        message: `เปิดห้อง ${roomId} ให้สามารถจองได้แล้ว`,
        isClosed: false,
        closedRooms: status.closedRooms,
      };
    } else {
      // ปิดห้อง (เพิ่มเข้า)
      status.closedRooms.push(roomId);
      await status.save();
      return {
        message: `ปิดห้อง ${roomId} ไม่ให้จองแล้ว`,
        isClosed: true,
        closedRooms: status.closedRooms,
      };
    }
  }

  // Custom Room Management Methods

  // ดึงรายการห้องพิเศษทั้งหมด
  async getAllCustomRooms(): Promise<CustomRoom[]> {
    return this.customRoomModel.find().sort({ createdAt: 1 }).exec();
  }

  // สร้างห้องพิเศษใหม่
  async createCustomRoom(
    roomName: string,
    subtitle?: string,
  ): Promise<CustomRoom> {
    // หา roomId ถัดไป (custom-1, custom-2, ...)
    const existingRooms = await this.customRoomModel.find().exec();
    const nextNumber = existingRooms.length + 1;
    const roomId = `custom-${nextNumber}`;

    // ตรวจสอบว่า roomId ซ้ำหรือไม่ (ไม่น่าจะเกิด แต่ตรวจสอบไว้)
    const existing = await this.customRoomModel.findOne({ roomId }).exec();
    if (existing) {
      // ถ้าซ้ำ ให้หาตัวเลขถัดไป
      let num = nextNumber + 1;
      let newRoomId = `custom-${num}`;
      while (await this.customRoomModel.findOne({ roomId: newRoomId }).exec()) {
        num++;
        newRoomId = `custom-${num}`;
      }
      const customRoom = new this.customRoomModel({
        roomId: newRoomId,
        roomName,
        subtitle,
      });
      return customRoom.save();
    }

    const customRoom = new this.customRoomModel({
      roomId,
      roomName,
      subtitle,
    });
    return customRoom.save();
  }

  // ลบห้องพิเศษ
  async deleteCustomRoom(roomId: string): Promise<{ message: string }> {
    const customRoom = await this.customRoomModel.findOne({ roomId }).exec();
    if (!customRoom) {
      throw new NotFoundException('Custom room not found');
    }

    // ลบการจองทั้งหมดที่เกี่ยวข้องกับห้องนี้
    await this.bookingModel.deleteMany({ roomId }).exec();

    // ลบห้องออกจาก closedRooms ถ้ามี
    const roomStatus = await this.roomStatusModel.findOne().exec();
    if (roomStatus) {
      roomStatus.closedRooms = roomStatus.closedRooms.filter(
        (id) => id !== roomId,
      );
      await roomStatus.save();
    }

    // ลบห้อง
    await this.customRoomModel.deleteOne({ roomId }).exec();

    return { message: `ลบห้อง ${roomId} เรียบร้อยแล้ว` };
  }

  // ============================================
  // Booking Date Management Methods
  // ============================================

  // GET /bookings/dates - ดึงวันที่ทั้งหมดที่เพิ่มไว้
  async getAllBookingDates(): Promise<BookingDate[]> {
    return this.bookingDateModel
      .find({ isActive: true })
      .sort({ date: 1 })
      .exec();
  }

  // POST /bookings/dates - เพิ่มวันที่ใหม่
  async addBookingDate(
    date: string,
    displayName: string,
  ): Promise<BookingDate> {
    // ตรวจสอบว่ามีวันที่นี้อยู่แล้วหรือไม่
    const existing = await this.bookingDateModel.findOne({
      date,
      isActive: true,
    });
    if (existing) {
      throw new ConflictException('วันที่นี้มีอยู่แล้วในระบบ');
    }

    // ตรวจสอบว่าวันที่อยู่ในอนาคตหรือไม่
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    if (selectedDate < today) {
      throw new BadRequestException('ไม่สามารถเพิ่มวันที่ในอดีตได้');
    }

    const bookingDate = new this.bookingDateModel({
      date,
      displayName,
      isActive: true,
    });

    return bookingDate.save();
  }

  // DELETE /bookings/dates/:date - ลบวันที่
  async removeBookingDate(date: string): Promise<void> {
    const bookingDate = await this.bookingDateModel.findOne({
      date,
      isActive: true,
    });

    if (!bookingDate) {
      throw new NotFoundException('ไม่พบวันที่นี้ในระบบ');
    }

    // Soft delete
    bookingDate.isActive = false;
    await bookingDate.save();

    // ไม่ลบการจองในวันที่นี้ (เก็บไว้เพื่อดูประวัติ)
  }

  // ============================================
  // App Settings Management
  // ============================================

  // GET /bookings/settings - ดึงการตั้งค่าของแอป
  async getAppSettings(): Promise<{ contestName: string }> {
    let settings = await this.appSettingsModel.findOne().exec();
    if (!settings) {
      // สร้าง default settings ถ้ายังไม่มี
      settings = new this.appSettingsModel({
        contestName: 'งานแข่งขัน',
      });
      await settings.save();
    }
    return {
      contestName: settings.contestName || 'งานแข่งขัน',
    };
  }

  // PUT /bookings/settings - อัปเดตชื่องานแข่งขัน (Admin only)
  async updateContestName(contestName: string): Promise<{ contestName: string }> {
    let settings = await this.appSettingsModel.findOne().exec();
    if (!settings) {
      settings = new this.appSettingsModel({ contestName });
    } else {
      settings.contestName = contestName;
    }
    await settings.save();
    return { contestName: settings.contestName };
  }

  // Export bookings to Excel
  async exportToExcel(): Promise<Buffer> {
    const logger = new Logger(BookingsService.name);
    logger.log('Starting Excel export...');

    const bookings = await this.bookingModel
      .find()
      .populate<{ bookedBy: User }>('bookedBy', 'name username displayName')
      .sort({ date: 1, roomId: 1 })
      .exec();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Booking System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('สรุปการจองทั้งหมด');

    // กำหนด Columns (หัวตาราง)
    worksheet.columns = [
      { header: 'รหัสห้อง (RoomID)', key: 'roomId', width: 25 },
      {
        header: 'วันที่จอง',
        key: 'date',
        width: 15,
        style: { numFmt: 'yyyy-mm-dd' },
      },
      { header: 'ช่วงเวลา (Slot)', key: 'slot', width: 10 },
      { header: 'จองโดย (Username)', key: 'username', width: 20 },
      { header: 'ชื่อผู้จอง', key: 'name', width: 30 },
      {
        header: 'จองเมื่อ (Timestamp)',
        key: 'createdAt',
        width: 20,
        style: { numFmt: 'yyyy-mm-dd hh:mm:ss' },
      },
    ];

    // (ปรับแต่งหัวตารางให้เป็นตัวหนา)
    worksheet.getRow(1).font = { bold: true };

    // เพิ่มข้อมูล (Rows)
    for (const booking of bookings) {
      const user = booking.bookedBy as User;
      const bookingDoc = booking as any; // Type assertion for timestamps
      worksheet.addRow({
        roomId: booking.roomId,
        date: booking.date,
        slot: booking.slot === 'am' ? 'ช่วงเช้า' : 'ช่วงบ่าย',
        username: user?.username || 'N/A',
        name: user?.name || user?.displayName || 'N/A',
        createdAt: bookingDoc.createdAt || new Date(),
      });
    }

    logger.log('Excel file generated, writing to buffer...');
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
