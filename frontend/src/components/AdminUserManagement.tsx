import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import './AdminUserManagement.css';

interface User {
  _id: string;
  name: string;
  username: string;
  role: 'user' | 'admin' | 'god';
  password?: string; // สำหรับแสดง password ที่ generate ใหม่
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'edit' | 'delete' | 'generate' | null;
    userId?: string;
    userData?: Partial<User>;
  }>({ type: null });

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      // แปลง role จาก isAdmin boolean เป็น role string
      const usersWithRole = response.data.map((user: { _id: string; name?: string; username: string; isAdmin?: boolean; password?: string }) => ({
        _id: user._id,
        name: user.name || user.username,
        username: user.username,
        role: user.isAdmin
          ? user.username === 'admingod'
            ? 'god'
            : 'admin'
          : 'user',
        password: user.password || undefined, // เก็บ password ที่ generate ใหม่
      }));
      setUsers(usersWithRole);
    } catch (error: unknown) {
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

  const handleGeneratePassword = async (userId: string) => {
    setConfirmAction({ type: 'generate', userId });
    setShowConfirmModal(true);
  };

  const handleEditClick = (user: User) => {
    openEditModal(user);
  };

  const handleDeleteClick = (userId: string) => {
    setConfirmAction({ type: 'delete', userId });
    setShowConfirmModal(true);
  };

  const executeConfirmAction = async () => {
    if (!confirmAction.type) return;

    try {
      if (confirmAction.type === 'delete') {
        await userService.deleteUser(confirmAction.userId!);
        alert('ลบผู้ใช้สำเร็จ');
        fetchUsers();
        setShowConfirmModal(false);
        setConfirmAction({ type: null });
      } else if (confirmAction.type === 'generate') {
        const response = await userService.resetPassword(confirmAction.userId!);
        const newPassword = response.data.newPassword;
        
        // อัปเดต password ใน users list
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === confirmAction.userId
              ? { ...user, password: newPassword }
              : user
          )
        );
        
        alert(`Password ใหม่: ${newPassword}\n\nกรุณาบันทึก password นี้ไว้!`);
        setShowConfirmModal(false);
        setConfirmAction({ type: null });
      }
    } catch (error: unknown) {
      console.error('Failed to execute action', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
        ? String(error.response.data.message)
        : error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'เกิดข้อผิดพลาด';
      alert('เกิดข้อผิดพลาด: ' + errorMessage);
      setShowConfirmModal(false);
      setConfirmAction({ type: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // สำหรับสร้างใหม่ ให้บันทึกเลย
    if (!isEditing) {
      try {
        await userService.createUser(formData);
        alert('สร้างผู้ใช้สำเร็จ');
        setIsModalOpen(false);
        setFormData(emptyFormState);
        fetchUsers();
      } catch (error: unknown) {
        console.error('Failed to save user', error);
        const errorMessage = error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
          ? String(error.response.data.message)
          : error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'เกิดข้อผิดพลาด';
        setError(errorMessage);
      }
    }
    // สำหรับแก้ไข จะแสดง confirmation modal ใน handleEditClick
  };

  const handleFinalConfirm = async () => {
    if (confirmAction.type === 'edit' && confirmAction.userData) {
      try {
        const { _id, ...updateData } = confirmAction.userData;
        // ตรวจสอบว่า _id มีค่าก่อนเรียก updateUser
        if (!_id) {
          alert('ไม่พบ ID ของผู้ใช้');
          return;
        }
        // ถ้า password ว่าง ให้ลบออก
        if (!updateData.password || updateData.password === '') {
          delete updateData.password;
        }
        await userService.updateUser(_id, updateData);
        alert('อัปเดตผู้ใช้สำเร็จ');
        setIsModalOpen(false);
        setFormData(emptyFormState);
        setShowConfirmModal(false);
        setConfirmAction({ type: null });
        fetchUsers();
      } catch (error: unknown) {
        console.error('Failed to update user', error);
        const errorMessage = error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
          ? String(error.response.data.message)
          : error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'เกิดข้อผิดพลาด';
        setError(errorMessage);
        setShowConfirmModal(false);
        setConfirmAction({ type: null });
      }
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
          marginBottom: '20px',
        }}
      >
        <h1>จัดการสมาชิกในการจอง</h1>
        <button
          onClick={openCreateModal}
          style={{ height: 'fit-content', padding: '10px 20px' }}
          className="btn-primary"
        >
          + เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      <table className="summary-table">
        <thead>
          <tr>
            <th>Name (ชื่อ)</th>
            <th>Username</th>
            <th>Password</th>
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
                <td>
                  {user.password ? (
                    <span className="password-display">{user.password}</span>
                  ) : (
                    <span className="password-masked">••••••</span>
                  )}
                </td>
                <td>{user.role}</td>
                <td>
                  <button
                    onClick={() => handleEditClick(user)}
                    disabled={!canEditOrDelete}
                    title={
                      !canEditOrDelete
                        ? 'คุณไม่มีสิทธิ์แก้ไขผู้ใช้ระดับนี้'
                        : 'แก้ไขผู้ใช้'
                    }
                    className="btn-edit"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleGeneratePassword(user._id)}
                    disabled={!canEditOrDelete}
                    title="Generate Password ใหม่"
                    className="btn-generate"
                  >
                    Generate
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user._id)}
                    disabled={!canEditOrDelete}
                    title={
                      !canEditOrDelete
                        ? 'คุณไม่มีสิทธิ์ลบผู้ใช้ระดับนี้'
                        : 'ลบผู้ใช้'
                    }
                    className="btn-delete"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* --- Modal สำหรับ Add/Edit User --- */}
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
                  required={!isEditing}
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role:</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={
                    !loggedInUser?.isAdmin ||
                    (loggedInUser.username !== 'admingod' && formData.role !== 'user')
                  }
                  title={
                    loggedInUser?.username !== 'admingod'
                      ? "Admin สามารถสร้างได้เฉพาะ 'user'"
                      : ''
                  }
                >
                  <option value="user">User</option>
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
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData(emptyFormState);
                    setError(null);
                  }}
                  className="btn-secondary"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  onClick={(e) => {
                    if (isEditing) {
                      e.preventDefault();
                      setConfirmAction({ type: 'edit', userData: formData });
                      setShowConfirmModal(true);
                    }
                  }}
                >
                  {isEditing ? 'ยืนยันการแก้ไข' : 'ยืนยันการสร้าง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Confirmation Modal --- */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-content confirmation-modal">
            <h2>
              {confirmAction.type === 'edit'
                ? 'ยืนยันการแก้ไขข้อมูล'
                : confirmAction.type === 'delete'
                ? 'ยืนยันการลบผู้ใช้'
                : 'ยืนยันการ Generate Password ใหม่'}
            </h2>
            <div className="confirmation-content">
              {confirmAction.type === 'edit' && (
                <div>
                  <p>คุณต้องการแก้ไขข้อมูลผู้ใช้ต่อไปนี้หรือไม่?</p>
                  <div className="confirmation-details">
                    <p>
                      <strong>ชื่อ:</strong> {confirmAction.userData?.name}
                    </p>
                    <p>
                      <strong>Username:</strong>{' '}
                      {confirmAction.userData?.username}
                    </p>
                    {confirmAction.userData?.password && (
                      <p>
                        <strong>Password:</strong>{' '}
                        {confirmAction.userData.password}
                      </p>
                    )}
                    <p>
                      <strong>Role:</strong> {confirmAction.userData?.role}
                    </p>
                  </div>
                </div>
              )}
              {confirmAction.type === 'delete' && (
                <p>คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?</p>
              )}
              {confirmAction.type === 'generate' && (
                <p>
                  คุณต้องการ Generate Password ใหม่สำหรับผู้ใช้นี้หรือไม่?
                  <br />
                  <small>
                    (Password เก่าจะไม่สามารถใช้งานได้อีกต่อไป)
                  </small>
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction({ type: null });
                }}
                className="btn-secondary"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={
                  confirmAction.type === 'edit'
                    ? handleFinalConfirm
                    : executeConfirmAction
                }
                className="btn-primary"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
