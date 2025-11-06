import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CustomRoom extends Document {
  @Prop({ required: true, unique: true })
  roomId: string; // เช่น "custom-1", "custom-2"

  @Prop({ required: true })
  roomName: string; // ชื่อห้องที่ Admin ตั้ง

  @Prop()
  subtitle?: string; // คำอธิบายเพิ่มเติม (optional)
}

export const CustomRoomSchema = SchemaFactory.createForClass(CustomRoom);

