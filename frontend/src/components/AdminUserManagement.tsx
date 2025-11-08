import React, { useState, useEffect, useRef, useMemo } from 'react';
import { userService } from '../services/userService';
import { bookingService } from '../services/booking.service';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // จำนวน items ต่อหน้า

  // State สำหรับชื่องานแข่งขัน
  const [contestName, setContestName] = useState('');
  const [isSavingContestName, setIsSavingContestName] = useState(false);

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
    loadContestName();
  }, []);

  const loadContestName = async () => {
    try {
      const settings = await bookingService.getAppSettings();
      setContestName(settings.contestName || '');
    } catch (error) {
      console.error('Failed to load contest name:', error);
    }
  };

  const handleSaveContestName = async () => {
    if (!contestName.trim()) {
      alert('กรุณากรอกชื่องานแข่งขัน');
      return;
    }
    try {
      setIsSavingContestName(true);
      await bookingService.updateContestName(contestName.trim());
      alert('บันทึกชื่องานแข่งขันสำเร็จ');
      // ส่ง event เพื่อให้ BookingView reload
      window.dispatchEvent(new CustomEvent('contestNameUpdated'));
    } catch (error) {
      console.error('Failed to save contest name:', error);
      alert('ไม่สามารถบันทึกชื่องานแข่งขันได้');
    } finally {
      setIsSavingContestName(false);
    }
  };

  // คำนวณข้อมูลที่ต้องแสดงในหน้าปัจจุบัน
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return users.slice(start, end);
  }, [users, currentPage]);

  const totalPages = Math.ceil(users.length / itemsPerPage);

  // ตรวจสอบว่ามี horizontal scroll หรือไม่
  useEffect(() => {
    const checkScrollable = () => {
      if (containerRef.current) {
        const hasHorizontalScroll = 
          containerRef.current.scrollWidth > containerRef.current.clientWidth;
        setShowScrollHint(hasHorizontalScroll);
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    
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
  }, [users]); // Re-check when users data changes

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
        setCurrentPage(1); // Reset to first page after creating new user
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
    <div className="container admin-user-management-container" ref={containerRef}>
      {/* Section สำหรับตั้งชื่องานแข่งขัน */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #dee2e6',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '15px' }}>ตั้งชื่องานแข่งขัน</h2>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            value={contestName}
            onChange={(e) => setContestName(e.target.value)}
            placeholder="กรอกชื่องานแข่งขัน"
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSaveContestName();
              }
            }}
          />
          <button
            onClick={handleSaveContestName}
            disabled={isSavingContestName}
            style={{
              padding: '10px 20px',
              backgroundColor: '#198754',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSavingContestName ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              opacity: isSavingContestName ? 0.6 : 1,
            }}
          >
            {isSavingContestName ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
        <p style={{ marginTop: '10px', marginBottom: 0, color: '#6c757d', fontSize: '14px' }}>
          ชื่องานจะแสดงในหน้าการจองทันทีหลังจากบันทึก
        </p>
      </div>

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

      <table className="summary-table admin-users-table">
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
          {paginatedUsers.map((user) => {
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <span className="pagination-info">
            หน้า {currentPage} จาก {totalPages} (ทั้งหมด {users.length} คน)
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}

      {showScrollHint && (
        <div className="scroll-hint">
          เลื่อนเพื่อดูข้อมูลเพิ่มเติม
        </div>
      )}

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
