import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import './AdminUserManagement.css';

interface User {
  _id: string;
  name: string;
  username: string;
  role: 'user' | 'admin' | 'god';
}

// State สำหรับ Form
const emptyFormState = {
  _id: '',
  name: '',
  username: '',
  password: '',
  role: 'user' as 'user' | 'admin' | 'god',
};

export const AdminUserManagement = () => {
  const { user: loggedInUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // --- State สำหรับ Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyFormState);
  const [error, setError] = useState<string | null>(null);

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      // แปลง role จาก isAdmin boolean เป็น role string
      const usersWithRole = response.data.map((user: any) => ({
        _id: user._id,
        name: user.name || user.username,
        username: user.username,
        role: user.isAdmin ? (user.role || 'admin') : 'user',
      }));
      setUsers(usersWithRole);
    } catch (error: any) {
      console.error('Failed to fetch users', error);
      alert('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData(emptyFormState);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setIsEditing(true);
    setFormData({ ...user, password: '' }); // ใส่ password เป็นค่าว่าง
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isEditing) {
        // โหมดแก้ไข
        const { _id, ...updateData } = formData;
        await userService.updateUser(formData._id, updateData);
        alert('อัปเดตผู้ใช้สำเร็จ');
      } else {
        // โหมดสร้างใหม่
        await userService.createUser(formData);
        alert('สร้างผู้ใช้สำเร็จ');
      }
      setIsModalOpen(false);
      fetchUsers(); // Refresh list
    } catch (error: any) {
      console.error('Failed to save user', error);
      setError(
        error.response?.data?.message || error.message || 'เกิดข้อผิดพลาด'
      );
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?')) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      alert('ลบผู้ใช้สำเร็จ');
      fetchUsers(); // Refresh list
    } catch (error: any) {
      console.error('Failed to delete user', error);
      alert('ไม่สามารถลบผู้ใช้ได้: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="container">กำลังโหลดข้อมูลผู้ใช้...</div>;

  // ตรวจสอบสิทธิ์ - แสดงเฉพาะ admin
  if (!loggedInUser?.isAdmin) {
    return (
      <div className="container">
        <p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1>จัดการผู้ใช้ (Admin Panel)</h1>
        <button onClick={openCreateModal} style={{ height: 'fit-content' }}>
          + เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      <table className="summary-table">
        <thead>
          <tr>
            <th>Name (ชื่อ)</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            let canEditOrDelete = false;
            if (loggedInUser?.isAdmin) {
              // ตรวจสอบว่าเป็น god หรือไม่ (จาก username)
              const isGod = loggedInUser.username === 'admingod';
              // สำหรับ admin ธรรมดา แก้ไขได้เฉพาะ user
              // สำหรับ god แก้ไขได้ทุกคนยกเว้น god คนอื่น
              if (isGod) {
                canEditOrDelete =
                  user.role !== 'god' || user._id === loggedInUser.id;
              } else {
                canEditOrDelete = user.role === 'user';
              }
            }

            return (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    onClick={() => openEditModal(user)}
                    disabled={!canEditOrDelete}
                    title={
                      !canEditOrDelete
                        ? 'คุณไม่มีสิทธิ์แก้ไขผู้ใช้ระดับนี้'
                        : 'แก้ไขผู้ใช้'
                    }
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    disabled={!canEditOrDelete}
                    title={
                      !canEditOrDelete
                        ? 'คุณไม่มีสิทธิ์ลบผู้ใช้ระดับนี้'
                        : 'ลบผู้ใช้'
                    }
                    style={{ backgroundColor: '#dc3545', marginLeft: '5px' }}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* --- Modal UI --- */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>{isEditing ? 'แก้ไขผู้ใช้' : 'สร้างผู้ใช้ใหม่'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name (ชื่อ):</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={
                    isEditing
                      ? '(เว้นว่างไว้หากไม่ต้องการเปลี่ยน)'
                      : 'Required'
                  }
                  required={!isEditing} // บังคับใส่ตอนสร้าง
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role:</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={!loggedInUser?.isAdmin} // Admin ธรรมดา สร้างได้แค่ 'user'
                  title={
                    !loggedInUser?.isAdmin
                      ? "Admin สามารถสร้างได้เฉพาะ 'user'"
                      : ''
                  }
                >
                  <option value="user">User</option>
                  {/* God เท่านั้นที่เห็นตัวเลือกนี้ */}
                  {loggedInUser?.isAdmin &&
                    loggedInUser.username === 'admingod' && (
                      <>
                        <option value="admin">Admin</option>
                        <option value="god">God</option>
                      </>
                    )}
                </select>
              </div>

              {error && <p className="error-message">{error}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary">
                  {isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างผู้ใช้'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

