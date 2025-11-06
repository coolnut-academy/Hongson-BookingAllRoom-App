import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ required: true })
  password: string; // เราจะ Hashing ใน Service

  @Prop({ default: false })
  isAdmin: boolean; // สำหรับ admin privileges

  @Prop()
  displayName?: string; // ชื่อที่แสดงผล (ภาษาไทย)
}

export const UserSchema = SchemaFactory.createForClass(User);
