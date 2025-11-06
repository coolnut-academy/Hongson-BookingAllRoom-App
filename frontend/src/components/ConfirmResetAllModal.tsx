import './ConfirmResetAllModal.css';

interface ConfirmResetAllModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmResetAllModal: React.FC<ConfirmResetAllModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content reset-all-modal" onClick={(e) => e.stopPropagation()}>
        <h2>⚠️ ยืนยันการ Reset All</h2>
        <div className="modal-body">
          <p className="modal-warning-danger">
            คุณต้องการยกเลิกการจองทั้งหมดหรือไม่?
          </p>
          <p className="modal-description">
            การดำเนินการนี้จะลบการจองทั้งหมดในระบบ และไม่สามารถกู้คืนได้
          </p>
          <p className="modal-description">
            กรุณาตรวจสอบให้แน่ใจก่อนยืนยัน
          </p>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>
            ยกเลิก
          </button>
          <button className="btn-confirm-danger" onClick={onConfirm}>
            ยืนยัน Reset All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmResetAllModal;

