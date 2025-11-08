import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BookingView from '../components/BookingView';
import SummaryView from '../components/SummaryView';
import { AdminUserManagement } from '../components/AdminUserManagement';
import { AddDateModal } from '../components/AddDateModal';
import { bookingService } from '../services/booking.service';
import { getUserDisplayName } from '../utils/userDisplay';
import './DashboardPage.css';

type ActiveTap = 'tap1' | 'tap2' | 'tap2.5' | 'tap3' | 'tap4' | string;

interface CustomDate {
  date: string;
  displayName: string;
}

const DashboardPage = () => {
  const { logout, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [activeTap, setActiveTap] = useState<ActiveTap>('tap1');
  const [customDates, setCustomDates] = useState<CustomDate[]>([]);
  const [showAddDateModal, setShowAddDateModal] = useState(false);

  // โหลดวันที่จาก database เมื่อ component mount
  useEffect(() => {
    loadBookingDates();
  }, []);

  const loadBookingDates = async () => {
    try {
      const dates = await bookingService.getBookingDates();
      setCustomDates(dates);
    } catch (error) {
      console.error('Failed to load booking dates:', error);
    }
  };

  const handleTabClick = (tap: ActiveTap) => {
    setActiveTap(tap);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddDate = async (date: string, displayName: string) => {
    try {
      // บันทึกไปที่ database
      const newDate = await bookingService.addBookingDate(date, displayName);
      
      // อัปเดต state
      setCustomDates([...customDates, newDate]);
      
      // เปลี่ยนไปที่ tab ใหม่ที่สร้าง
      const newTabIndex = `tap-custom-${date}`;
      setActiveTap(newTabIndex);
      
      setShowAddDateModal(false);
    } catch (error: unknown) {
      console.error('Failed to add booking date:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
        ? String(error.response.data.message)
        : 'ไม่สามารถเพิ่มวันที่ได้';
      alert(errorMessage);
    }
  };

  const handleRemoveCustomDate = async (date: string) => {
    try {
      // ลบจาก database
      await bookingService.removeBookingDate(date);
      
      // อัปเดต state
      setCustomDates(customDates.filter((d) => d.date !== date));
      
      // ถ้า tab ที่เปิดอยู่คือวันที่ที่ลบ ให้เปลี่ยนไปที่ tap1
      if (activeTap === `tap-custom-${date}`) {
        setActiveTap('tap1');
      }
    } catch (error: unknown) {
      console.error('Failed to remove booking date:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
        ? String(error.response.data.message)
        : 'ไม่สามารถลบวันที่ได้';
      alert(errorMessage);
    }
  };

  return (
    <div id="main-app">
      <header id="main-app-header">
        <div className="header-left">
          <img 
            src="https://img2.pic.in.th/pic/LOGO-HONGSON-METAVERSE-MODEL-2.png" 
            alt="Logo โรงเรียนห้องสอนศึกษา" 
            className="header-logo"
          />
          {user && (() => {
            // แสดง username + displayName เช่น "hs-sci กลุ่มสาระวิทยาศาสตร์และเทคโนโลยี"
            const displayName = getUserDisplayName(user.username);
            const displayText = displayName && displayName !== user.username
              ? `${user.username} ${displayName}`
              : user.username;
            
            return (
              <div className="user-info">
                <span className="user-label">ผู้ใช้งาน:</span>
                <span className="user-name">{displayText}</span>
              </div>
            );
          })()}
        </div>
        <nav className="tabs">
          <button
            className={`tab-link ${activeTap === 'tap1' ? 'active' : ''}`}
            onClick={() => handleTabClick('tap1')}
          >
            จอง 22 ธ.ค. 68
          </button>
          <button
            className={`tab-link ${activeTap === 'tap2' ? 'active' : ''}`}
            onClick={() => handleTabClick('tap2')}
          >
            จอง 23 ธ.ค. 68
          </button>
          {isAdmin && (
            <button
              className={`tab-link add-date-tab ${activeTap === 'tap2.5' ? 'active' : ''}`}
              onClick={() => setShowAddDateModal(true)}
              title="เพิ่มวันที่สำหรับการจอง"
            >
              + เพิ่มวันที่
            </button>
          )}
          {/* Custom date tabs */}
          {isAdmin &&
            customDates.map((customDate) => {
              const tabKey = `tap-custom-${customDate.date}`;
              return (
                <button
                  key={customDate.date}
                  className={`tab-link ${activeTap === tabKey ? 'active' : ''}`}
                  onClick={() => setActiveTap(tabKey)}
                  title={`คลิกขวาเพื่อลบวันที่ ${customDate.displayName}`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (confirm(`ต้องการลบวันที่ ${customDate.displayName} หรือไม่?`)) {
                      handleRemoveCustomDate(customDate.date);
                    }
                  }}
                >
                  {customDate.displayName}
                </button>
              );
            })}
          <button
            className={`tab-link ${activeTap === 'tap3' ? 'active' : ''}`}
            onClick={() => handleTabClick('tap3')}
          >
            สรุปผลการจอง
          </button>
          {isAdmin && (
            <button
              className={`tab-link ${activeTap === 'tap4' ? 'active' : ''}`}
              onClick={() => handleTabClick('tap4')}
            >
              จัดการสมาชิก
            </button>
          )}
        </nav>
        <button id="logout-button" onClick={handleLogout}>
          ออกจากระบบ
        </button>
      </header>

      <main>
        {activeTap === 'tap1' && <BookingView date="2025-12-22" />}
        {activeTap === 'tap2' && <BookingView date="2025-12-23" />}
        {customDates.map((customDate) => {
          const tabKey = `tap-custom-${customDate.date}`;
          if (activeTap === tabKey) {
            return (
              <BookingView key={customDate.date} date={customDate.date} />
            );
          }
          return null;
        })}
        {activeTap === 'tap3' && <SummaryView customDates={customDates.map((d) => d.date)} />}
        {activeTap === 'tap4' && isAdmin && <AdminUserManagement />}
      </main>

      <AddDateModal
        isOpen={showAddDateModal}
        onClose={() => setShowAddDateModal(false)}
        onConfirm={handleAddDate}
        existingDates={['2025-12-22', '2025-12-23', ...customDates.map((d) => d.date)]}
      />
    </div>
  );
};

export default DashboardPage;

