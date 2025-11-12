import { ReactNode, useMemo } from 'react';
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
  onOpenDetails: (booking: Booking) => void;
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

  const amSelected = selections.am || false;
  const pmSelected = selections.pm || false;
  const isRoomClosed = !isBookable;
  const isRoomFull = Boolean(bookingAM) && Boolean(bookingPM);
  const hasAnySelection = amSelected || pmSelected;
  const disableBookButton = isRoomClosed || isRoomFull || !hasAnySelection;
  const showResetButton =
    hasAdminAccess && (bookingAM || bookingPM) && typeof onResetRoom === 'function';

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
      .filter(Boolean)
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
            <button
              type="button"
              className={`details-button ${editable ? 'editable' : ''}`}
              onClick={(event) => {
                event.stopPropagation();
                if (booking) {
                  onOpenDetails(booking);
                }
              }}
              title={detailTooltip}
            >
              รายละเอียด
            </button>
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
    .filter(Boolean)
    .join(' ');

  const rootClasses = [
    'room-cell',
    isRoomClosed ? 'room-closed' : '',
    className,
  ]
    .filter(Boolean)
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
      <div className="room-slots">
        {renderSlot('am', bookingAM, amSelected)}
        {renderSlot('pm', bookingPM, pmSelected)}
      </div>
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
