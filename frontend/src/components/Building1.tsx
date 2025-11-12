/*
 * Building1 Component - Room Booking Display
 * 
 * Layout Strategy:
 * - ใช้ Table Layout แทน Grid Layout เพื่อให้สามารถ scroll แนวนอนได้
 * - จัดเรียงห้องเป็นแถวละ 6 ห้อง (roomsPerRow = 6)
 * - ใช้ Horizontal Scroll + Scroll Hint สำหรับ mobile/tablet
 * - PC: ให้ขยายเต็มหน้าจอ (no scrollbar)
 * 
 * Alternative Approaches (สำหรับอนาคต):
 * 1. Virtual Scrolling: หากมีห้องมาก (> 50 ห้อง) ควรใช้ react-window
 * 2. Card View on Mobile: แปลง table เป็น card list บน mobile เพื่อ UX ที่ดีกว่า
 * 3. Responsive Grid: ใช้ CSS Grid ที่ปรับจำนวนคอลัมน์ตามหน้าจอ (grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)))
 * 4. Pagination: แบ่งห้องเป็นหน้าๆ หากมีห้องมากเกินไป
 */

import { useEffect, useRef, useState } from 'react';
import RoomCell from './RoomCell';
import type { Booking } from '../types/booking';

type SelectionsMap = Record<string, { am?: boolean; pm?: boolean }>;
type BookingsByRoom = Record<string, Booking[]>;

interface Building1Props {
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

const Building1: React.FC<Building1Props> = ({
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

  // แปลง rooms array เป็น table rows (จัดเรียงเป็นแถวละ 6 ห้อง - 3 แถวเท่านั้น)
  const roomsPerRow = 6; // 6 ห้องต่อแถว = 3 แถว (18 ห้อง)
  const roomRows: (typeof rooms)[] = [];
  for (let i = 0; i < rooms.length; i += roomsPerRow) {
    roomRows.push(rooms.slice(i, i + roomsPerRow));
  }
  // ตรวจสอบให้แน่ใจว่ามีเพียง 3 แถวเท่านั้น
  if (roomRows.length > 3) {
    roomRows.splice(3); // ตัดแถวที่เกินออก
  }

  const renderRoom = (room: (typeof rooms)[number]) => {
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
      />
    );
  };

  // Table Layout (3 แถวเท่านั้น) - ใช้เหมือน Building2 ทุกกรณี
  return (
    <div className="container" ref={containerRef} id="building-1">
      <h1>[ อาคาร 1 ] ผังการจองห้อง</h1>
      <table className="room-table">
        <tbody>
          {roomRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((room) => (
                <td key={room.roomId}>
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

export default Building1;

