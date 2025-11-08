import React from 'react';
import RoomCell from './RoomCell';
import './Building1Mobile.css';

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

interface Building1MobileProps {
  bookings: BookingsMap;
  selections: SelectionsMap;
  onSelectSlot: (roomId: string, slot: 'am' | 'pm') => void;
  onBook: (roomId: string) => void;
  isAdmin?: boolean;
  onResetRoom?: (roomId: string) => void;
  closedRooms?: string[];
  onToggleRoom?: (roomId: string) => void;
}

const Building1Mobile: React.FC<Building1MobileProps> = ({
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

  return (
    <div className="building-mobile-container">
      <h1>[ อาคาร 1 ] ผังการจองห้อง</h1>
      
      <div className="rooms-card-list">
        {rooms.map((room) => {
          const bookedSlots = bookings[room.roomId] || {};
          const selectedSlots = selections[room.roomId] || {};
          const amBooked = bookedSlots.am || false;
          const pmBooked = bookedSlots.pm || false;
          const amSelected = selectedSlots.am || false;
          const pmSelected = selectedSlots.pm || false;
          const amBookedBy = bookedSlots.amBookedBy;
          const pmBookedBy = bookedSlots.pmBookedBy;
          const isRoomClosed = closedRooms.includes(room.roomId);

          return (
            <div key={room.roomId} className="room-card">
              <div className="room-card-header">
                <h3>{room.roomName}</h3>
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

              <div className="room-card-slots">
                <div className="slot-section">
                  <label>เช้า (AM)</label>
                  <RoomCell
                    slot="am"
                    isSelected={amSelected}
                    isBooked={amBooked}
                    bookedBy={amBookedBy}
                    onClick={() => !isRoomClosed && onSelectSlot(room.roomId, 'am')}
                    isDisabled={isRoomClosed}
                  />
                </div>
                <div className="slot-section">
                  <label>บ่าย (PM)</label>
                  <RoomCell
                    slot="pm"
                    isSelected={pmSelected}
                    isBooked={pmBooked}
                    bookedBy={pmBookedBy}
                    onClick={() => !isRoomClosed && onSelectSlot(room.roomId, 'pm')}
                    isDisabled={isRoomClosed}
                  />
                </div>
              </div>

              <div className="room-card-actions">
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
    </div>
  );
};

export default Building1Mobile;

