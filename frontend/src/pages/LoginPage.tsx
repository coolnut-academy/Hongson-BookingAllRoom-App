import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      // Navigate to dashboard (/) after successful login
      navigate('/');
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        setError((err.response.data as { message?: string }).message || 'Login failed');
      } else {
        setError('Login failed');
      }
    }
  };

  return (
    <div id="login-page">
      <div className="login-header">
        <div className="logo-wrapper">
          <img 
            src="https://img2.pic.in.th/pic/LOGO-HONGSON-METAVERSE-MODEL-2.png" 
            alt="Logo โรงเรียนห้องสอนศึกษา" 
            className="login-logo"
          />
        </div>
        <h1>ระบบจองห้องแข่งขัน</h1>
        <h2>โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            id="username"
            placeholder="ชื่อผู้ใช้งาน"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            id="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button id="login-button" type="submit">
          เข้าสู่ระบบ
        </button>
      </form>
      <div className="developer-credit">
        <p>พัฒนาโดย</p>
        <p className="developer-name">นายสาธิต ศิริวัชน์</p>
      </div>
    </div>
  );
};

export default LoginPage;

