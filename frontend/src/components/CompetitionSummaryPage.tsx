// frontend/src/components/CompetitionSummaryPage.tsx
import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/booking.service';
import type { Booking } from '../types/booking';
import './CompetitionSummaryPage.css';

export const CompetitionSummaryPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="container">
        <div className="loading">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="container competition-summary-page">
      <h1>สรุปรายการแข่งขัน (ภาพรวม)</h1>

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
