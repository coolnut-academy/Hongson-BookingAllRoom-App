import './Room.css';

export interface RoomData {
  roomId: string;
  roomName: string;
  subtitle?: string;
  isBlocked?: boolean;
  blockedType?: 'red' | 'blue' | 'green';
  colspan?: number;
}

interface RoomProps {
  room: RoomData;
  amSelected: boolean;
  pmSelected: boolean;
  amBooked: boolean;
  pmBooked: boolean;
  onSlotClick: (slot: 'am' | 'pm') => void;
  onBook: () => void;
  isDisabled?: boolean;
}

const Room: React.FC<RoomProps> = ({
  room,
  amSelected,
  pmSelected,
  amBooked,
  pmBooked,
  onSlotClick,
  onBook,
  isDisabled = false,
}) => {
  const canBook = !isDisabled && !room.isBlocked && (amSelected || pmSelected);

  return (
    <div
      className={`room-cell ${room.isBlocked ? 'blocked' : ''} ${room.colspan ? 'colspan' : ''}`}
      data-room-name={room.roomName}
      style={room.colspan ? { gridColumn: `span ${room.colspan}` } : {}}
    >
      <div
        className={`room-header ${room.isBlocked ? `blocked-${room.blockedType || 'red'}` : ''}`}
      >
        <strong>{room.roomName}</strong>
        {room.subtitle && <small>{room.subtitle}</small>}
      </div>
      <div className="room-slots">
        <div
          className={`slot slot-am ${room.isBlocked ? '' : amBooked ? 'booked' : 'available'} ${amSelected ? 'selected' : ''}`}
          data-slot="เช้า"
          onClick={() => !room.isBlocked && !amBooked && onSlotClick('am')}
        >
          <span>เช้า</span>
          <span className="status-icon">
            {room.isBlocked ? 'X' : amBooked ? '✓' : amSelected ? '✓' : '+'}
          </span>
        </div>
        <div
          className={`slot slot-pm ${room.isBlocked ? '' : pmBooked ? 'booked' : 'available'} ${pmSelected ? 'selected' : ''}`}
          data-slot="บ่าย"
          onClick={() => !room.isBlocked && !pmBooked && onSlotClick('pm')}
        >
          <span>บ่าย</span>
          <span className="status-icon">
            {room.isBlocked ? 'X' : pmBooked ? '✓' : pmSelected ? '✓' : '+'}
          </span>
        </div>
      </div>
      <div className="room-footer">
        <button
          className={`book-button ${room.isBlocked ? 'book-button-blocked' : ''}`}
          onClick={onBook}
          disabled={room.isBlocked || !canBook}
        >
          {room.isBlocked ? 'ห้องเต็ม' : 'จอง'}
        </button>
      </div>
    </div>
  );
};

export default Room;

