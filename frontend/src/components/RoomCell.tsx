import { useMemo } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import './Room.css';
import './RoomCell.css';
import './AdminUserManagement.css';
import type { Booking } from '../types/booking';
import { useAuth } from '../hooks/useAuth';
import { getUserDisplayName } from '../utils/userDisplay';

interface RoomCellProps {
  roomId: string;
  roomName: string;
  roomDetail?: string;
  bookings: Booking[];
  selections: { am?: boolean; pm?: boolean };
  isBookable: boolean;
  onSelectSlot: (slot: 'am' | 'pm') => void;
  onBook: () => void;
  onOpenDetails: (roomId: string) => void;
  isAdmin?: boolean;
  onResetRoom?: () => void;
  onToggleRoom?: () => void;
  headerActions?: ReactNode;
  className?: string;
}

// --- (CSS สำหรับปุ่มสถานะ) ---
const statusButtonBase: CSSProperties = {
  cursor: 'pointer',
  borderRadius: '4px',
  padding: '2px 6px',
  fontSize: '0.8em',
  border: '1px solid',
  marginTop: '4px',
};
const statusEmpty: CSSProperties = {
  ...statusButtonBase,
  color: '#dc3545',
  borderColor: '#dc3545',
  backgroundColor: '#fff',
};
const statusFilled: CSSProperties = {
  ...statusButtonBase,
  color: '#198754',
  borderColor: '#198754',
  backgroundColor: '#e6f7e6',
};

const RoomCell: React.FC<RoomCellProps> = ({
  roomId,
  roomName,
  roomDetail,
  bookings,
  selections,
  isBookable,
  onSelectSlot,
  onBook,
  onOpenDetails,
  isAdmin = false,
  onResetRoom,
  onToggleRoom,
  headerActions,
  className = '',
}) => {
  const { user: loggedInUser, isAdmin: isAdminFromContext } = useAuth();
  const hasAdminAccess = isAdmin || isAdminFromContext;

  // --- 1. ค้นหาการจอง ---
  const bookingAM = useMemo(
    () => bookings.find((b) => b.roomId === roomId && b.slot === 'am'),
    [bookings, roomId],
  );
  const bookingPM = useMemo(
    () => bookings.find((b) => b.roomId === roomId && b.slot === 'pm'),
    [bookings, roomId],
  );

  // --- 2. ตรวจสอบสถานะการจอง ---
  const isFullDay =
    bookingAM &&
    bookingPM &&
    bookingAM.bookedBy._id === bookingPM.bookedBy._id; // จองเต็มวัน (คนเดียวกัน)
  const isMyBookingAM =
    bookingAM?.bookedBy._id === loggedInUser?.id ||
    bookingAM?.bookedBy._id === (loggedInUser as any)?._id;
  const isMyBookingPM =
    bookingPM?.bookedBy._id === loggedInUser?.id ||
    bookingPM?.bookedBy._id === (loggedInUser as any)?._id;
  const isAdminUser = hasAdminAccess;

  // --- 3. ตรวจสอบสิทธิ์การแก้ไขรายละเอียด ---
  const canEditDetails =
    (isAdminUser || isMyBookingAM || isMyBookingPM) && (bookingAM || bookingPM);

  // --- 4. ดึงรายละเอียด (จากช่องไหนก็ได้) ---
  const details = bookingAM?.details || bookingPM?.details || '';
  const hasDetails = !!details?.trim();

  const getDisplayName = (booking?: Booking) => {
    if (!booking?.bookedBy) return '';
    const { name, username } = booking.bookedBy;
    const trimmedName = name?.trim();
    if (trimmedName) {
      return trimmedName;
    }
    return getUserDisplayName(username);
  };

  const amSelected = selections.am || false;
  const pmSelected = selections.pm || false;
  const isRoomClosed = !isBookable;
  const isRoomFull = Boolean(bookingAM) && Boolean(bookingPM);
  const hasAnySelection = amSelected || pmSelected;
  const disableBookButton = isRoomClosed || isRoomFull || !hasAnySelection;
  // Admin และ Admin god สามารถ Reset ได้แม้ว่าห้องจะเต็มแล้ว
  const showResetButton =
    hasAdminAccess && typeof onResetRoom === 'function';

  // --- 5. Render Logic (ตรรกะการแสดงผล) ---
  const renderSlots = () => {
    // --- [FIX 1: ตรวจสอบห้องที่จองไม่ได้ (Blocked) ก่อน] ---
    if (!isBookable) {
      // ถ้าเป็นห้องพักครู (จองไม่ได้) ให้แสดงปุ่ม "ห้องเต็ม" เท่านั้น
      return (
        <div className="room-footer">
          <button className="book-button" disabled>
            ห้องเต็ม
          </button>
        </div>
      );
    }

    // --- [FIX 2: ตรวจสอบห้องที่จองเต็มวันจริงๆ (Full Day)] ---
    if (isFullDay && bookingAM) {
      return (
        <>
          <div className="slot-full-day">
            <strong>จองเต็มวัน</strong>
            <small>โดย: {getDisplayName(bookingAM)}</small>
            {/* แสดงปุ่มรายละเอียด ถ้าเป็นเจ้าของ หรือ Admin */}
            {canEditDetails && (
              <button
                type="button"
                style={hasDetails ? statusFilled : statusEmpty}
                onClick={() => onOpenDetails(roomId)} // (ส่ง roomId ไปให้ Modal)
              >
                {hasDetails ? '✓ มีรายละเอียด' : '! เพิ่มรายละเอียด'}
              </button>
            )}
          </div>
          {/* แสดง Reset button สำหรับ Admin แม้ว่าห้องจะเต็มแล้ว */}
          {showResetButton && (
            <div className="room-footer">
              <button
                type="button"
                className="reset-button"
                onClick={() => onResetRoom?.()}
                title="Reset การจองในห้องนี้ (Admin only)"
              >
                Reset
              </button>
            </div>
          )}
        </>
      );
    }

    // --- [Default: แสดงผล 2 สล็อต (AM/PM) แยกกัน] ---
    return (
      <>
        <div className="room-slots">
          {/* --- ช่อง AM (เช้า) --- */}
          <div
            className={`slot slot-am ${
              bookingAM
                ? 'booked'
                : amSelected
                  ? 'selected'
                  : 'available'
            } ${isRoomClosed ? 'disabled' : ''}`}
            onClick={() => {
              if (!isRoomClosed && !bookingAM) {
                onSelectSlot('am');
              }
            }}
          >
            <span>เช้า</span>
            {bookingAM ? (
              <>
                <span className="status-icon">✓</span>
                <small>({getDisplayName(bookingAM)})</small>
                {(isAdminUser || isMyBookingAM) && (
                  <button
                    type="button"
                    style={bookingAM.details ? statusFilled : statusEmpty}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetails(roomId);
                    }}
                    title={bookingAM.details || 'เพิ่มรายละเอียด'}
                  >
                    {bookingAM.details ? '✓' : '!'}
                  </button>
                )}
              </>
            ) : (
              // (ช่องว่าง)
              <span className="status-icon">
                {isRoomClosed ? '🔒' : amSelected ? '✓' : '+'}
              </span>
            )}
          </div>

          {/* --- ช่อง PM (บ่าย) --- */}
          <div
            className={`slot slot-pm ${
              bookingPM
                ? 'booked'
                : pmSelected
                  ? 'selected'
                  : 'available'
            } ${isRoomClosed ? 'disabled' : ''}`}
            onClick={() => {
              if (!isRoomClosed && !bookingPM) {
                onSelectSlot('pm');
              }
            }}
          >
            <span>บ่าย</span>
            {bookingPM ? (
              <>
                <span className="status-icon">✓</span>
                <small>({getDisplayName(bookingPM)})</small>
                {(isAdminUser || isMyBookingPM) && (
                  <button
                    type="button"
                    style={bookingPM.details ? statusFilled : statusEmpty}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetails(roomId);
                    }}
                    title={bookingPM.details || 'เพิ่มรายละเอียด'}
                  >
                    {bookingPM.details ? '✓' : '!'}
                  </button>
                )}
              </>
            ) : (
              // (ช่องว่าง)
              <span className="status-icon">
                {isRoomClosed ? '🔒' : pmSelected ? '✓' : '+'}
              </span>
            )}
          </div>
        </div>

        {/* --- ปุ่ม "จอง" (จะแสดงเฉพาะเมื่อห้องไม่เต็ม) --- */}
        <div className="room-footer">
          <button
            type="button"
            className={`book-button ${isRoomClosed ? 'book-button-blocked' : ''} ${isRoomFull ? 'book-button-full' : ''}`}
            onClick={onBook}
            disabled={disableBookButton}
          >
            {isRoomClosed ? 'ห้องปิด' : isRoomFull ? 'ห้องเต็ม' : 'จอง'}
          </button>
          {showResetButton && (
            <button
              type="button"
              className="reset-button"
              onClick={() => onResetRoom?.()}
              title="Reset การจองในห้องนี้ (Admin only)"
            >
              Reset
            </button>
          )}
        </div>
      </>
    );
  }; // (จบฟังก์ชัน renderSlots)

  const rootClasses = [
    'room-cell',
    isRoomClosed ? 'room-closed' : '',
    className,
  ]
    .filter((x) => Boolean(x))
    .join(' ');

  return (
    <div className={rootClasses} data-room-name={roomName}>
      <div className={`room-header ${isRoomClosed ? 'room-closed-header' : ''}`}>
        <strong>{roomName}</strong>
        {roomDetail && <small>{roomDetail}</small>}
        {(hasAdminAccess || headerActions) && (
          <div className="room-header-actions">
            {hasAdminAccess && onToggleRoom && (
              <button
                type="button"
                className={`room-toggle-btn ${isRoomClosed ? 'closed' : 'open'}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleRoom();
                }}
                title={isRoomClosed ? 'คลิกเพื่อเปิดห้อง' : 'คลิกเพื่อปิดห้อง'}
              >
                {isRoomClosed ? '🔒' : '🔓'}
              </button>
            )}
            {headerActions}
          </div>
        )}
      </div>

      {renderSlots()}
    </div>
  );
};

export default RoomCell;
