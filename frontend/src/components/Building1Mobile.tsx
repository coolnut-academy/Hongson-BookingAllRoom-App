import React from 'react';
import RoomCell from './RoomCell';
import type { Booking } from '../types/booking';
import './Building1Mobile.css';

type SelectionsMap = Record<string, { am?: boolean; pm?: boolean }>;
type BookingsByRoom = Record<string, Booking[]>;

interface Building1MobileProps {
  bookingsByRoom: BookingsByRoom;
  selections: SelectionsMap;
  onSelectSlot: (roomId: string, slot: 'am' | 'pm') => void;
  onBook: (roomId: string) => void;
  isAdmin?: boolean;
  onResetRoom?: (roomId: string) => void;
  closedRooms?: string[];
  onToggleRoom?: (roomId: string) => void;
  onOpenDetails: (booking: Booking) => void;
}

const Building1Mobile: React.FC<Building1MobileProps> = ({
  bookingsByRoom,
  selections,
  onSelectSlot,
  onBook,
  isAdmin = false,
  onResetRoom,
  closedRooms = [],
  onToggleRoom,
  onOpenDetails,
}) => {
  const rooms = [
    { roomId: '131', roomName: 'ห้อง 131' },
    {
      roomId: '132',
      roomName: 'ห้อง 132',
      subtitle: 'ห้องพักครู',
      isBlocked: true,
    },
    { roomId: '133', roomName: 'ห้อง 133' },
    {
      roomId: '134',
      roomName: 'ห้อง 134',
      subtitle: 'ห้องเก็บสารเคมี',
      isBlocked: true,
    },
    { roomId: '135', roomName: 'ห้อง 135' },
    { roomId: '136', roomName: 'ห้อง 136' },
    {
      roomId: '121',
      roomName: 'ห้อง 121',
      subtitle: 'ห้องธุรการ',
      isBlocked: true,
    },
    {
      roomId: '122',
      roomName: 'ห้อง 122',
      subtitle: 'ห้องการเงิน',
      isBlocked: true,
    },
    { roomId: '123', roomName: 'ห้อง 123' },
    {
      roomId: '124',
      roomName: 'ห้อง 124',
      subtitle: 'ห้องพักครู',
      isBlocked: true,
    },
    { roomId: '125', roomName: 'ห้อง 125' },
    { roomId: '126', roomName: 'ห้อง 126' },
    {
      roomId: '111',
      roomName: 'ห้อง 111',
      subtitle: 'ห้องแผนผัง',
      isBlocked: true,
    },
    {
      roomId: '112',
      roomName: 'ห้อง 112',
      subtitle: 'ห้องพักครู',
      isBlocked: true,
    },
    { roomId: '113', roomName: 'ห้อง 113' },
    {
      roomId: '114',
      roomName: 'ห้อง 114',
      subtitle: 'ห้องเก็บของ',
      isBlocked: true,
    },
    { roomId: '115', roomName: 'ห้อง 115' },
    { roomId: '116', roomName: 'ห้อง 116' },
  ];

  return (
    <div className="building-mobile-container">
      <h1>[ อาคาร 1 ] ผังการจองห้อง</h1>
      
      <div className="rooms-card-list">
        {rooms.map((room) => {
          const roomBookings = bookingsByRoom[room.roomId] || [];
          const selectedSlots = selections[room.roomId] || {};
          const isRoomClosed = closedRooms.includes(room.roomId);

          return (
            <div key={room.roomId} className="room-card">
              <RoomCell
                roomId={room.roomId}
                roomName={room.roomName}
                roomDetail={room.subtitle}
                bookings={roomBookings}
                selections={selectedSlots}
                isBookable={!isRoomClosed}
                onSelectSlot={(slot) => onSelectSlot(room.roomId, slot)}
                onBook={() => onBook(room.roomId)}
                onOpenDetails={onOpenDetails}
                isAdmin={isAdmin}
                onResetRoom={
                  onResetRoom ? () => onResetRoom(room.roomId) : undefined
                }
                onToggleRoom={
                  onToggleRoom ? () => onToggleRoom(room.roomId) : undefined
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Building1Mobile;

