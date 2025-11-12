// frontend/src/components/CompetitionSummaryPage.tsx
import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/booking.service';
import type { Booking } from '../types/booking';
import './CompetitionSummaryPage.css';

export const CompetitionSummaryPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        // (ดึงข้อมูลทั้งหมดจาก Backend)
        const data = await bookingService.getAllBookings();
        setBookings(data);
      } catch (error) {
        console.error('Failed to fetch all bookings', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);

  // (ฟังก์ชันสำหรับ Group ข้อมูลตามวันที่)
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const date = new Date(booking.date).toLocaleDateString('th-TH', {
      dateStyle: 'long',
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  // ฟังก์ชันสำหรับดาวน์โหลด Excel
  const handleDownloadExcel = async () => {
    setIsDownloading(true);
    try {
      const blob = await bookingService.downloadExcelReport();

      // Create temporary link in browser to download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'สรุปรายการแข่งขัน.xlsx'); // File name

      document.body.appendChild(link);
      link.click();

      // Remove temporary link
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download Excel file', error);
      alert('ไม่สามารถดาวน์โหลดไฟล์ Excel ได้ กรุณาลองอีกครั้ง');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="container competition-summary-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ margin: 0, flex: 1, minWidth: '200px' }}>สรุปรายการแข่งขัน (ภาพรวม)</h1>
        <button
          onClick={handleDownloadExcel}
          disabled={isDownloading}
          className="download-excel-button"
          style={{
            padding: '12px 24px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            background: isDownloading
              ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
              : 'linear-gradient(135deg, #198754 0%, #157347 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            cursor: isDownloading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 8px rgba(25, 135, 84, 0.3)',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
            opacity: isDownloading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isDownloading) {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 135, 84, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDownloading) {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 135, 84, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {isDownloading ? '⏳ กำลังสร้างไฟล์...' : '📥 ดาวน์โหลด Excel'}
        </button>
      </div>

      {Object.keys(bookingsByDate).length === 0 && (
        <div className="no-data">
          <p>ยังไม่มีการจองในระบบ</p>
        </div>
      )}

      {Object.keys(bookingsByDate).map((date) => (
        <div key={date} className="summary-section" style={{ marginBottom: '20px' }}>
          <h2>วันที่ {date}</h2>
          <div className="table-wrapper">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>อาคาร/ห้อง</th>
                  <th>เวลา</th>
                  <th>รายการแข่งขัน (รายละเอียด)</th>
                  <th>ผู้จอง</th>
                </tr>
              </thead>
              <tbody>
                {/* [แก้ไข] เราจะไม่กรอง booking.details ออก */}
                {bookingsByDate[date].map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.roomId}</td>
                    <td>{booking.slot === 'am' ? 'ช่วงเช้า' : 'ช่วงบ่าย'}</td>

                    {/* [แก้ไข] เพิ่ม Logic ตรวจสอบค่าว่าง */}
                    <td className="details-cell">
                      {booking.details?.trim() ? (
                        <strong>{booking.details}</strong>
                      ) : (
                        <span style={{ color: '#888', fontStyle: 'italic' }}>
                          (ยังไม่ได้ใส่รายละเอียด)
                        </span>
                      )}
                    </td>

                    <td>
                      {booking.bookedBy?.name?.trim() ||
                        booking.bookedBy?.username ||
                        '-'}
                    </td>
                  </tr>
                ))}

                {bookingsByDate[date].length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>
                      - ไม่มีการจองในวันนี้ -
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
