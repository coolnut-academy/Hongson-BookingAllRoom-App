import api from './api';

export interface BookingSelection {
  roomId: string;
  slot: 'am' | 'pm';
  bookedBy?: {
    username: string;
    displayName?: string;
  };
}

export interface CreateBookingDto {
  date: string;
  selections: BookingSelection[];
}

// Old interface for backward compatibility
export interface CreateSingleBookingDto {
  roomId: string;
  date: string;
  slot: 'am' | 'pm';
}

export interface Booking {
  _id: string;
  roomId: string;
  date: string;
  slot: 'am' | 'pm';
  bookedBy: {
    _id: string;
    username: string;
  };
}

export interface BookingStatus {
  [roomId: string]: {
    am?: boolean;
    pm?: boolean;
  };
}

export interface SummaryItem {
  building: string;
  date: string;
  available: number;
  booked: number;
  details: Array<{
    roomId: string;
    slot: string;
    bookedBy: {
      username: string;
      displayName?: string;
    };
  }>;
}

export interface BookingResponse {
  message: string;
  count: number;
  bookings: Array<{
    id: string;
    roomId: string;
    slot: string;
    date: string;
  }>;
}

export interface SummaryResponse {
  [date: string]: {
    [building: string]: {
      bookedSlots: number;
      availableSlots: number;
      bookedRooms: Array<{
        roomId: string;
        slot: string;
        bookedBy: string;
      }>;
      availableRooms: string[];
    };
  };
}

export const bookingService = {
  // Phase 2 API: Create multiple bookings
  async createBooking(booking: CreateBookingDto): Promise<BookingResponse> {
    const response = await api.post<BookingResponse>('/bookings', booking);
    return response.data;
  },

  // Get bookings for a specific date (Phase 2 API)
  async getBookings(date: string): Promise<BookingSelection[]> {
    const response = await api.get<BookingSelection[]>('/bookings', {
      params: { date },
    });
    return response.data;
  },

  // Get bookings with user details (includes displayName)
  async getBookingsWithDetails(date: string): Promise<BookingSelection[]> {
    const response = await api.get<BookingSelection[]>('/bookings/details', {
      params: { date },
    });
    return response.data;
  },

  // Get booking status (for backward compatibility)
  async getBookingStatus(date: string): Promise<BookingStatus> {
    const response = await api.get<BookingStatus>('/bookings/status', {
      params: { date },
    });
    return response.data;
  },

  // Phase 2 API: Get summary (no params needed)
  async getSummary(): Promise<SummaryResponse> {
    const response = await api.get<SummaryResponse>('/bookings/summary');
    return response.data;
  },

  async deleteBooking(id: string): Promise<void> {
    await api.delete(`/bookings/${id}`);
  },

  // Reset room: ลบทุกการจองในห้อง (Admin only)
  async resetRoom(roomId: string, date: string): Promise<{ message: string; deletedCount: number }> {
    const response = await api.post<{ message: string; deletedCount: number }>('/bookings/reset-room', {
      roomId,
      date,
    });
    return response.data;
  },

  // Get room status (closedRooms array)
  async getRoomStatus(): Promise<{ closedRooms: string[] }> {
    const response = await api.get<{ closedRooms: string[] }>('/bookings/room-status');
    return response.data;
  },

  // Open a room (Admin only)
  async openRoom(roomId: string): Promise<{ message: string; closedRooms: string[] }> {
    const response = await api.post<{ message: string; closedRooms: string[] }>(`/bookings/open-room/${roomId}`);
    return response.data;
  },

  // Close a room (Admin only)
  async closeRoom(roomId: string): Promise<{ message: string; closedRooms: string[] }> {
    const response = await api.post<{ message: string; closedRooms: string[] }>(`/bookings/close-room/${roomId}`);
    return response.data;
  },

  // Toggle room status (Admin only)
  async toggleRoom(roomId: string): Promise<{ message: string; isClosed: boolean; closedRooms: string[] }> {
    const response = await api.post<{ message: string; isClosed: boolean; closedRooms: string[] }>(`/bookings/toggle-room/${roomId}`);
    return response.data;
  },

  // Get all custom rooms
  async getCustomRooms(): Promise<Array<{ roomId: string; roomName: string; subtitle?: string }>> {
    const response = await api.get<Array<{ roomId: string; roomName: string; subtitle?: string }>>('/bookings/custom-rooms');
    return response.data;
  },

  // Create custom room (Admin only)
  async createCustomRoom(roomName: string, subtitle?: string): Promise<{ roomId: string; roomName: string; subtitle?: string }> {
    const response = await api.post<{ roomId: string; roomName: string; subtitle?: string }>('/bookings/custom-rooms', {
      roomName,
      subtitle,
    });
    return response.data;
  },

  // Delete custom room (Admin only)
  async deleteCustomRoom(roomId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/bookings/custom-rooms/${roomId}`);
    return response.data;
  },

  // Reset all bookings (Admin only)
  async resetAll(): Promise<{ message: string; deletedCount: number }> {
    const response = await api.post<{ message: string; deletedCount: number }>('/bookings/reset-all');
    return response.data;
  },
};

