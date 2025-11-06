import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { RoomStatus, RoomStatusSchema } from '../schemas/room-status.schema';
import { CustomRoom, CustomRoomSchema } from '../schemas/custom-room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: RoomStatus.name, schema: RoomStatusSchema },
      { name: CustomRoom.name, schema: CustomRoomSchema },
    ]),
  ],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
