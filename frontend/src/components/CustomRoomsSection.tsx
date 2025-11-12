import { useState, useEffect } from 'react';
import { bookingService } from '../services/booking.service';
import RoomCell from './RoomCell';
import './CustomRoomsSection.css';
import type { Booking } from '../types/booking';

interface CustomRoom {
  roomId: string;
  roomName: string;
  subtitle?: string;
}

interface CustomRoomsSectionProps {
  bookingsByRoom: Record<string, Booking[]>;
  selections: Record<string, { am?: boolean; pm?: boolean }>;
  onSelectSlot: (roomId: string, slot: 'am' | 'pm') => void;
  onBook: (roomId: string) => void;
  isAdmin?: boolean;
  closedRooms?: string[];
  onToggleRoom?: (roomId: string) => void;
  onResetRoom?: (roomId: string) => void;
  onRoomCreated?: () => void;
  onOpenDetails: (roomId: string) => void;
}

const CustomRoomsSection: React.FC<CustomRoomsSectionProps> = ({
  bookingsByRoom,
  selections,
  onSelectSlot,
  onBook,
  isAdmin = false,
  closedRooms = [],
  onToggleRoom,
  onResetRoom,
  onRoomCreated,
  onOpenDetails,
}) => {
  const [customRooms, setCustomRooms] = useState<CustomRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomSubtitle, setNewRoomSubtitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCustomRooms();
  }, []);

  const loadCustomRooms = async () => {
    try {
      setLoading(true);
      const rooms = await bookingService.getCustomRooms();
      setCustomRooms(rooms);
    } catch (error) {
      console.error('Failed to load custom rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      alert('กรุณากรอกชื่อห้อง');
      return;
    }

    try {
      setCreating(true);
      await bookingService.createCustomRoom(newRoomName.trim(), newRoomSubtitle.trim() || undefined);
      setNewRoomName('');
      setNewRoomSubtitle('');
      setShowCreateModal(false);
      await loadCustomRooms();
      if (onRoomCreated) {
        onRoomCreated();
      }
      // Dispatch event เพื่อให้ SummaryView อัปเดต
      window.dispatchEvent(new Event('roomStatusChanged'));
    } catch (error) {
      if (error && typeof error === "object" && 'response' in error && error.response && typeof error.response === "object" && 'data' in error.response && error.response.data && typeof error.response.data === "object" && 'message' in error.response.data) {
        alert(error.response.data.message);
      } else {
        alert('เกิดข้อผิดพลาดในการสร้างห้อง');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm(`คุณต้องการลบห้อง ${roomId} หรือไม่?`)) {
      return;
    }

    try {
      await bookingService.deleteCustomRoom(roomId);
      await loadCustomRooms();
      // Dispatch event เพื่อให้ SummaryView อัปเดต
      window.dispatchEvent(new Event('roomStatusChanged'));
    } catch (error) {
      if (error && typeof error === "object" && 'response' in error && error.response && typeof error.response === "object" && 'data' in error.response && error.response.data && typeof error.response.data === "object" && 'message' in error.response.data) {
        alert(error.response.data.message);
      } else {
        alert('เกิดข้อผิดพลาดในการลบห้อง');
      }
    }
  };

  if (loading) {
    return <div className="custom-rooms-loading">กำลังโหลด...</div>;
  }

  return (
    <>
      <div className="custom-rooms-section">
        <div className="custom-rooms-header">
          <h2>ห้องพิเศษ</h2>
          {isAdmin && (
            <button
              className="add-room-btn"
              onClick={() => setShowCreateModal(true)}
              title="เพิ่มห้องพิเศษ"
            >
              ➕ เพิ่มห้อง
            </button>
          )}
        </div>

        {customRooms.length === 0 ? (
          <div className="no-custom-rooms">
            {isAdmin ? 'ยังไม่มีห้องพิเศษ กดปุ่ม "เพิ่มห้อง" เพื่อสร้าง' : 'ยังไม่มีห้องพิเศษ'}
          </div>
        ) : (
          <div className="custom-rooms-grid">
            {customRooms.map((room) => {
              const roomBookings = bookingsByRoom[room.roomId] || [];
              const selectedSlots = selections[room.roomId] || {};
              const isRoomClosed = closedRooms.includes(room.roomId);
              const headerActions =
                isAdmin && (
                  <button
                    className="delete-room-btn"
                    onClick={() => handleDeleteRoom(room.roomId)}
                    title="ลบห้อง"
                  >
                    🗑️
                  </button>
                );

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
                  headerActions={headerActions}
                />
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>สร้างห้องพิเศษใหม่</h3>
            <div className="form-group">
              <label>
                ชื่อห้อง <span className="required">*</span>
              </label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="เช่น ห้องประชุมพิเศษ"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>คำอธิบาย (ไม่บังคับ)</label>
              <input
                type="text"
                value={newRoomSubtitle}
                onChange={(e) => setNewRoomSubtitle(e.target.value)}
                placeholder="เช่น ห้องประชุมขนาดเล็ก"
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewRoomName('');
                  setNewRoomSubtitle('');
                }}
                disabled={creating}
              >
                ยกเลิก
              </button>
              <button
                className="btn-confirm"
                onClick={handleCreateRoom}
                disabled={creating || !newRoomName.trim()}
              >
                {creating ? 'กำลังสร้าง...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomRoomsSection;

