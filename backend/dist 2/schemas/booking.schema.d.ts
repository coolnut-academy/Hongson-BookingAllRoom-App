import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';
export declare class Booking extends Document {
    roomId: string;
    date: Date;
    slot: string;
    bookedBy: User;
}
export declare const BookingSchema: mongoose.Schema<Booking, mongoose.Model<Booking, any, any, any, Document<unknown, any, Booking, any, {}> & Booking & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Booking, Document<unknown, {}, mongoose.FlatRecord<Booking>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<Booking> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
