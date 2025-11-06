import { useState, useEffect } from 'react';
import Room from './Room';
import type { RoomData } from './Room';
import type { BuildingData } from '../data/buildings';
import type { BookingStatus } from '../services/booking.service';
import './Building.css';

interface BuildingProps {
  building: BuildingData;
  bookingStatus: BookingStatus;
  selectedDate: string;
  onSlotClick: (roomId: string, slot: 'am' | 'pm') => void;
  onBook: (roomId: string, slots: ('am' | 'pm')[]) => void;
}

const Building: React.FC<BuildingProps> = ({
  building,
  bookingStatus,
  selectedDate,
  onSlotClick,
  onBook,
}) => {
  const [selectedSlots, setSelectedSlots] = useState<Record<string, { am: boolean; pm: boolean }>>({});

  useEffect(() => {
    // Reset selections when date changes
    setSelectedSlots({});
  }, [selectedDate]);

  const handleSlotClick = (roomId: string, slot: 'am' | 'pm') => {
    setSelectedSlots((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [slot]: !prev[roomId]?.[slot],
      },
    }));
    onSlotClick(roomId, slot);
  };

  const handleBook = (room: RoomData) => {
    const slots: ('am' | 'pm')[] = [];
    if (selectedSlots[room.roomId]?.am) slots.push('am');
    if (selectedSlots[room.roomId]?.pm) slots.push('pm');
    
    if (slots.length > 0) {
      onBook(room.roomId, slots);
      setSelectedSlots((prev) => ({
        ...prev,
        [room.roomId]: { am: false, pm: false },
      }));
    }
  };

  const renderRoom = (room: RoomData) => {
    const amBooked = bookingStatus[room.roomId]?.am || false;
    const pmBooked = bookingStatus[room.roomId]?.pm || false;
    const amSelected = selectedSlots[room.roomId]?.am || false;
    const pmSelected = selectedSlots[room.roomId]?.pm || false;

    return (
      <Room
        key={room.roomId}
        room={room}
        amSelected={amSelected}
        pmSelected={pmSelected}
        amBooked={amBooked}
        pmBooked={pmBooked}
        onSlotClick={(slot) => handleSlotClick(room.roomId, slot)}
        onBook={() => handleBook(room)}
      />
    );
  };

  if (building.layout === 'grid') {
    return (
      <div className="container" id={building.id}>
        <h1>{building.title}</h1>
        {building.subtitle && <h2>{building.subtitle}</h2>}
        <div className="room-grid" style={{ gridTemplateColumns: `repeat(${building.columns || 6}, 1fr)` }}>
          {building.rooms.map((room) => {
            const r = room as RoomData;
            return renderRoom(r);
          })}
        </div>
      </div>
    );
  }

  // Table layout
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

export default Building;

