import React, { useState } from 'react';
import './AddDateModal.css';

interface AddDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, displayName: string) => void;
  existingDates: string[];
}

export const AddDateModal: React.FC<AddDateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  existingDates,
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate date
    if (!selectedDate) {
      setError('กรุณาเลือกวันที่');
      return;
    }

    // Check if date already exists
    if (existingDates.includes(selectedDate)) {
      setError('วันที่นี้มีอยู่แล้วในระบบ');
      return;
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    if (selected < today) {
      setError('ไม่สามารถเพิ่มวันที่ในอดีตได้');
      return;
    }

    // Use displayName or format date
    const finalDisplayName =
      displayName.trim() ||
      new Date(selectedDate).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    onConfirm(selectedDate, finalDisplayName);
    // Reset form
    setSelectedDate('');
    setDisplayName('');
    setError(null);
  };

  const handleClose = () => {
    setSelectedDate('');
    setDisplayName('');
    setError(null);
    onClose();
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content add-date-modal" onClick={(e) => e.stopPropagation()}>
        <h2>เพิ่มวันที่สำหรับการจอง</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">วันที่:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="displayName">ชื่อที่แสดง (ไม่บังคับ):</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="เช่น จอง 24 ธ.ค. 68"
            />
            <small>ถ้าไม่กรอกจะใช้รูปแบบวันที่อัตโนมัติ</small>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={handleClose} className="btn-secondary">
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary">
              ยืนยัน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

