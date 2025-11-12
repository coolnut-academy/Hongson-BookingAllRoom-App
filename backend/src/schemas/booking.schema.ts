import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ required: true })
  roomId: string; // เช่น "131", "A4", "ห้อง FABLAB"

  // [สำคัญ] ใช้เก็บวันที่ "2025-12-22" หรือ "2025-12-23"
  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ required: true, enum: ['am', 'pm'] })
  slot: string; // 'am' (เช้า) หรือ 'pm' (บ่าย)

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  bookedBy: User;

  // --- [เพิ่มใหม่] ---
  @Prop({ type: String, default: '' })
  details: string; // สำหรับเก็บชื่อการแข่งขัน
  // --- [สิ้นสุดส่วนที่เพิ่ม] ---
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
