import { useState, useEffect } from 'react';
import { bookingService } from '../services/booking.service';
import './AdminRoomControl.css';

const AdminRoomControl: React.FC = () => {
  const [roomStatus, setRoomStatus] = useState<{ isSystemClosed: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadRoomStatus();
  }, []);

  const loadRoomStatus = async () => {
    try {
      const status = await bookingService.getRoomStatus();
      setRoomStatus(status);
    } catch (error) {
      console.error('Failed to load room status:', error);
      setMessage('ไม่สามารถโหลดสถานะห้องได้');
    }
  };

  const handleOpenAllRooms = async () => {
    if (!confirm('คุณต้องการเปิดทุกห้องให้สามารถจองได้หรือไม่?')) {
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const result = await bookingService.openAllRooms();
      setRoomStatus({ isSystemClosed: false });
      setMessage(result.message);
      // Reload status to ensure consistency
      await loadRoomStatus();
      setTimeout(() => setMessage(null), 3000);
      // Reload page to update all components
      window.location.reload();
    } catch (error) {
      if (error && typeof error === "object" && 'response' in error && error.response && typeof error.response === "object" && 'data' in error.response && error.response.data && typeof error.response.data === "object" && 'message' in error.response.data) {
        setMessage(error.response.data.message as string);
      } else {
        setMessage('เกิดข้อผิดพลาดในการเปิดห้อง');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAllRooms = async () => {
    if (!confirm('คุณต้องการปิดทุกห้องไม่ให้จองหรือไม่?')) {
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const result = await bookingService.closeAllRooms();
      setRoomStatus({ isSystemClosed: true });
      setMessage(result.message);
      // Reload status to ensure consistency
      await loadRoomStatus();
      setTimeout(() => setMessage(null), 3000);
      // Reload page to update all components
      window.location.reload();
    } catch (error) {
      if (error && typeof error === "object" && 'response' in error && error.response && typeof error.response === "object" && 'data' in error.response && error.response.data && typeof error.response.data === "object" && 'message' in error.response.data) {
        setMessage(error.response.data.message as string);
      } else {
        setMessage('เกิดข้อผิดพลาดในการปิดห้อง');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!roomStatus) {
    return <div className="admin-room-control loading">กำลังโหลด...</div>;
  }

  return (
    <div className="admin-room-control">
      <div className="admin-room-control-header">
        <h3>🔧 จัดการสถานะห้อง (Admin Only)</h3>
      </div>
      <div className="admin-room-control-content">
        <div className="room-status-display">
          <span className="status-label">สถานะปัจจุบัน:</span>
          <span className={`status-badge ${roomStatus.isSystemClosed ? 'closed' : 'open'}`}>
            {roomStatus.isSystemClosed ? '🔒 ปิดทุกห้อง' : '✅ เปิดทุกห้อง'}
          </span>
        </div>
        <div className="admin-room-control-actions">
          <button
            className="btn-open-all"
            onClick={handleOpenAllRooms}
            disabled={loading || !roomStatus.isSystemClosed}
          >
            เปิดทุกห้อง
          </button>
          <button
            className="btn-close-all"
            onClick={handleCloseAllRooms}
            disabled={loading || roomStatus.isSystemClosed}
          >
            ปิดทุกห้อง
          </button>
        </div>
        {message && (
          <div className={`admin-message ${roomStatus.isSystemClosed ? 'warning' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRoomControl;

