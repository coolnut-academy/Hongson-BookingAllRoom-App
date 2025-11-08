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

  // Get display name for tooltip and display
  // แสดง username + displayName เช่น "hs-sci กลุ่มสาระวิทยาศาสตร์และเทคโนโลยี"
  let displayText = null;
  let tooltipText = 'จองแล้ว';
  
  if (bookedBy) {
    const displayName = bookedBy.displayName || getUserDisplayName(bookedBy.username);
    // ถ้ามี displayName และไม่ใช่แค่ username ให้แสดง username + displayName
    if (displayName && displayName !== bookedBy.username) {
      displayText = `${bookedBy.username} ${displayName}`;
      tooltipText = `จองโดย: ${displayText}`;
    } else {
      // ถ้าไม่มี displayName หรือ displayName = username ให้แสดงแค่ username
      displayText = bookedBy.username;
      tooltipText = `จองโดย: ${displayText}`;
    }
  }

  if (isBooked) {
    return (
      <div
        className={`slot ${slotClass} booked`}
        data-slot={slotLabel}
        title={tooltipText}
      >
        <span>{slotLabel}</span>
        <span className="status-icon">✓</span>
        {displayText && (
          <span className="booked-by-name" title={tooltipText}>
            {displayText}
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

