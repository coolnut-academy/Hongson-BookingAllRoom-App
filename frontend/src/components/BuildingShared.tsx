import RoomCell from './RoomCell';
import type { RoomData } from './Room';
import type { BuildingData } from '../data/buildings';

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

interface BuildingSharedProps {
  building: BuildingData;
  bookings: BookingsMap;
  selections: SelectionsMap;
  onSelectSlot: (roomId: string, slot: 'am' | 'pm') => void;
  onBook: (roomId: string) => void;
  isAdmin?: boolean;
  onResetRoom?: (roomId: string) => void;
  closedRooms?: string[];
  onToggleRoom?: (roomId: string) => void;
}

// Shared component for Building3-6 (reusable)
export const BuildingShared: React.FC<BuildingSharedProps> = ({
  building,
  bookings,
  selections,
  onSelectSlot,
  onBook,
  isAdmin = false,
  onResetRoom,
  closedRooms = [],
  onToggleRoom,
}) => {

  const renderRoom = (room: RoomData) => {
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
        className={`room-cell ${room.colspan ? 'colspan' : ''} ${isRoomClosed ? 'room-closed' : ''}`}
        data-room-name={room.roomName}
      >
        <div className={`room-header ${isRoomClosed ? 'room-closed-header' : ''}`}>
          <strong>{room.roomName}</strong>
          {room.subtitle && <small>{room.subtitle}</small>}
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
  };

  return (
    <div className="container" id={building.id}>
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
    </div>
  );
};

