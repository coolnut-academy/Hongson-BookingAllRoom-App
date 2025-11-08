import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: false }) // เปลี่ยนเป็น optional เพื่อรองรับ user เก่า
  name?: string;

  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ required: true })
  password: string; // เราจะ Hashing ใน Service

  @Prop({ default: false })
  isAdmin: boolean; // สำหรับ admin privileges

  @Prop()
  displayName?: string; // ชื่อที่แสดงผล (ภาษาไทย)

  // Timestamps are automatically added by Mongoose when timestamps: true
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
