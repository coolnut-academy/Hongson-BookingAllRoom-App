import { Model } from 'mongoose';
import { Booking } from '../schemas/booking.schema';
interface BookingSelection {
    roomId: string;
    slot: 'am' | 'pm';
}
export declare class BookingsService {
    private bookingModel;
    constructor(bookingModel: Model<Booking>);
    create(roomId: string, date: Date, slot: string, userId: string): Promise<import("mongoose").Document<unknown, {}, Booking, {}, {}> & Booking & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    createMultiple(date: string, selections: BookingSelection[], userId: string, userIdForBooking?: string): Promise<{
        message: string;
        count: number;
        bookings: {
            id: unknown;
            roomId: string;
            slot: "am" | "pm";
            date: Date;
        }[];
    }>;
    getBookingsByDate(date: string): Promise<{
        roomId: string;
        slot: string;
    }[]>;
    getBookingsWithDetails(date: string): Promise<{
        roomId: string;
        slot: string;
        bookedBy: {
            username: string;
            displayName: string;
        } | null;
    }[]>;
    findByDate(date: Date): Promise<(import("mongoose").Document<unknown, {}, Booking, {}, {}> & Booking & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    getBookingStatus(date: Date): Promise<Record<string, {
        am?: boolean;
        pm?: boolean;
    }>>;
    getSummary(startDate: Date, endDate: Date): Promise<any[]>;
    getSummaryFormatted(): Promise<Record<string, Record<string, {
        bookedSlots: number;
        availableSlots: number;
        bookedRooms: Array<{
            roomId: string;
            slot: string;
            bookedBy: string;
        }>;
        availableRooms: string[];
    }>>>;
    private getBuildingKeyFromRoomId;
    delete(bookingId: string, userId: string, isAdmin?: boolean): Promise<(import("mongoose").Document<unknown, {}, Booking, {}, {}> & Booking & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    resetRoom(roomId: string, date: string, isAdmin: boolean): Promise<{
        message: string;
        deletedCount: number;
    }>;
    private getBuildingFromRoomId;
}
export {};
