import React, { useEffect, useRef, useState } from 'react';
import RoomCell from './RoomCell';
import type { RoomData } from './Room';
import type { BuildingData } from '../data/buildings';
import type { Booking } from '../types/booking';

type SelectionsMap = Record<string, { am?: boolean; pm?: boolean }>;
type BookingsByRoom = Record<string, Booking[]>;

interface BuildingSharedProps {
  building: BuildingData;
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

// Shared component for Building3-6 (reusable)
export const BuildingShared: React.FC<BuildingSharedProps> = ({
  building,
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

  const renderRoom = (room: RoomData) => {
    const roomBookings = bookingsByRoom[room.roomId] || [];
    const selectedSlots = selections[room.roomId] || {};
    const isRoomClosed = closedRooms.includes(room.roomId);

    return (
      <RoomCell
        key={room.roomId}
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
        className={room.colspan ? 'colspan' : undefined}
      />
    );
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    const checkScrollable = () => {
      if (containerRef.current) {
        const hasHorizontalScroll = 
          containerRef.current.scrollWidth > containerRef.current.clientWidth;
        setShowScrollHint(hasHorizontalScroll);
      }
    };

    // ตรวจสอบเมื่อ component mount
    checkScrollable();

    // ตรวจสอบเมื่อ resize
    window.addEventListener('resize', checkScrollable);
    
    // ตรวจสอบเมื่อ scroll (ซ่อน hint เมื่อ scroll แล้ว)
    const handleScroll = () => {
      if (containerRef.current) {
        const scrolled = containerRef.current.scrollLeft > 0;
        if (scrolled) {
          setShowScrollHint(false);
        }
      }
    };

    const containerElement = containerRef.current;
    if (containerElement) {
      containerElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('resize', checkScrollable);
      if (containerElement) {
        containerElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div className="container" ref={containerRef} id={building.id}>
      <h1>{building.title}</h1>
      {building.subtitle && <h2>{building.subtitle}</h2>}
      <table className="room-table">
        <tbody>
          {(building.rooms as RoomData[][]).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((room) => (
                <td key={room.roomId} colSpan={room.colspan || 1}>
                  {renderRoom(room)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {showScrollHint && (
        <div className="scroll-hint">
          เลื่อนเพื่อดูห้องเพิ่มเติม
        </div>
      )}
    </div>
  );
};

