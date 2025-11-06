import { useState, useEffect } from 'react';
import Building1 from './Building1';
import Building2 from './Building2';
import Building3 from './Building3';
import Building4 from './Building4';
import Building5 from './Building5';
import Building6 from './Building6';
import CustomRoomsSection from './CustomRoomsSection';
import ConfirmBookingModal from './ConfirmBookingModal';
import { bookingService } from '../services/booking.service';
import type { BookingSelection } from '../services/booking.service';
import { useAuth } from '../contexts/AuthContext';
import './BookingView.css';

interface BookingViewProps {
  date: string;
}

// Convert bookings array to status map for easy lookup
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

const BookingView: React.FC<BookingViewProps> = ({ date }) => {
  const { isAdmin } = useAuth();

  // State: bookings (ข้อมูลที่จองแล้วจาก API)
  const [bookings, setBookings] = useState<BookingSelection[]>([]);

  // State: selections (ข้อมูลที่ผู้ใช้กำลังเลือก)
  const [selections, setSelections] = useState<SelectionsMap>({});

  // State: room status (รายการห้องที่ปิด)
  const [closedRooms, setClosedRooms] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  // State: confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<{
    roomId: string;
    slots: BookingSelection[];
  } | null>(null);

  // useEffect: เมื่อ props.date เปลี่ยน
  useEffect(() => {
    loadBookings();
    loadRoomStatus();
    // เคลียร์ selections ทั้งหมดเมื่อเปลี่ยนวัน
    setSelections({});
  }, [date]);

  // Load room status
  const loadRoomStatus = async () => {
    try {
      const status = await bookingService.getRoomStatus();
      setClosedRooms(status.closedRooms || []);
    } catch (error) {
      console.error('Failed to load room status:', error);
    }
  };

  // เรียก API GET /bookings/details?date={date} เพื่อดึงข้อมูลพร้อมชื่อผู้จอง
  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookingsWithDetails(date);
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert bookings array to map for easy lookup (พร้อมชื่อผู้จอง)
  const bookingsMap: BookingsMap = {};
  bookings.forEach((booking) => {
    if (!bookingsMap[booking.roomId]) {
      bookingsMap[booking.roomId] = {};
    }
    if (booking.slot === 'am') {
      bookingsMap[booking.roomId].am = true;
      if (booking.bookedBy) {
        bookingsMap[booking.roomId].amBookedBy = booking.bookedBy;
      }
    } else {
      bookingsMap[booking.roomId].pm = true;
      if (booking.bookedBy) {
        bookingsMap[booking.roomId].pmBookedBy = booking.bookedBy;
      }
    }
  });

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
      await loadBookings();
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
      await loadBookings();
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
      await loadBookings();
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

  const buildingProps = {
    bookings: bookingsMap,
    selections,
    onSelectSlot: handleSelectSlot,
    onBook: handleBook,
    isAdmin,
    onResetRoom: handleResetRoom,
    closedRooms,
    onToggleRoom: handleToggleRoom,
  };

  return (
    <>
      <div id="booking-view">
        <h1>การจองอาคาร ในวันที่ {dateDisplay}</h1>
        {isAdmin && closedRooms.length > 0 && (
          <div className="admin-notice">
            ℹ️ มีห้องที่ปิดอยู่ {closedRooms.length} ห้อง: {closedRooms.join(', ')}
          </div>
        )}
        <Building1 {...buildingProps} />
        <Building2 {...buildingProps} />
        <Building3 {...buildingProps} />
        <Building4 {...buildingProps} />
        <Building5 {...buildingProps} />
        <Building6 {...buildingProps} />
        <CustomRoomsSection
          {...buildingProps}
          onRoomCreated={async () => {
            await loadBookings();
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
    </>
  );
};

export default BookingView;

