import { useState, useEffect, useRef } from 'react';
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

interface SummaryViewProps {
  customDates?: string[];
}

const SummaryView: React.FC<SummaryViewProps> = () => {
  const [summary, setSummary] = useState<SummaryResponse>({});
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

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

  // ตรวจสอบว่ามี horizontal scroll หรือไม่
  useEffect(() => {
    const checkScrollable = () => {
      if (containerRef.current) {
        const hasHorizontalScroll = 
          containerRef.current.scrollWidth > containerRef.current.clientWidth;
        setShowScrollHint(hasHorizontalScroll);
      }
    };

    // ตรวจสอบเมื่อ component mount และเมื่อ summary เปลี่ยน
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    
    // ตรวจสอบเมื่อ scroll (ซ่อน hint เมื่อ scroll แล้ว)
    const handleScroll = () => {
      if (containerRef.current) {
        const scrolled = containerRef.current.scrollLeft > 0;
        if (scrolled) {
          setShowScrollHint(false);
        }
      }
    };

    const containerElement = containerRef.current;
    if (containerElement) {
      containerElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('resize', checkScrollable);
      if (containerElement) {
        containerElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [summary]); // ตรวจสอบเมื่อ summary เปลี่ยน

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

  // คำนวณสถิติการจองทั้งหมด
  let totalBookedSlots = 0;
  let totalAvailableSlots = 0;

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
      // สะสมสถิติ
      totalBookedSlots += stats.bookedSlots || 0;
      totalAvailableSlots += stats.availableSlots || 0;

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

  // คำนวณเปอร์เซ็นต์
  const totalSlots = totalBookedSlots + totalAvailableSlots;
  const bookingPercentage = totalSlots > 0 
    ? Math.round((totalBookedSlots / totalSlots) * 100) 
    : 0;

  return (
    <div id="summary-view">
      <div className="container" ref={containerRef}>
        <h1>สรุปผลการจอง (22 - 23 ธ.ค. 68)</h1>
        <p>ข้อมูลสรุปผลการจอง</p>

        {/* Dashboard/Infographic */}
        <div className="booking-dashboard">
          <div className="dashboard-card">
            <div className="dashboard-icon booked">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div className="dashboard-content">
              <div className="dashboard-label">จองแล้ว</div>
              <div className="dashboard-value">{totalBookedSlots} ช่อง</div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-icon available">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="dashboard-content">
              <div className="dashboard-label">ว่าง</div>
              <div className="dashboard-value">{totalAvailableSlots} ช่อง</div>
            </div>
          </div>

          <div className="dashboard-card highlight">
            <div className="dashboard-icon percentage">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="dashboard-content">
              <div className="dashboard-label">อัตราการจอง</div>
              <div className="dashboard-value percentage-value">{bookingPercentage}%</div>
              <div className="dashboard-progress">
                <div 
                  className="dashboard-progress-bar" 
                  style={{ width: `${bookingPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-icon total">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="3" y1="9" x2="21" y2="9"></line>
              </svg>
            </div>
            <div className="dashboard-content">
              <div className="dashboard-label">ทั้งหมด</div>
              <div className="dashboard-value">{totalSlots} ช่อง</div>
            </div>
          </div>
        </div>

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
        {showScrollHint && (
          <div className="scroll-hint">
            เลื่อนเพื่อดูข้อมูลเพิ่มเติม
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryView;

