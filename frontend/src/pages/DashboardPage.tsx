import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BookingView from '../components/BookingView';
import SummaryView from '../components/SummaryView';
import { AdminUserManagement } from '../components/AdminUserManagement';
import './DashboardPage.css';

type ActiveTap = 'tap1' | 'tap2' | 'tap3' | 'tap4';

const DashboardPage = () => {
  const { logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTap, setActiveTap] = useState<ActiveTap>('tap1');

  const handleTabClick = (tap: ActiveTap) => {
    setActiveTap(tap);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div id="main-app">
      <header id="main-app-header">
        <img 
          src="https://img2.pic.in.th/pic/LOGO-HONGSON-METAVERSE-MODEL-2.png" 
          alt="Logo โรงเรียนห้องสอนศึกษา" 
          className="header-logo"
        />
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
        {activeTap === 'tap3' && <SummaryView />}
        {activeTap === 'tap4' && isAdmin && <AdminUserManagement />}
      </main>
    </div>
  );
};

export default DashboardPage;

