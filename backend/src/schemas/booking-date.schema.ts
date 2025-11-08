import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BookingDate extends Document {
  @Prop({ required: true, unique: true, index: true })
  date: string; // ISO date string เช่น "2025-12-24"

  @Prop({ required: true })
  displayName: string; // ชื่อที่แสดง เช่น "จอง 24 ธ.ค. 68"

  @Prop({ default: true })
  isActive: boolean; // สำหรับ soft delete
}

export const BookingDateSchema = SchemaFactory.createForClass(BookingDate);
