import { useEffect, useRef, useState } from 'react';
import RoomCell from './RoomCell';
import './Building1.css';

type BookingsMap = Record<
  string,
  {
    am?: boolean;
    pm?: boolean;
    amBookedBy?: { username: string; displayName?: string };
    pmBookedBy?: { username: string; displayName?: string };
  }
>;
type SelectionsMap = Record<string, { am?: boolean; pm?: boolean }>;

interface Building1Props {
  bookings: BookingsMap;
  selections: SelectionsMap;
  onSelectSlot: (roomId: string, slot: 'am' | 'pm') => void;
  onBook: (roomId: string) => void;
  isAdmin?: boolean;
  onResetRoom?: (roomId: string) => void;
  closedRooms?: string[];
  onToggleRoom?: (roomId: string) => void;
}

const Building1: React.FC<Building1Props> = ({
  bookings,
  selections,
  onSelectSlot,
  onBook,
  isAdmin = false,
  onResetRoom,
  closedRooms = [],
  onToggleRoom,
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

  return (
    <div className="container" ref={containerRef} id="building-1">
      <h1>[ อาคาร 1 ] ผังการจองห้อง</h1>
      <div className="room-grid">
        {rooms.map((room) => {
          const bookedSlots = bookings[room.roomId] || {};
          const selectedSlots = selections[room.roomId] || {};
          const amBooked = bookedSlots.am || false;
          const pmBooked = bookedSlots.pm || false;
          const amSelected = selectedSlots.am || false;
          const pmSelected = selectedSlots.pm || false;
          const amBookedBy = bookedSlots.amBookedBy;
          const pmBookedBy = bookedSlots.pmBookedBy;
          // เช็คเฉพาะ closedRooms จาก API (ไม่เช็ค isBlocked เพราะ Admin สามารถเปิดได้)
          // ถ้า roomId ไม่อยู่ใน closedRooms แสดงว่าห้องเปิด แม้ isBlocked จะเป็น true
          const isRoomClosed = closedRooms.includes(room.roomId);

          return (
            <div
              key={room.roomId}
              className={`room-cell ${isRoomClosed ? 'room-closed' : ''}`}
              data-room-name={room.roomName}
            >
              <div className={`room-header ${isRoomClosed ? 'room-closed-header' : ''}`}>
                <strong>{room.roomName}</strong>
                {isAdmin && onToggleRoom && (
                  <button
                    className={`room-toggle-btn ${isRoomClosed ? 'closed' : 'open'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleRoom(room.roomId);
                    }}
                    title={isRoomClosed ? 'คลิกเพื่อเปิดห้อง' : 'คลิกเพื่อปิดห้อง'}
                  >
                    {isRoomClosed ? '🔒' : '🔓'}
                  </button>
                )}
              </div>
              <div className="room-slots">
                <RoomCell
                  slot="am"
                  isSelected={amSelected}
                  isBooked={amBooked}
                  bookedBy={amBookedBy}
                  onClick={() => !isRoomClosed && onSelectSlot(room.roomId, 'am')}
                  isDisabled={isRoomClosed}
                />
                <RoomCell
                  slot="pm"
                  isSelected={pmSelected}
                  isBooked={pmBooked}
                  bookedBy={pmBookedBy}
                  onClick={() => !isRoomClosed && onSelectSlot(room.roomId, 'pm')}
                  isDisabled={isRoomClosed}
                />
              </div>
              <div className="room-footer">
                <button
                  className={`book-button ${isRoomClosed ? 'book-button-blocked' : ''}`}
                  onClick={() => onBook(room.roomId)}
                  disabled={isRoomClosed || (!amSelected && !pmSelected)}
                >
                  {isRoomClosed ? 'ห้องปิด' : 'จอง'}
                </button>
                {isAdmin && (amBooked || pmBooked) && onResetRoom && (
                  <button
                    className="reset-button"
                    onClick={() => onResetRoom(room.roomId)}
                    title="Reset การจองในห้องนี้ (Admin only)"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {showScrollHint && (
        <div className="scroll-hint">
          เลื่อนเพื่อดูห้องเพิ่มเติม
        </div>
      )}
    </div>
  );
};

export default Building1;

