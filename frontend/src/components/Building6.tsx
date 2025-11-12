import { useEffect, useRef, useState } from 'react';
import RoomCell from './RoomCell';
import { building6 } from '../data/buildings';
import type { RoomData } from './Room';
import type { Booking } from '../types/booking';
import './Building6.css';

type SelectionsMap = Record<string, { am?: boolean; pm?: boolean }>;
type BookingsByRoom = Record<string, Booking[]>;

interface Building6Props {
  bookingsByRoom: BookingsByRoom;
  selections: SelectionsMap;
  onSelectSlot: (roomId: string, slot: 'am' | 'pm') => void;
  onBook: (roomId: string) => void;
  isAdmin?: boolean;
  onResetRoom?: (roomId: string) => void;
  closedRooms?: string[];
  onToggleRoom?: (roomId: string) => void;
  onOpenDetails: (roomId: string) => void;
}

const Building6: React.FC<Building6Props> = ({
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
        onOpenDetails={() => onOpenDetails(room.roomId)}
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

    checkScrollable();
    window.addEventListener('resize', checkScrollable);

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
    <div className="container" ref={containerRef} id={building6.id}>
      <h1>{building6.title}</h1>
      {building6.subtitle && <h2>{building6.subtitle}</h2>}
      <table className="room-table">
        <tbody>
          {(building6.rooms as RoomData[][]).map((row, rowIndex) => (
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
        <div className="scroll-hint">เลื่อนเพื่อดูห้องเพิ่มเติม</div>
      )}
    </div>
  );
};

export default Building6;
