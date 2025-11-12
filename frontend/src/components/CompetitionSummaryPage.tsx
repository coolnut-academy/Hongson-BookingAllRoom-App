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

  // ฟังก์ชันสำหรับ Group ข้อมูลตามวันที่
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const dateStr = new Date(booking.date).toISOString().split('T')[0];
    const date = new Date(booking.date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[dateStr]) {
      acc[dateStr] = {
        displayDate: date,
        bookings: [],
      };
    }
    acc[dateStr].bookings.push(booking);
    return acc;
  }, {} as Record<string, { displayDate: string; bookings: Booking[] }>);

  // เรียงวันที่ตามลำดับ
  const sortedDates = Object.keys(bookingsByDate).sort();

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

      {sortedDates.length === 0 && (
        <div className="no-data">
          <p>ยังไม่มีการจองที่มีรายละเอียด</p>
        </div>
      )}

      {sortedDates.map((dateKey) => {
        const { displayDate, bookings: dateBookings } = bookingsByDate[dateKey];
        const bookingsWithDetails = dateBookings.filter((b) => b.details?.trim());

        if (bookingsWithDetails.length === 0) {
          return null;
        }

        return (
          <div key={dateKey} className="summary-section">
            <h2>วันที่ {displayDate}</h2>
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
                  {bookingsWithDetails.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.roomId}</td>
                      <td>{booking.slot === 'am' ? 'ช่วงเช้า' : 'ช่วงบ่าย'}</td>
                      <td className="details-cell">
                        <strong>{booking.details}</strong>
                      </td>
                      <td>
                        {booking.bookedBy?.name?.trim() ||
                          booking.bookedBy?.username ||
                          '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {sortedDates.length > 0 &&
        sortedDates.every(
          (dateKey) => bookingsByDate[dateKey].bookings.filter((b) => b.details?.trim()).length === 0,
        ) && (
          <div className="no-data">
            <p>ยังไม่มีการจองที่มีรายละเอียด</p>
          </div>
        )}
    </div>
  );
};

