import { BookingsService } from './bookings.service';
export declare class BookingSelectionDto {
    roomId: string;
    slot: 'am' | 'pm';
}
export declare class CreateBookingDto {
    date: string;
    selections: BookingSelectionDto[];
    userIdForBooking?: string;
}
export declare class BookingsController {
    private bookingsService;
    constructor(bookingsService: BookingsService);
    getBookings(date: string): Promise<{
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
    create(createBookingDto: CreateBookingDto, req: any): Promise<{
        message: string;
        count: number;
        bookings: {
            id: unknown;
            roomId: string;
            slot: "am" | "pm";
            date: Date;
        }[];
    }>;
    getSummary(): Promise<Record<string, Record<string, {
        bookedSlots: number;
        availableSlots: number;
        bookedRooms: {
            roomId: string;
            slot: string;
            bookedBy: string;
        }[];
        availableRooms: string[];
    }>>>;
    getStatus(date: string): Promise<Record<string, {
        am?: boolean;
        pm?: boolean;
    }>>;
    delete(id: string, req: any): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/booking.schema").Booking, {}, {}> & import("../schemas/booking.schema").Booking & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    resetRoom(body: {
        roomId: string;
        date: string;
    }, req: any): Promise<{
        message: string;
        deletedCount: number;
    }>;
}
