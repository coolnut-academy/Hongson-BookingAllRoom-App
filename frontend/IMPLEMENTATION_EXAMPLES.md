# 🚀 ตัวอย่างการใช้งานวิธีที่ดีกว่าในโปรเจกต์นี้

## 1. Pagination สำหรับ AdminUserManagement

### ไฟล์: `frontend/src/components/AdminUserManagement.tsx`

```tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import './AdminUserManagement.css';

// ... existing code ...

export const AdminUserManagement = () => {
  // ... existing state ...
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // จำนวน items ต่อหน้า

  // ... existing useEffect ...

  // คำนวณข้อมูลที่ต้องแสดงในหน้าปัจจุบัน
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return users.slice(start, end);
  }, [users, currentPage]);

  const totalPages = Math.ceil(users.length / itemsPerPage);

  // ... existing handlers ...

  return (
    <div className="container admin-user-management-container" ref={containerRef}>
      {/* ... existing header ... */}

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
            // ... existing row rendering ...
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

      {/* ... existing modals ... */}
    </div>
  );
};
```

### CSS เพิ่มเติม: `frontend/src/components/AdminUserManagement.css`

```css
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 15px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #007bff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.9rem;
  color: #666;
}
```

---

## 2. Card View สำหรับ Mobile (Building Tables)

### ไฟล์: `frontend/src/components/Building1Mobile.tsx` (Component ใหม่)

```tsx
import React from 'react';
import RoomCell from './RoomCell';
import './Building1Mobile.css';

// ... existing types ...

interface Building1MobileProps {
  bookings: BookingsMap;
  selections: SelectionsMap;
  onSelectSlot: (roomId: string, slot: 'am' | 'pm') => void;
  onBook: (roomId: string) => void;
  isAdmin?: boolean;
  onResetRoom?: (roomId: string) => void;
  closedRooms?: string[];
  onToggleRoom?: (roomId: string) => void;
}

const Building1Mobile: React.FC<Building1MobileProps> = ({
  bookings,
  selections,
  onSelectSlot,
  onBook,
  isAdmin = false,
  onResetRoom,
  closedRooms = [],
  onToggleRoom,
}) => {
  const rooms = [
    // ... existing rooms array ...
  ];

  return (
    <div className="building-mobile-container">
      <h1>[ อาคาร 1 ] ผังการจองห้อง</h1>
      
      <div className="rooms-card-list">
        {rooms.map((room) => {
          const bookedSlots = bookings[room.roomId] || {};
          const selectedSlots = selections[room.roomId] || {};
          const amBooked = bookedSlots.am || false;
          const pmBooked = bookedSlots.pm || false;
          const amSelected = selectedSlots.am || false;
          const pmSelected = selectedSlots.pm || false;
          const amBookedBy = bookedSlots.amBookedBy;
          const pmBookedBy = bookedSlots.pmBookedBy;
          const isRoomClosed = closedRooms.includes(room.roomId);

          return (
            <div key={room.roomId} className="room-card">
              <div className="room-card-header">
                <h3>{room.roomName}</h3>
                {isAdmin && onToggleRoom && (
                  <button
                    className={`room-toggle-btn ${isRoomClosed ? 'closed' : 'open'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleRoom(room.roomId);
                    }}
                  >
                    {isRoomClosed ? '🔒' : '🔓'}
                  </button>
                )}
              </div>

              <div className="room-card-slots">
                <div className="slot-section">
                  <label>เช้า (AM)</label>
                  <RoomCell
                    slot="am"
                    isSelected={amSelected}
                    isBooked={amBooked}
                    bookedBy={amBookedBy}
                    onClick={() => !isRoomClosed && onSelectSlot(room.roomId, 'am')}
                    isDisabled={isRoomClosed}
                  />
                </div>
                <div className="slot-section">
                  <label>บ่าย (PM)</label>
                  <RoomCell
                    slot="pm"
                    isSelected={pmSelected}
                    isBooked={pmBooked}
                    bookedBy={pmBookedBy}
                    onClick={() => !isRoomClosed && onSelectSlot(room.roomId, 'pm')}
                    isDisabled={isRoomClosed}
                  />
                </div>
              </div>

              <div className="room-card-actions">
                <button
                  className={`book-button ${isRoomClosed ? 'book-button-blocked' : ''}`}
                  onClick={() => onBook(room.roomId)}
                  disabled={isRoomClosed || (!amSelected && !pmSelected)}
                >
                  {isRoomClosed ? 'ห้องปิด' : 'จอง'}
                </button>
                {isAdmin && (amBooked || pmBooked) && onResetRoom && (
                  <button
                    className="reset-button"
                    onClick={() => onResetRoom(room.roomId)}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Building1Mobile;
```

### CSS: `frontend/src/components/Building1Mobile.css`

```css
.building-mobile-container {
  padding: 15px;
}

.building-mobile-container h1 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.rooms-card-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.room-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.room-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.room-card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.room-card-slots {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.slot-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slot-section label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
}

.room-card-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.room-card-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.book-button {
  background: #007bff;
  color: white;
}

.book-button:hover:not(:disabled) {
  background: #0056b3;
}

.reset-button {
  background: #dc3545;
  color: white;
}

.reset-button:hover {
  background: #c82333;
}
```

### แก้ไข `Building1.tsx` เพื่อใช้ Card View บน Mobile

```tsx
// ใน Building1.tsx
import Building1Mobile from './Building1Mobile';

const Building1: React.FC<Building1Props> = ({ ...props }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <Building1Mobile {...props} />;
  }

  // ... existing desktop table code ...
};
```

---

## 3. Virtual Scrolling สำหรับ SummaryView

### ติดตั้ง Library

```bash
npm install react-window @types/react-window
```

### ไฟล์: `frontend/src/components/SummaryViewVirtualized.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { bookingService } from '../services/bookingService';
import './SummaryViewVirtualized.css';

interface SummaryRow {
  buildingName: string;
  date: string;
  availableSlots: number;
  bookedSlots: number;
  availableRooms: string[];
  bookedRoomsGrouped: Array<{ roomId: string; bookedBy: string }>;
}

const SummaryViewVirtualized: React.FC = () => {
  const [summary, setSummary] = useState<SummaryResponse>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to load summary', error);
    } finally {
      setLoading(false);
    }
  };

  // แปลง summary เป็น array
  const tableRows: SummaryRow[] = Object.entries(summary).flatMap(
    ([date, buildings]) =>
      Object.entries(buildings).map(([buildingName, data]) => ({
        buildingName,
        date,
        availableSlots: data.availableSlots || 0,
        bookedSlots: data.bookedSlots || 0,
        availableRooms: data.availableRooms || [],
        bookedRoomsGrouped: data.bookedRoomsGrouped || [],
      }))
  );

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = tableRows[index];
    if (!row) return null;

    return (
      <div style={style} className="virtualized-row">
        <div className="row-cell">{row.buildingName}</div>
        <div className="row-cell">
          {new Date(row.date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        <div className="row-cell status-available">
          <strong>{row.availableSlots} ช่อง</strong>
        </div>
        <div className="row-cell status-booked">
          <strong>{row.bookedSlots} ช่อง</strong>
        </div>
        <div className="row-cell">
          {row.bookedRoomsGrouped.length > 0
            ? row.bookedRoomsGrouped.map((b, idx) => (
                <div key={idx}>{b.roomId} - {b.bookedBy}</div>
              ))
            : '-'}
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="summary-virtualized">
      <h1>สรุปการจอง</h1>
      
      <div className="virtualized-header">
        <div className="header-cell">อาคาร</div>
        <div className="header-cell">วันที่</div>
        <div className="header-cell">ว่าง</div>
        <div className="header-cell">จองแล้ว</div>
        <div className="header-cell">รายละเอียด</div>
      </div>

      <List
        height={600}
        itemCount={tableRows.length}
        itemSize={80}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
};

export default SummaryViewVirtualized;
```

---

## 4. TanStack Table สำหรับ AdminUserManagement (Advanced)

### ติดตั้ง Library

```bash
npm install @tanstack/react-table
```

### ไฟล์: `frontend/src/components/AdminUserManagementAdvanced.tsx`

```tsx
import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import './AdminUserManagementAdvanced.css';

interface User {
  _id: string;
  name: string;
  username: string;
  role: 'user' | 'admin' | 'god';
  password?: string;
}

export const AdminUserManagementAdvanced: React.FC = () => {
  const { user: loggedInUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // ... existing fetchUsers ...

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name (ชื่อ)',
        enableSorting: true,
      },
      {
        accessorKey: 'username',
        header: 'Username',
        enableSorting: true,
      },
      {
        accessorKey: 'password',
        header: 'Password',
        cell: ({ getValue }) => {
          const password = getValue() as string | undefined;
          return password ? (
            <span className="password-display">{password}</span>
          ) : (
            <span className="password-masked">••••••</span>
          );
        },
      },
      {
        accessorKey: 'role',
        header: 'Role',
        enableSorting: true,
        filterFn: 'equals',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const user = row.original;
          // ... existing action buttons ...
        },
      },
    ],
    [loggedInUser]
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="container admin-user-management-advanced">
      <div className="table-header">
        <h1>จัดการสมาชิกในการจอง</h1>
        <input
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="ค้นหา..."
          className="search-input"
        />
      </div>

      <table className="advanced-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={header.column.getCanSort() ? 'sortable' : ''}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: ' ↑',
                    desc: ' ↓',
                  }[header.column.getIsSorted() as string] ?? ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="table-footer">
        แสดง {table.getRowModel().rows.length} จาก {users.length} คน
      </div>
    </div>
  );
};
```

---

## 📝 สรุป

1. **Pagination**: ง่ายที่สุด เหมาะกับ AdminUserManagement
2. **Card View**: UX ดีมากบน mobile เหมาะกับ Building tables
3. **Virtual Scrolling**: Performance ดี เหมาะกับ SummaryView ที่มีข้อมูลมาก
4. **TanStack Table**: Feature ครบ เหมาะกับตารางที่ต้องการ sort/filter

เลือกใช้ตามความเหมาะสมของแต่ละ use case ครับ!

