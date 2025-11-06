import './BlockedRoomCell.css';

interface BlockedRoomCellProps {
  roomName: string;
  subtitle?: string;
  blockedType?: 'red' | 'blue' | 'green';
  colspan?: number;
}

const BlockedRoomCell: React.FC<BlockedRoomCellProps> = ({
  roomName,
  subtitle,
  blockedType = 'red',
  colspan,
}) => {
  return (
    <div
      className={`room-cell blocked ${colspan ? 'colspan' : ''}`}
      data-room-name={roomName}
      style={colspan ? { gridColumn: `span ${colspan}` } : {}}
    >
      <div className={`room-header blocked-${blockedType}`}>
        <strong>{roomName}</strong>
        {subtitle && <small>{subtitle}</small>}
      </div>
      <div className="room-slots">
        <div className="slot slot-am" data-slot="เช้า">
          <span>เช้า</span>
          <span className="status-icon">X</span>
        </div>
        <div className="slot slot-pm" data-slot="บ่าย">
          <span>บ่าย</span>
          <span className="status-icon">X</span>
        </div>
      </div>
      <div className="room-footer">
        <button className="book-button book-button-blocked" disabled>
          ห้องเต็ม
        </button>
      </div>
    </div>
  );
};

export default BlockedRoomCell;

