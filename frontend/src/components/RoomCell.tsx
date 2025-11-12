import { useMemo } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import './RoomCell.css';
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

  const bookingAM = useMemo(
    () => bookings.find((booking) => booking.slot === 'am'),
    [bookings],
  );
  const bookingPM = useMemo(
    () => bookings.find((booking) => booking.slot === 'pm'),
    [bookings],
  );

  // ตรวจสอบสิทธิ์
  const isMyBookingAM =
    bookingAM?.bookedBy?._id === loggedInUser?.id || bookingAM?.bookedBy?._id === (loggedInUser as any)?._id;
  const isMyBookingPM =
    bookingPM?.bookedBy?._id === loggedInUser?.id || bookingPM?.bookedBy?._id === (loggedInUser as any)?._id;

  // เช็คว่าฉันสามารถ "แก้ไขรายละเอียด" ของห้องนี้ได้หรือไม่
  const canEditRoomDetails = isMyBookingAM || isMyBookingPM || hasAdminAccess;

  // เช็คสถานะรายละเอียด
  const details = bookingAM?.details || bookingPM?.details; // (ดึงรายละเอียดจากช่องไหนก็ได้)
  const hasDetails = !!details?.trim();

  // ถ้าจองเต็มวัน และเป็นคนเดียวกัน
  const isFullDaySameUser = isMyBookingAM && isMyBookingPM && bookingAM?.bookedBy?._id === bookingPM?.bookedBy?._id;

  const amSelected = selections.am || false;
  const pmSelected = selections.pm || false;
  const isRoomClosed = !isBookable;
  const isRoomFull = Boolean(bookingAM) && Boolean(bookingPM);
  const hasAnySelection = amSelected || pmSelected;
  const disableBookButton = isRoomClosed || isRoomFull || !hasAnySelection;
  const showResetButton =
    hasAdminAccess && (bookingAM || bookingPM) && typeof onResetRoom === 'function';

  // CSS สำหรับปุ่มสถานะ
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

  const handleSlotClick = (slot: 'am' | 'pm', booking?: Booking) => {
    if (isRoomClosed) {
      return;
    }
    if (booking) {
      return;
    }
    onSelectSlot(slot);
  };

  const getDisplayName = (booking?: Booking) => {
    if (!booking?.bookedBy) return '';
    const { name, username } = booking.bookedBy;
    const trimmedName = name?.trim();
    if (trimmedName) {
      return trimmedName;
    }
    return getUserDisplayName(username);
  };

  const canEditDetails = (booking?: Booking) => {
    if (!booking?.bookedBy) return hasAdminAccess;
    if (hasAdminAccess) return true;
    if (!loggedInUser) return false;
    return booking.bookedBy._id === loggedInUser.id;
  };

  const renderSlot = (slot: 'am' | 'pm', booking?: Booking, isSelected?: boolean) => {
    const slotLabel = slot === 'am' ? 'เช้า' : 'บ่าย';
    const isBooked = Boolean(booking);
    const slotClasses = [
      'slot',
      `slot-${slot}`,
      isBooked ? 'booked' : 'available',
      isRoomClosed ? 'disabled' : '',
      !isBooked && isSelected ? 'selected' : '',
    ]
      .filter((x) => Boolean(x))
      .join(' ');

    const displayName = getDisplayName(booking);
    const detailText = booking?.details?.trim();
    const detailTooltip = detailText || 'เพิ่มรายละเอียด';
    const editable = canEditDetails(booking);

    return (
      <div
        key={`${roomId}-${slot}`}
        className={slotClasses}
        data-slot={slotLabel}
        onClick={() => handleSlotClick(slot, booking)}
      >
        <span>{slotLabel}</span>
        {isBooked ? (
          <>
            <span className="status-icon">✓</span>
            {displayName && (
              <span className="booked-by-name" title={`จองโดย: ${displayName}`}>
                {displayName}
              </span>
            )}
            {detailText && (
              <span className="booking-detail-text" title={detailText}>
                {detailText}
              </span>
            )}
            {editable && (
              <button
                type="button"
                style={detailText ? statusFilled : statusEmpty}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenDetails(roomId);
                }}
                title={detailTooltip}
              >
                {detailText ? '✓' : '!'}
              </button>
            )}
          </>
        ) : (
          <span className="status-icon">
            {isRoomClosed ? '🔒' : isSelected ? '✓' : '+'}
          </span>
        )}
      </div>
    );
  };

  const bookButtonClasses = [
    'book-button',
    isRoomClosed ? 'book-button-blocked' : '',
    isRoomFull ? 'book-button-full' : '',
  ]
    .filter((x) => Boolean(x))
    .join(' ');

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
      {/* ถ้าจองเต็มวัน และเป็นคนเดียวกัน ให้รวมปุ่ม */}
      {isFullDaySameUser ? (
        <div className="slot-full-day" style={{ padding: '10px', textAlign: 'center' }}>
          <strong>จองเต็มวัน</strong>
          <small style={{ display: 'block', marginTop: '4px' }}>
            โดย: {getDisplayName(bookingAM)}
          </small>
          {canEditRoomDetails && (
            <button
              type="button"
              style={hasDetails ? statusFilled : statusEmpty}
              onClick={() => onOpenDetails(roomId)}
            >
              {hasDetails ? '✓ มีรายละเอียด' : '! เพิ่มรายละเอียด'}
            </button>
          )}
        </div>
      ) : (
        <div className="room-slots">
          {renderSlot('am', bookingAM, amSelected)}
          {renderSlot('pm', bookingPM, pmSelected)}
        </div>
      )}
      <div className="room-footer">
        <button
          type="button"
          className={bookButtonClasses}
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
    </div>
  );
};

export default RoomCell;
