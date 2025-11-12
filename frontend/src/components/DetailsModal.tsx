import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { Booking } from '../types/booking';
import { bookingService } from '../services/booking.service';
import { useAuth } from '../hooks/useAuth';
import './ConfirmBookingModal.css';
import './DetailsModal.css';

interface DetailsModalProps {
  booking: Booking;
  onClose: () => void;
  onSaveSuccess: () => Promise<void> | void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({
  booking,
  onClose,
  onSaveSuccess,
}) => {
  const { user, isAdmin } = useAuth();
  const [details, setDetails] = useState<string>(booking.details || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDetails(booking.details || '');
    setError(null);
  }, [booking]);

  const bookingDate = useMemo(() => new Date(booking.date), [booking.date]);
  const dateDisplay = useMemo(
    () =>
      bookingDate.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [bookingDate],
  );

  const slotLabel = booking.slot === 'am' ? 'ช่วงเช้า (AM)' : 'ช่วงบ่าย (PM)';
  const bookedByName =
    booking.bookedBy?.name?.trim() || booking.bookedBy?.username || '-';

  const canEdit =
    isAdmin || (user?.id && booking.bookedBy?._id === user.id);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canEdit) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      setError(null);
      // ใช้ updateGroupDetails เพื่ออัปเดตทุกสล็อต (AM และ PM) ในห้องและวันที่เดียวกัน
      await bookingService.updateGroupDetails({
        roomId: booking.roomId,
        date: booking.date,
        details: details.trim(),
      });
      await onSaveSuccess();
    } catch (err) {
      console.error('Failed to update booking details', err);
      setError('ไม่สามารถบันทึกรายละเอียดได้ กรุณาลองอีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content details-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>รายละเอียดการจองห้อง</h2>
        <div className="modal-body">
          <p>
            <strong>ห้อง:</strong> {booking.roomId}
          </p>
          <p>
            <strong>วันที่:</strong> {dateDisplay}
          </p>
          <p>
            <strong>ช่วงเวลา:</strong> {slotLabel}
          </p>
          <p>
            <strong>จองโดย:</strong> {bookedByName}
          </p>
        </div>
        <form className="details-form" onSubmit={handleSubmit}>
          <label htmlFor="booking-details">
            รายละเอียดการแข่งขัน / หมายเหตุ
            {!canEdit && (
              <span className="details-hint"> (ดูได้เท่านั้น)</span>
            )}
          </label>
          <textarea
            id="booking-details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="เช่น ชื่อการแข่งขัน หรือข้อมูลเพิ่มเติม"
            disabled={!canEdit || saving}
            rows={4}
          />
          {error && <div className="details-error">{error}</div>}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              ปิด
            </button>
            {canEdit && (
              <button
                type="submit"
                className="btn-confirm"
                disabled={saving}
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DetailsModal;

