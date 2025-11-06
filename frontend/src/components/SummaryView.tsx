import { useState, useEffect } from 'react';
import { bookingService } from '../services/booking.service';
import type { SummaryResponse } from '../services/booking.service';
import './SummaryView.css';

const buildingNames: Record<string, string> = {
  building1: 'อาคาร 1',
  building2: 'อาคาร 2',
  building3: 'อาคาร 3',
  building4: 'อาคาร 4',
  building5: 'อาคารใหม่',
  building6: 'อาคารอื่นๆ',
};

const SummaryView = () => {
  const [summary, setSummary] = useState<SummaryResponse>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load summary when component mounts or becomes visible
    loadSummary();
    
    // Listen for room status changes (when admin opens/closes rooms)
    const handleRoomStatusChange = () => {
      loadSummary();
    };
    
    window.addEventListener('roomStatusChanged', handleRoomStatusChange);
    
    // Auto-refresh every 2 minutes (120 seconds) to reduce unnecessary refreshes
    // Only refresh when user is likely still viewing the page
    const interval = setInterval(() => {
      // Only refresh if page is visible (not in background)
      if (!document.hidden) {
        loadSummary();
      }
    }, 120000); // 120 seconds = 2 minutes

    return () => {
      clearInterval(interval);
      window.removeEventListener('roomStatusChanged', handleRoomStatusChange);
    };
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">กำลังโหลด...</div>;
  }

  // Convert summary data to table rows
  // จัดกลุ่มห้องที่ถูกจอง - รวมห้องที่จองโดยคนเดียวกัน
  const tableRows: Array<{
    date: string;
    building: string;
    buildingName: string;
    bookedSlots: number;
    availableSlots: number;
    bookedRoomsGrouped: Array<{ roomId: string; bookedBy: string }>;
    availableRooms: string[];
  }> = [];

  Object.entries(summary).forEach(([date, buildings]) => {
    Object.entries(buildings).forEach(([building, stats]) => {
      // จัดกลุ่มห้องที่ถูกจอง - แสดงเฉพาะห้องและผู้จอง (ไม่แสดง slot)
      // ใช้ Set เพื่อเก็บ unique combinations ของ roomId + bookedBy
      const uniqueBookings = new Set<string>();
      
      (stats.bookedRooms || []).forEach((booking) => {
        // ใช้ roomId + bookedBy เป็น unique key
        const key = `${booking.roomId}|${booking.bookedBy}`;
        uniqueBookings.add(key);
      });

      // แปลงเป็น array - แสดงเฉพาะห้องและผู้จอง
      const bookedRoomsGrouped: Array<{ roomId: string; bookedBy: string }> = [];
      uniqueBookings.forEach((key) => {
        const [roomId, bookedBy] = key.split('|');
        bookedRoomsGrouped.push({ roomId, bookedBy });
      });

      // เรียงลำดับตาม roomId แล้วตาม bookedBy
      bookedRoomsGrouped.sort((a, b) => {
        if (a.roomId !== b.roomId) {
          return a.roomId.localeCompare(b.roomId);
        }
        return a.bookedBy.localeCompare(b.bookedBy);
      });

      tableRows.push({
        date,
        building,
        buildingName: buildingNames[building] || building,
        bookedSlots: stats.bookedSlots,
        availableSlots: stats.availableSlots,
        bookedRoomsGrouped,
        availableRooms: stats.availableRooms || [],
      });
    });
  });

  return (
    <div id="summary-view">
      <div className="container">
        <h1>สรุปผลการจอง (22 - 23 ธ.ค. 68)</h1>
        <p>ข้อมูลสรุปผลการจอง</p>

        <table className="summary-table">
          <thead>
            <tr>
              <th>อาคาร</th>
              <th>วันที่</th>
              <th>ห้องที่ว่าง (ช่อง)</th>
              <th>ห้องที่จองแล้ว (ช่อง)</th>
              <th>รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>
                  ไม่มีข้อมูลการจอง
                </td>
              </tr>
            ) : (
              tableRows.map((row, index) => (
                <tr key={index}>
                  <td>{row.buildingName}</td>
                  <td>
                    {new Date(row.date).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="status-available">
                    <div>
                      <strong>{row.availableSlots} ช่อง</strong>
                      {row.availableRooms.length > 0 && (
                        <div className="detail-text">
                          ห้อง: {row.availableRooms.join(', ')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="status-booked">
                    <strong>{row.bookedSlots} ช่อง</strong>
                  </td>
                  <td>
                    <div className="summary-details">
                      {row.bookedRoomsGrouped.length > 0 ? (
                        <div className="booked-detail">
                          {row.bookedRoomsGrouped.map((booking, idx) => (
                            <div key={idx} className="booking-item">
                              {booking.roomId} - {booking.bookedBy}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-bookings">-</div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummaryView;

