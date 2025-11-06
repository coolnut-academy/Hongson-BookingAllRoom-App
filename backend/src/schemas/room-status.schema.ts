import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RoomStatus extends Document {
  // รายการ roomId ที่ถูกปิด (ไม่สามารถจองได้)
  @Prop({ type: [String], default: [] })
  closedRooms: string[];
}

export const RoomStatusSchema = SchemaFactory.createForClass(RoomStatus);

