import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ConflictException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsArray,
  ValidateNested,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookingsService } from './bookings.service';

// DTO สำหรับแต่ละ selection
export class BookingSelectionDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsIn(['am', 'pm'])
  slot: 'am' | 'pm';
}

// DTO สำหรับ POST /bookings
export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  date: string; // ISO date string เช่น "2025-12-22"

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingSelectionDto)
  selections: BookingSelectionDto[];

  // สำหรับ admin: จองแทน user อื่น (optional)
  @IsOptional()
  @IsString()
  userIdForBooking?: string;
}

// DTO สำหรับเพิ่มวันที่
export class AddBookingDateDto {
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;
}

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // GET /bookings?date=2025-12-22
  // Returns: [{ roomId: "131", slot: "am" }, { roomId: "A4", slot: "pm" }]
  @Get()
  async getBookings(@Query('date') date: string) {
    return this.bookingsService.getBookingsByDate(date);
  }

  // GET /bookings/details?date=2025-12-22
  // Returns: [{ roomId: "131", slot: "am", bookedBy: { username: "...", displayName: "..." } }]
  @Get('details')
  async getBookingsWithDetails(@Query('date') date: string) {
    return this.bookingsService.getBookingsWithDetails(date);
  }

  // POST /bookings
  // Body: { date: "2025-12-22", selections: [{ roomId: "131", slot: "am" }], userIdForBooking?: "..." }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBookingDto: CreateBookingDto, @Request() req) {
    // ตรวจสอบว่าเป็น admin หรือไม่ ถ้าไม่ใช่ admin ไม่สามารถจองแทนคนอื่นได้
    const userIdForBooking =
      req.user.isAdmin && createBookingDto.userIdForBooking
        ? createBookingDto.userIdForBooking
        : undefined;

    return this.bookingsService.createMultiple(
      createBookingDto.date,
      createBookingDto.selections,
      req.user.userId,
      userIdForBooking,
      req.user.isAdmin || false,
    );
  }

  // GET /bookings/summary
  // Returns summary format as specified
  @Get('summary')
  async getSummary() {
    return this.bookingsService.getSummaryFormatted();
  }

  // Keep status endpoint for backward compatibility
  @Get('status')
  async getStatus(@Query('date') date: string) {
    return this.bookingsService.getBookingStatus(new Date(date));
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.bookingsService.delete(
      id,
      req.user.userId,
      req.user.isAdmin || false,
    );
  }

  // POST /bookings/reset-room
  // Body: { roomId: "131", date: "2025-12-22" }
  // Admin only: Reset all bookings for a room on a specific date
  @Post('reset-room')
  @HttpCode(HttpStatus.OK)
  async resetRoom(
    @Body() body: { roomId: string; date: string },
    @Request() req,
  ) {
    if (!req.user.isAdmin) {
      throw new ConflictException('Only admin can reset room bookings');
    }
    if (!body.roomId || !body.date) {
      throw new BadRequestException('roomId and date are required');
    }
    return this.bookingsService.resetRoom(body.roomId, body.date, true);
  }

  // GET /bookings/room-status
  // Returns: { closedRooms: string[] }
  @Get('room-status')
  async getRoomStatus() {
    return this.bookingsService.getRoomStatus();
  }

  // POST /bookings/open-room/:roomId
  // Admin only: เปิดห้องให้สามารถจองได้
  @Post('open-room/:roomId')
  @HttpCode(HttpStatus.OK)
  async openRoom(@Param('roomId') roomId: string, @Request() req) {
    if (!req.user.isAdmin) {
      throw new ConflictException('Only admin can manage room status');
    }
    return this.bookingsService.openRoom(roomId);
  }

  // POST /bookings/close-room/:roomId
  // Admin only: ปิดห้องไม่ให้จอง
  @Post('close-room/:roomId')
  @HttpCode(HttpStatus.OK)
  async closeRoom(@Param('roomId') roomId: string, @Request() req) {
    if (!req.user.isAdmin) {
      throw new ConflictException('Only admin can manage room status');
    }
    return this.bookingsService.closeRoom(roomId);
  }

  // POST /bookings/toggle-room/:roomId
  // Admin only: สลับสถานะเปิด/ปิดห้อง
  @Post('toggle-room/:roomId')
  @HttpCode(HttpStatus.OK)
  async toggleRoom(@Param('roomId') roomId: string, @Request() req) {
    if (!req.user.isAdmin) {
      throw new ConflictException('Only admin can manage room status');
    }
    return this.bookingsService.toggleRoom(roomId);
  }

  // GET /bookings/custom-rooms
  // Returns: CustomRoom[]
  @Get('custom-rooms')
  async getCustomRooms() {
    return this.bookingsService.getAllCustomRooms();
  }

  // POST /bookings/custom-rooms
  // Admin only: สร้างห้องพิเศษใหม่
  @Post('custom-rooms')
  @HttpCode(HttpStatus.CREATED)
  async createCustomRoom(
    @Body() body: { roomName: string; subtitle?: string },
    @Request() req,
  ) {
    if (!req.user.isAdmin) {
      throw new ConflictException('Only admin can create custom rooms');
    }
    if (!body.roomName || body.roomName.trim() === '') {
      throw new BadRequestException('roomName is required');
    }
    return this.bookingsService.createCustomRoom(
      body.roomName.trim(),
      body.subtitle?.trim(),
    );
  }

  // DELETE /bookings/custom-rooms/:roomId
  // Admin only: ลบห้องพิเศษ
  @Delete('custom-rooms/:roomId')
  @HttpCode(HttpStatus.OK)
  async deleteCustomRoom(@Param('roomId') roomId: string, @Request() req) {
    if (!req.user.isAdmin) {
      throw new ConflictException('Only admin can delete custom rooms');
    }
    return this.bookingsService.deleteCustomRoom(roomId);
  }

  // POST /bookings/reset-all
  // Admin only: Reset all bookings (ลบทุกการจองทั้งหมด)
  @Post('reset-all')
  @HttpCode(HttpStatus.OK)
  async resetAll(@Request() req) {
    if (!req.user.isAdmin) {
      throw new ConflictException('Only admin can reset all bookings');
    }
    return this.bookingsService.resetAll(true);
  }

  // ============================================
  // Booking Date Management Endpoints
  // ============================================

  // GET /bookings/dates - ดึงวันที่ทั้งหมดที่เพิ่มไว้
  @Get('dates')
  async getAllBookingDates() {
    const dates = await this.bookingsService.getAllBookingDates();
    return dates.map((date) => ({
      date: date.date,
      displayName: date.displayName,
    }));
  }

  // POST /bookings/dates - เพิ่มวันที่ใหม่ (Admin only)
  @Post('dates')
  @HttpCode(HttpStatus.CREATED)
  async addBookingDate(@Body() body: AddBookingDateDto, @Request() req) {
    if (!req.user.isAdmin) {
      throw new ConflictException('Only admin can add booking dates');
    }

    const bookingDate = await this.bookingsService.addBookingDate(
      body.date,
      body.displayName,
    );

    return {
      date: bookingDate.date,
      displayName: bookingDate.displayName,
    };
  }

  // DELETE /bookings/dates/:date - ลบวันที่ (Admin only)
  @Delete('dates/:date')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBookingDate(@Param('date') date: string, @Request() req) {
    if (!req.user.isAdmin) {
      throw new ConflictException('Only admin can remove booking dates');
    }

    await this.bookingsService.removeBookingDate(date);
    return { message: 'ลบวันที่สำเร็จ' };
  }

  // GET /bookings/export/excel - Export all bookings to Excel (Admin only)
  @Get('export/excel')
  async exportToExcel(@Res() res: Response, @Request() req) {
    if (!req.user.isAdmin) {
      throw new ConflictException('Only admin can export bookings');
    }

    const buffer = await this.bookingsService.exportToExcel();

    // ตั้งค่า Headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="bookings-export.xlsx"',
    );

    // ส่งไฟล์กลับไป
    res.send(buffer);
  }

  // ============================================
  // App Settings Endpoints
  // ============================================

  // GET /bookings/settings - ดึงการตั้งค่าของแอป
  @Get('settings')
  async getAppSettings() {
    return this.bookingsService.getAppSettings();
  }

  // PUT /bookings/settings - อัปเดตชื่องานแข่งขัน (Admin only)
  @Post('settings')
  @HttpCode(HttpStatus.OK)
  async updateContestName(
    @Body() body: { contestName: string },
    @Request() req,
  ) {
    if (!req.user.isAdmin) {
      throw new ConflictException('Only admin can update contest name');
    }
    if (!body.contestName || body.contestName.trim() === '') {
      throw new BadRequestException('contestName is required');
    }
    return this.bookingsService.updateContestName(body.contestName.trim());
  }
}
