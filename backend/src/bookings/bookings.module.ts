import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { RoomStatus, RoomStatusSchema } from '../schemas/room-status.schema';
import { CustomRoom, CustomRoomSchema } from '../schemas/custom-room.schema';
import { BookingDate, BookingDateSchema } from '../schemas/booking-date.schema';
import { AppSettings, AppSettingsSchema } from '../schemas/app-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: RoomStatus.name, schema: RoomStatusSchema },
      { name: CustomRoom.name, schema: CustomRoomSchema },
      { name: BookingDate.name, schema: BookingDateSchema },
      { name: AppSettings.name, schema: AppSettingsSchema },
    ]),
  ],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
