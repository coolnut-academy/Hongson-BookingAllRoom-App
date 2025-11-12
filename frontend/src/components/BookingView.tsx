import { useState, useEffect, useCallback, useMemo } from 'react';
import Building1 from './Building1';
import Building2 from './Building2';
import Building3 from './Building3';
import Building4 from './Building4';
import Building5 from './Building5';
import Building6 from './Building6';
import CustomRoomsSection from './CustomRoomsSection';
import ConfirmBookingModal from './ConfirmBookingModal';
import ConfirmResetAllModal from './ConfirmResetAllModal';
import { bookingService } from '../services/booking.service';
import type { BookingSelection } from '../services/booking.service';
import type { Booking } from '../types/booking';
import { useAuth } from '../contexts/AuthContext';
import './BookingView.css';
import './AdminUserManagement.css';

interface BookingViewProps {
  date: string;
}

type SelectionsMap = Record<string, { am?: boolean; pm?: boolean }>;
type BookingsByRoom = Record<string, Booking[]>;

const BookingView: React.FC<BookingViewProps> = ({ date }) => {
  const { isAdmin } = useAuth();

  // State: bookings (ข้อมูลที่จองแล้วจาก API)
  const [bookings, setBookings] = useState<Booking[]>([]);

  // State: selections (ข้อมูลที่ผู้ใช้กำลังเลือก)
  const [selections, setSelections] = useState<SelectionsMap>({});

  // State: room status (รายการห้องที่ปิด)
  const [closedRooms, setClosedRooms] = useState<string[]>([]);

  // State: ชื่องานแข่งขัน
  const [contestName, setContestName] = useState<string>('');

  const [loading, setLoading] = useState(true);

  // State: modal รายละเอียด
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [currentDetails, setCurrentDetails] = useState<string>('');

  // State: confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<{
    roomId: string;
    slots: BookingSelection[];
  } | null>(null);

  // State: Reset All modal
  const [showResetAllModal, setShowResetAllModal] = useState(false);

  // Load room status
  const loadRoomStatus = useCallback(async () => {
    try {
      const status = await bookingService.getRoomStatus();
      setClosedRooms(status.closedRooms || []);
    } catch (error) {
      console.error('Failed to load room status:', error);
    }
  }, []);

  // Load contest name
  const loadContestName = useCallback(async () => {
    try {
      const settings = await bookingService.getAppSettings();
      setContestName(settings.contestName || '');
    } catch (error) {
      console.error('Failed to load contest name:', error);
    }
  }, []);

  // โหลดข้อมูลการจองทั้งหมดของวันที่ระบุ
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookingsByDate(date);
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  // useEffect: เมื่อ props.date เปลี่ยน
  useEffect(() => {
    fetchBookings();
    loadRoomStatus();
    loadContestName();
    // เคลียร์ selections ทั้งหมดเมื่อเปลี่ยนวัน
    setSelections({});
    setIsDetailModalOpen(false);
    setCurrentRoomId('');
    setCurrentDetails('');
  }, [date, fetchBookings, loadRoomStatus, loadContestName]);

  // Listen for contest name updates
  useEffect(() => {
    const handleContestNameUpdate = () => {
      loadContestName();
    };
    window.addEventListener('contestNameUpdated', handleContestNameUpdate);
    return () => {
      window.removeEventListener('contestNameUpdated', handleContestNameUpdate);
    };
  }, [loadContestName]);

  const bookingsByRoom = useMemo<BookingsByRoom>(() => {
    const map: BookingsByRoom = {};
    bookings.forEach((booking) => {
      if (!map[booking.roomId]) {
        map[booking.roomId] = [];
      }
      map[booking.roomId].push(booking);
    });
    return map;
  }, [bookings]);

  // Handler: เมื่อเลือก slot
  const handleSelectSlot = (roomId: string, slot: 'am' | 'pm') => {
    setSelections((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [slot]: !prev[roomId]?.[slot],
      },
    }));
  };

  // ฟังก์ชันสำหรับเปิด Modal (ส่งไปให้ RoomCell)
  const handleOpenDetails = (roomId: string) => {
    // หา booking อันไหนก็ได้ (am หรือ pm) ของห้องนี้ เพื่อดึงรายละเอียดปัจจุบัน
    const existingBooking = bookings.find((b) => b.roomId === roomId);

    setCurrentRoomId(roomId);
    setCurrentDetails(existingBooking?.details || ''); // (ดึงรายละเอียดเก่ามาแสดง)
    setIsDetailModalOpen(true);
  };

  // ฟังก์ชันสำหรับ Save Modal
  const handleSaveDetails = async () => {
    if (!currentRoomId) return;

    try {
      await bookingService.updateGroupDetails({
        roomId: currentRoomId,
        date: date, // (ใช้วันที่จาก Prop)
        details: currentDetails,
      });
      setIsDetailModalOpen(false);
      await fetchBookings(); // Refresh ข้อมูลทั้งหมด
    } catch (error) {
      console.error('Failed to save details', error);
      alert('Failed to save details. See console.');
    }
  };


  // Handler: เมื่อกดปุ่มจอง (แสดง confirmation modal)
  const handleBook = (roomId: string) => {
    // ตรวจสอบสถานะห้อง (ถ้าไม่ใช่ admin)
    if (!isAdmin && closedRooms.includes(roomId)) {
      alert(`ห้อง ${roomId} ถูกปิดการจอง กรุณาติดต่อผู้ดูแลระบบ`);
      return;
    }

    const roomSelections = selections[roomId];
    if (!roomSelections || (!roomSelections.am && !roomSelections.pm)) {
      alert('กรุณาเลือกช่วงเวลา (เช้า/บ่าย) ที่ต้องการจองก่อน');
      return;
    }

    const slots: BookingSelection[] = [];
    if (roomSelections.am) slots.push({ roomId, slot: 'am' });
    if (roomSelections.pm) slots.push({ roomId, slot: 'pm' });

    // เก็บข้อมูลการจองและแสดง modal
    setPendingBooking({ roomId, slots });
    setShowConfirmModal(true);
  };

  // Handler: ยืนยันการจอง
  const handleConfirmBooking = async () => {
    if (!pendingBooking) return;

    try {
      await bookingService.createBooking({
        date,
        selections: pendingBooking.slots,
      });
      alert(
        `จองสำเร็จ: ${pendingBooking.roomId} - ${pendingBooking.slots.map((s) => (s.slot === 'am' ? 'เช้า' : 'บ่าย')).join(', ')}`,
      );

      // เคลียร์ selections ของห้องนี้
      setSelections((prev) => ({
        ...prev,
        [pendingBooking.roomId]: { am: false, pm: false },
      }));

      // ปิด modal และ reload bookings
      setShowConfirmModal(false);
      setPendingBooking(null);
      await fetchBookings();
      await loadRoomStatus();
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
      ) {
        alert(error.response.data.message);
      } else {
        alert('เกิดข้อผิดพลาดในการจอง');
      }
      setShowConfirmModal(false);
      setPendingBooking(null);
    }
  };

  // Handler: ยกเลิกการจอง
  const handleCancelBooking = () => {
    setShowConfirmModal(false);
    setPendingBooking(null);
  };

  // Handler: Reset room (Admin only)
  const handleResetRoom = async (roomId: string) => {
    if (!isAdmin) {
      alert('คุณไม่มีสิทธิ์ในการ reset ห้อง');
      return;
    }

    const dateObjForDisplay = new Date(date);
    const dateDisplayText = dateObjForDisplay.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!confirm(`คุณต้องการ reset การจองห้อง ${roomId} ในวันที่ ${dateDisplayText} หรือไม่?`)) {
      return;
    }

    try {
      const result = await bookingService.resetRoom(roomId, date);
      alert(`Reset สำเร็จ: ลบการจอง ${result.deletedCount} รายการ`);
      await fetchBookings();
    } catch (error) {
      if (error && typeof error === "object" && 'response' in error && error.response && typeof error.response === "object" && 'data' in error.response && error.response.data && typeof error.response.data === "object" && 'message' in error.response.data) {
        alert(error.response.data.message);
      } else {
        alert('เกิดข้อผิดพลาดในการ reset');
      }
    }
  };

  if (loading) {
    return <div className="loading">กำลังโหลด...</div>;
  }

  // Format date for display
  const dateObj = new Date(date);
  const dateDisplay = dateObj.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Handler: Toggle room status (Admin only)
  const handleToggleRoom = async (roomId: string) => {
    if (!isAdmin) return;

    try {
      const result = await bookingService.toggleRoom(roomId);
      // อัปเดต closedRooms จาก API response
      setClosedRooms(result.closedRooms);
      // Reload room status เพื่อให้แน่ใจว่าข้อมูลตรงกัน
      await loadRoomStatus();
      // Reload bookings to update UI
      await fetchBookings();
      // Dispatch event เพื่อให้ SummaryView อัปเดต
      window.dispatchEvent(new Event('roomStatusChanged'));
    } catch (error) {
      if (error && typeof error === "object" && 'response' in error && error.response && typeof error.response === "object" && 'data' in error.response && error.response.data && typeof error.response.data === "object" && 'message' in error.response.data) {
        alert(error.response.data.message);
      } else {
        alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะห้อง');
      }
    }
  };

  // Handler: Reset All (Admin only) - แสดง modal ยืนยัน
  const handleResetAllClick = () => {
    if (!isAdmin) {
      alert('คุณไม่มีสิทธิ์ในการ reset การจองทั้งหมด');
      return;
    }
    setShowResetAllModal(true);
  };

  // Handler: ยืนยัน Reset All
  const handleConfirmResetAll = async () => {
    if (!isAdmin) return;

    try {
      const result = await bookingService.resetAll();
      alert(`Reset All สำเร็จ: ลบการจอง ${result.deletedCount} รายการ`);
      setShowResetAllModal(false);
      await fetchBookings();
      // Dispatch event เพื่อให้ SummaryView อัปเดต
      window.dispatchEvent(new Event('roomStatusChanged'));
    } catch (error) {
      if (error && typeof error === "object" && 'response' in error && error.response && typeof error.response === "object" && 'data' in error.response && error.response.data && typeof error.response.data === "object" && 'message' in error.response.data) {
        alert(error.response.data.message);
      } else {
        alert('เกิดข้อผิดพลาดในการ Reset All');
      }
      setShowResetAllModal(false);
    }
  };

  // Handler: ยกเลิก Reset All
  const handleCancelResetAll = () => {
    setShowResetAllModal(false);
  };

  // สร้าง buildingProps ที่มี props ทั้งหมดที่จำเป็น
  const buildingProps = {
    bookingsByRoom,
    selections,
    onSelectSlot: handleSelectSlot,
    onBook: handleBook,
    isAdmin,
    onResetRoom: handleResetRoom,
    closedRooms,
    onToggleRoom: handleToggleRoom,
    onOpenDetails: handleOpenDetails,
  };

  return (
    <>
      <div id="booking-view">
        {/* แสดงชื่องานแข่งขันตรงกลางบนสุด */}
        {contestName && (
          <div
            style={{
              textAlign: 'center',
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#e7f3ff',
              borderRadius: '8px',
              border: '2px solid #0d6efd',
            }}
          >
            <h2
              style={{
                margin: 0,
                color: '#0d6efd',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              {contestName}
            </h2>
          </div>
        )}
        <div className="booking-header">
          <h1>การจองอาคาร ในวันที่ {dateDisplay}</h1>
          {isAdmin && (
            <button
              className="reset-all-button"
              onClick={handleResetAllClick}
              title="Reset การจองทั้งหมด (Admin only)"
            >
              🔄 Reset All
            </button>
          )}
        </div>
        {isAdmin && closedRooms.length > 0 && (
          <div className="admin-notice">
            ℹ️ มีห้องที่ปิดอยู่ {closedRooms.length} ห้อง: {closedRooms.join(', ')}
          </div>
        )}
        {/* อาคาร 1 */}
        <Building1 
          bookingsByRoom={bookingsByRoom}
          selections={selections}
          onOpenDetails={handleOpenDetails}
          onSelectSlot={handleSelectSlot}
          onBook={handleBook}
          isAdmin={isAdmin}
          onResetRoom={handleResetRoom}
          closedRooms={closedRooms}
          onToggleRoom={handleToggleRoom}
        />
        {/* อาคาร 2 */}
        <Building2 
          bookingsByRoom={bookingsByRoom}
          selections={selections}
          onOpenDetails={handleOpenDetails}
          onSelectSlot={handleSelectSlot}
          onBook={handleBook}
          isAdmin={isAdmin}
          onResetRoom={handleResetRoom}
          closedRooms={closedRooms}
          onToggleRoom={handleToggleRoom}
        />
        {/* อาคาร 3 */}
        <Building3 
          bookingsByRoom={bookingsByRoom}
          selections={selections}
          onOpenDetails={handleOpenDetails}
          onSelectSlot={handleSelectSlot}
          onBook={handleBook}
          isAdmin={isAdmin}
          onResetRoom={handleResetRoom}
          closedRooms={closedRooms}
          onToggleRoom={handleToggleRoom}
        />
        {/* อาคาร 4 */}
        <Building4 
          bookingsByRoom={bookingsByRoom}
          selections={selections}
          onOpenDetails={handleOpenDetails}
          onSelectSlot={handleSelectSlot}
          onBook={handleBook}
          isAdmin={isAdmin}
          onResetRoom={handleResetRoom}
          closedRooms={closedRooms}
          onToggleRoom={handleToggleRoom}
        />
        {/* อาคาร 5 */}
        <Building5 
          bookingsByRoom={bookingsByRoom}
          selections={selections}
          onOpenDetails={handleOpenDetails}
          onSelectSlot={handleSelectSlot}
          onBook={handleBook}
          isAdmin={isAdmin}
          onResetRoom={handleResetRoom}
          closedRooms={closedRooms}
          onToggleRoom={handleToggleRoom}
        />
        {/* อาคาร 6 */}
        <Building6 
          bookingsByRoom={bookingsByRoom}
          selections={selections}
          onOpenDetails={handleOpenDetails}
          onSelectSlot={handleSelectSlot}
          onBook={handleBook}
          isAdmin={isAdmin}
          onResetRoom={handleResetRoom}
          closedRooms={closedRooms}
          onToggleRoom={handleToggleRoom}
        />
        <CustomRoomsSection
          {...buildingProps}
          onRoomCreated={async () => {
            await fetchBookings();
            await loadRoomStatus();
          }}
        />
      </div>
      {pendingBooking && (
        <ConfirmBookingModal
          isOpen={showConfirmModal}
          roomId={pendingBooking.roomId}
          slots={pendingBooking.slots}
          date={date}
          onConfirm={handleConfirmBooking}
          onCancel={handleCancelBooking}
        />
      )}
      <ConfirmResetAllModal
        isOpen={showResetAllModal}
        onConfirm={handleConfirmResetAll}
        onCancel={handleCancelResetAll}
      />
      {/* Modal สำหรับเพิ่ม/แก้ไขรายละเอียด */}
      {isDetailModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsDetailModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>เพิ่ม/แก้ไข รายละเอียดการจอง</h2>
            <h4>ห้อง: {currentRoomId}</h4>
            <div className="form-group">
              <label htmlFor="details">ชื่อการแข่งขัน / รายละเอียด:</label>
              <input
                type="text"
                id="details"
                name="details"
                value={currentDetails}
                onChange={(e) => setCurrentDetails(e.target.value)}
                placeholder="เช่น แข่งขันฟิสิกส์สัประยุทธ์"
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="btn-secondary"
              >
                ยกเลิก
              </button>
              <button type="button" onClick={handleSaveDetails} className="btn-primary">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingView;

