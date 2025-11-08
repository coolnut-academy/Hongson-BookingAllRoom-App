import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AppSettings extends Document {
  @Prop({ default: 'งานแข่งขัน' })
  contestName: string; // ชื่องานแข่งขัน
}

export const AppSettingsSchema = SchemaFactory.createForClass(AppSettings);

