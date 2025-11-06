import './RoomCell.css';
import { getUserDisplayName } from '../utils/userDisplay';

interface RoomCellProps {
  slot: 'am' | 'pm';
  isSelected: boolean;
  isBooked: boolean;
  bookedBy?: { username: string; displayName?: string };
  onClick: () => void;
  isDisabled?: boolean;
}

const RoomCell: React.FC<RoomCellProps> = ({
  slot,
  isSelected,
  isBooked,
  bookedBy,
  onClick,
  isDisabled = false,
}) => {
  const slotLabel = slot === 'am' ? 'เช้า' : 'บ่าย';
  const slotClass = slot === 'am' ? 'slot-am' : 'slot-pm';

  // Get display name for tooltip
  const displayName = bookedBy
    ? bookedBy.displayName || getUserDisplayName(bookedBy.username)
    : null;

  if (isBooked) {
    return (
      <div
        className={`slot ${slotClass} booked`}
        data-slot={slotLabel}
        title={displayName ? `จองโดย: ${displayName}` : 'จองแล้ว'}
      >
        <span>{slotLabel}</span>
        <span className="status-icon">✓</span>
        {displayName && (
          <span className="booked-by-name" title={displayName}>
            {displayName}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`slot ${slotClass} available ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
      data-slot={slotLabel}
      onClick={isDisabled ? undefined : onClick}
      style={isDisabled ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
    >
      <span>{slotLabel}</span>
      <span className="status-icon">{isDisabled ? '🔒' : isSelected ? '✓' : '+'}</span>
    </div>
  );
};

export default RoomCell;

