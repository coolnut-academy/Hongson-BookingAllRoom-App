import './ConfirmBookingModal.css';

interface ConfirmBookingModalProps {
  isOpen: boolean;
  roomId: string;
  slots: Array<{ slot: 'am' | 'pm' }>;
  date: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmBookingModal: React.FC<ConfirmBookingModalProps> = ({
  isOpen,
  roomId,
  slots,
  date,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const dateObj = new Date(date);
  const dateDisplay = dateObj.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const slotLabels = slots.map((s) => (s.slot === 'am' ? 'เช้า' : 'บ่าย'));

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>ยืนยันการจอง</h2>
        <div className="modal-body">
          <p>
            <strong>ห้อง:</strong> {roomId}
          </p>
          <p>
            <strong>วันที่:</strong> {dateDisplay}
          </p>
          <p>
            <strong>ช่วงเวลา:</strong> {slotLabels.join(', ')}
          </p>
          <p className="modal-warning">
            ⚠️ กรุณาตรวจสอบข้อมูลก่อนยืนยันการจอง
          </p>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>
            ยกเลิก
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBookingModal;

