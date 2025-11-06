"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const booking_schema_1 = require("../schemas/booking.schema");
let BookingsService = class BookingsService {
    bookingModel;
    constructor(bookingModel) {
        this.bookingModel = bookingModel;
    }
    async create(roomId, date, slot, userId) {
        const existing = await this.bookingModel.findOne({
            roomId,
            date: new Date(date),
            slot,
        });
        if (existing) {
            throw new common_1.ConflictException('This time slot is already booked');
        }
        const booking = new this.bookingModel({
            roomId,
            date: new Date(date),
            slot,
            bookedBy: userId,
        });
        return booking.save();
    }
    async createMultiple(date, selections, userId, userIdForBooking) {
        const targetUserId = userIdForBooking || userId;
        const bookingDate = new Date(date + 'T00:00:00.000Z');
        const conflicts = [];
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
            throw new common_1.ConflictException(`These time slots are already booked: ${conflicts.join(', ')}`);
        }
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
    async getBookingsByDate(date) {
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
            .select('roomId slot')
            .exec();
        return bookings.map((booking) => ({
            roomId: booking.roomId,
            slot: booking.slot,
        }));
    }
    async getBookingsWithDetails(date) {
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
                    displayName: booking.bookedBy.displayName || booking.bookedBy.username,
                }
                : null,
        }));
    }
    async findByDate(date) {
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
    async getBookingStatus(date) {
        const bookings = await this.findByDate(date);
        const statusMap = {};
        bookings.forEach((booking) => {
            if (!statusMap[booking.roomId]) {
                statusMap[booking.roomId] = {};
            }
            statusMap[booking.roomId][booking.slot] = true;
        });
        return statusMap;
    }
    async getSummary(startDate, endDate) {
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
        const summary = {};
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
    async getSummaryFormatted() {
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
        const bookings = allBookings.filter((booking) => {
            const bookingDateStr = new Date(booking.date).toISOString().split('T')[0];
            return bookingDateStr === '2025-12-22' || bookingDateStr === '2025-12-23';
        });
        console.log(`[Summary] Found ${bookings.length} bookings for dates 2025-12-22 to 2025-12-23`);
        if (bookings.length > 0) {
            console.log(`[Summary] Sample booking:`, {
                roomId: bookings[0].roomId,
                date: bookings[0].date,
                slot: bookings[0].slot,
                bookedBy: bookings[0].bookedBy,
            });
        }
        const totalSlotsPerBuilding = {
            building1: 36,
            building2: 24,
            building3: 32,
            building4: 40,
            building5: 8,
            building6: 14,
        };
        const allRooms = {
            building1: ['131', '133', '135', '136', '123', '125', '126', '113', '115', '116'],
            building2: ['231', '232', '233', '234', '235', '236', '211', '212', '213', '214', '215', '216'],
            building3: ['331', '332', '334', '335', '336', '337', '322', '323', '324', '325', '326', '327', '328', '311', '312', '317', '318'],
            building4: ['441', '442', '443', '444', '445', '446', '447', '448', '432', '433', '434', '435', '436', '437', '438', '421', '422', '423', '424', '425', '426', '427', '428', 'fablab', 'meeting1', 'meeting2', 'hcec'],
            building5: ['A4', 'A3', 'A2', 'A1'],
            building6: ['music1', 'music2', 'home1', 'home2', 'phet', 'phet-canteen', 'industry1', 'industry2', 'canteen'],
        };
        const summary = {};
        ['2025-12-22', '2025-12-23'].forEach((dateStr) => {
            summary[dateStr] = {};
            Object.keys(totalSlotsPerBuilding).forEach((building) => {
                summary[dateStr][building] = {
                    bookedSlots: 0,
                    availableSlots: totalSlotsPerBuilding[building],
                    bookedRooms: [],
                    availableRooms: [...(allRooms[building] || [])],
                };
            });
        });
        const bookingsByDateAndBuilding = {};
        for (const booking of bookings) {
            const bookingDate = new Date(booking.date);
            const dateStr = bookingDate.toISOString().split('T')[0];
            const building = this.getBuildingKeyFromRoomId(booking.roomId);
            console.log(`[Summary] Processing booking: roomId=${booking.roomId}, date=${dateStr}, building=${building}, slot=${booking.slot}`);
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
            bookingsByDateAndBuilding[dateStr][building][booking.roomId][booking.slot] = true;
        }
        for (const [dateStr, buildings] of Object.entries(bookingsByDateAndBuilding)) {
            for (const [building, rooms] of Object.entries(buildings)) {
                for (const [roomId, slots] of Object.entries(rooms)) {
                    if (summary[dateStr] && summary[dateStr][building]) {
                        if (slots.am) {
                            summary[dateStr][building].bookedSlots += 1;
                            summary[dateStr][building].availableSlots -= 1;
                            const booking = bookings.find((b) => {
                                const bDateStr = new Date(b.date).toISOString().split('T')[0];
                                return (b.roomId === roomId &&
                                    b.slot === 'am' &&
                                    bDateStr === dateStr);
                            });
                            let displayName = 'Unknown';
                            if (booking?.bookedBy) {
                                if (typeof booking.bookedBy === 'object' && booking.bookedBy !== null) {
                                    displayName = booking.bookedBy.displayName || booking.bookedBy.username || 'Unknown';
                                }
                                else {
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
                                return (b.roomId === roomId &&
                                    b.slot === 'pm' &&
                                    bDateStr === dateStr);
                            });
                            let displayName = 'Unknown';
                            if (booking?.bookedBy) {
                                if (typeof booking.bookedBy === 'object' && booking.bookedBy !== null) {
                                    displayName = booking.bookedBy.displayName || booking.bookedBy.username || 'Unknown';
                                }
                                else {
                                    displayName = 'Unknown';
                                }
                            }
                            summary[dateStr][building].bookedRooms.push({
                                roomId,
                                slot: 'pm',
                                bookedBy: displayName,
                            });
                        }
                        if (slots.am && slots.pm) {
                            const index = summary[dateStr][building].availableRooms.indexOf(roomId);
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
    getBuildingKeyFromRoomId(roomId) {
        if (roomId.startsWith('1'))
            return 'building1';
        if (roomId.startsWith('2'))
            return 'building2';
        if (roomId.startsWith('3'))
            return 'building3';
        if (roomId.startsWith('4'))
            return 'building4';
        if (roomId.startsWith('A'))
            return 'building5';
        return 'building6';
    }
    async delete(bookingId, userId, isAdmin = false) {
        const booking = await this.bookingModel.findById(bookingId).exec();
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (!isAdmin && booking.bookedBy.toString() !== userId) {
            throw new common_1.ConflictException('You can only delete your own bookings');
        }
        return this.bookingModel.findByIdAndDelete(bookingId).exec();
    }
    async resetRoom(roomId, date, isAdmin) {
        if (!isAdmin) {
            throw new common_1.ConflictException('Only admin can reset room bookings');
        }
        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        const endOfDay = new Date(bookingDate);
        endOfDay.setHours(23, 59, 59, 999);
        const result = await this.bookingModel.deleteMany({
            roomId,
            date: {
                $gte: bookingDate,
                $lte: endOfDay,
            },
        }).exec();
        return {
            message: `Reset room ${roomId} successfully`,
            deletedCount: result.deletedCount,
        };
    }
    getBuildingFromRoomId(roomId) {
        if (roomId.startsWith('1'))
            return 'อาคาร 1';
        if (roomId.startsWith('2'))
            return 'อาคาร 2';
        if (roomId.startsWith('3'))
            return 'อาคาร 3';
        if (roomId.startsWith('4'))
            return 'อาคาร 4';
        if (roomId.startsWith('A'))
            return 'อาคารใหม่';
        return 'อาคารอื่นๆ';
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map