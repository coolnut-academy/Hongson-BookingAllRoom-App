export interface BookingUser {
  _id: string;
  name: string;
  username: string;
}

export interface Booking {
  _id: string;
  roomId: string;
  date: string;
  slot: 'am' | 'pm';
  details: string;
  bookedBy: BookingUser;
  createdAt: string;
}

