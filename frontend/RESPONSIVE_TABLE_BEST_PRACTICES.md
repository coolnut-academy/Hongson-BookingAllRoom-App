# 📊 Responsive Table Best Practices Guide

## สารบัญ
1. [Virtual Scrolling / Windowing](#1-virtual-scrolling--windowing)
2. [Pagination](#2-pagination)
3. [Infinite Scroll / Load More](#3-infinite-scroll--load-more)
4. [Responsive Table with Card View](#4-responsive-table-with-card-view)
5. [Sticky Header + Horizontal Scroll](#5-sticky-header--horizontal-scroll-วิธีปัจจุบัน)
6. [Data Grid Component](#6-data-grid-component)

---

## 1. Virtual Scrolling / Windowing

### 📝 คำอธิบาย
Render เฉพาะส่วนที่มองเห็นบนหน้าจอเท่านั้น ลด memory usage และเพิ่ม performance

### ✅ ข้อดี
- Performance ดีมาก แม้มีข้อมูล 10,000+ rows
- Memory usage ต่ำ
- Smooth scrolling

### ❌ ข้อเสีย
- ต้องติดตั้ง library เพิ่ม
- Bundle size เพิ่มขึ้นเล็กน้อย
- Learning curve

### 📦 Library ที่แนะนำ
- **react-window** (เบา, เร็ว) - แนะนำ
- **react-virtualized** (feature ครบ แต่ bundle ใหญ่)

### 💻 ตัวอย่างโค้ด

```bash
# ติดตั้ง
npm install react-window @types/react-window
```

```tsx
// components/VirtualizedTable.tsx
import React from 'react';
import { FixedSizeList as List } from 'react-window';

interface TableRow {
  id: string;
  name: string;
  username: string;
  role: string;
}

interface VirtualizedTableProps {
  data: TableRow[];
  columns: string[];
}

const VirtualizedTable: React.FC<VirtualizedTableProps> = ({ data, columns }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} className="table-row">
      <div className="table-cell">{data[index].name}</div>
      <div className="table-cell">{data[index].username}</div>
      <div className="table-cell">{data[index].role}</div>
    </div>
  );

  return (
    <div className="virtualized-table">
      <div className="table-header">
        {columns.map((col) => (
          <div key={col} className="table-header-cell">{col}</div>
        ))}
      </div>
      <List
        height={600} // ความสูงของ container
        itemCount={data.length}
        itemSize={50} // ความสูงของแต่ละ row
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
};

export default VirtualizedTable;
```

### 🎯 เมื่อไหร่ควรใช้
- มีข้อมูลมากกว่า 100 rows
- ต้องการ performance สูง
- มี memory constraints

---

## 2. Pagination

### 📝 คำอธิบาย
แบ่งข้อมูลออกเป็นหน้าๆ ผู้ใช้กดเปลี่ยนหน้าเพื่อดูข้อมูล

### ✅ ข้อดี
- โหลดเร็ว (โหลดเฉพาะหน้าที่ต้องการ)
- UX ดี ผู้ใช้รู้ว่ามีกี่หน้า
- SEO friendly
- ไม่ต้อง scroll ยาว

### ❌ ข้อเสีย
- ต้องกดเปลี่ยนหน้าเพื่อดูข้อมูลทั้งหมด
- อาจต้องโหลดหลายครั้ง

### 💻 ตัวอย่างโค้ด

```tsx
// components/PaginatedTable.tsx
import React, { useState, useMemo } from 'react';

interface TableRow {
  id: string;
  name: string;
  username: string;
  role: string;
}

interface PaginatedTableProps {
  data: TableRow[];
  itemsPerPage?: number;
}

const PaginatedTable: React.FC<PaginatedTableProps> = ({ 
  data, 
  itemsPerPage = 10 
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, currentPage, itemsPerPage]);

  return (
    <div className="paginated-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.username}</td>
              <td>{row.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        
        <span>
          Page {currentPage} of {totalPages}
        </span>
        
        <button 
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginatedTable;
```

### 🎯 เมื่อไหร่ควรใช้
- มีข้อมูล 20-100 rows
- ต้องการ UX ที่ชัดเจน
- ต้องการ SEO friendly

---

## 3. Infinite Scroll / Load More

### 📝 คำอธิบาย
โหลดข้อมูลเพิ่มเมื่อ scroll ลงล่าง หรือกดปุ่ม "Load More"

### ✅ ข้อดี
- UX ดี (ดูต่อเนื่อง)
- โหลดข้อมูลตาม demand
- เหมาะกับ social media feed

### ❌ ข้อเสีย
- อาจโหลดช้าเมื่อ scroll เร็ว
- ยากต่อการกลับไปดูข้อมูลด้านบน
- SEO ไม่ดี (ข้อมูลไม่ครบใน HTML)

### 💻 ตัวอย่างโค้ด

```tsx
// components/InfiniteScrollTable.tsx
import React, { useState, useEffect, useRef } from 'react';

interface TableRow {
  id: string;
  name: string;
  username: string;
  role: string;
}

interface InfiniteScrollTableProps {
  fetchData: (page: number) => Promise<TableRow[]>;
}

const InfiniteScrollTable: React.FC<InfiniteScrollTableProps> = ({ fetchData }) => {
  const [data, setData] = useState<TableRow[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const newData = await fetchData(page);
      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData(prev => [...prev, ...newData]);
      }
      setLoading(false);
    };
    loadData();
  }, [page, fetchData]);

  useEffect(() => {
    // Intersection Observer สำหรับ auto-load เมื่อ scroll ถึงล่าง
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading]);

  return (
    <div className="infinite-scroll-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.username}</td>
              <td>{row.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div ref={loadMoreRef} className="load-more-trigger">
        {loading && <div>Loading...</div>}
        {!hasMore && <div>No more data</div>}
      </div>
    </div>
  );
};

export default InfiniteScrollTable;
```

### 🎯 เมื่อไหร่ควรใช้
- มีข้อมูลจำนวนมาก
- ต้องการ UX แบบต่อเนื่อง
- ไม่จำเป็นต้อง SEO

---

## 4. Responsive Table with Card View

### 📝 คำอธิบาย
แสดงเป็น table บน desktop แต่แปลงเป็น card list บน mobile

### ✅ ข้อดี
- UX ดีมากบน mobile
- อ่านง่ายบนหน้าจอเล็ก
- Responsive ดี

### ❌ ข้อเสีย
- ต้องเขียน component 2 แบบ
- Code ซับซ้อนขึ้น

### 💻 ตัวอย่างโค้ด

```tsx
// components/ResponsiveTable.tsx
import React from 'react';
import './ResponsiveTable.css';

interface TableRow {
  id: string;
  name: string;
  username: string;
  role: string;
  email?: string;
}

interface ResponsiveTableProps {
  data: TableRow[];
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ data }) => {
  return (
    <div className="responsive-table-container">
      {/* Desktop View - Table */}
      <table className="responsive-table desktop-view">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Role</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.username}</td>
              <td>{row.role}</td>
              <td>{row.email || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile View - Cards */}
      <div className="mobile-view">
        {data.map((row) => (
          <div key={row.id} className="table-card">
            <div className="card-row">
              <span className="card-label">Name:</span>
              <span className="card-value">{row.name}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Username:</span>
              <span className="card-value">{row.username}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Role:</span>
              <span className="card-value">{row.role}</span>
            </div>
            {row.email && (
              <div className="card-row">
                <span className="card-label">Email:</span>
                <span className="card-value">{row.email}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponsiveTable;
```

```css
/* ResponsiveTable.css */
.responsive-table-container {
  width: 100%;
}

/* Desktop View */
.desktop-view {
  display: table;
  width: 100%;
}

.mobile-view {
  display: none;
}

/* Mobile View */
@media screen and (max-width: 768px) {
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  .table-card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .card-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
  }

  .card-row:last-child {
    border-bottom: none;
  }

  .card-label {
    font-weight: 600;
    color: #666;
  }

  .card-value {
    color: #333;
    text-align: right;
  }
}
```

### 🎯 เมื่อไหร่ควรใช้
- มีหลายคอลัมน์ (5+ columns)
- ต้องการ UX ที่ดีบน mobile
- ข้อมูลไม่ซับซ้อน

---

## 5. Sticky Header + Horizontal Scroll (วิธีปัจจุบัน)

### 📝 คำอธิบาย
ใช้ horizontal scroll เมื่อตารางกว้างเกินหน้าจอ และ sticky header เพื่อให้เห็น header ตลอดเวลา

### ✅ ข้อดี
- ใช้งานง่าย
- ไม่ต้องติดตั้ง library
- Bundle size เล็ก

### ❌ ข้อเสีย
- บน mobile อาจต้อง scroll 2 ทิศทาง
- UX อาจไม่ดีบนหน้าจอเล็ก

### 💻 ตัวอย่างโค้ด (ใช้อยู่แล้ว)

```css
/* Sticky Header */
.table-container {
  overflow-x: auto;
  position: relative;
}

.table-container table {
  width: 100%;
  min-width: 800px; /* Minimum width */
}

.table-container thead {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}
```

### 🎯 เมื่อไหร่ควรใช้
- มีคอลัมน์ไม่มาก (5-10 columns)
- ข้อมูลไม่มาก (< 50 rows)
- ต้องการ solution ง่ายๆ

---

## 6. Data Grid Component

### 📝 คำอธิบาย
ใช้ library ที่มี feature ครบ เช่น sorting, filtering, grouping, editing

### ✅ ข้อดี
- Feature ครบ (sort, filter, group, edit)
- Performance ดี
- Professional look

### ❌ ข้อเสีย
- Bundle size ใหญ่
- Learning curve
- อาจมี feature ที่ไม่ใช้

### 📦 Library ที่แนะนำ
- **TanStack Table (React Table)** - แนะนำ (flexible, modern)
- **AG Grid** - Feature ครบมาก แต่ bundle ใหญ่
- **Material-UI DataGrid** - ถ้าใช้ MUI อยู่แล้ว

### 💻 ตัวอย่างโค้ด (TanStack Table)

```bash
# ติดตั้ง
npm install @tanstack/react-table
```

```tsx
// components/DataGridTable.tsx
import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  email: string;
}

const DataGridTable: React.FC<{ data: User[] }> = ({ data }) => {
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        enableSorting: true,
      },
      {
        accessorKey: 'username',
        header: 'Username',
        enableSorting: true,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        enableSorting: true,
        filterFn: 'equals',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
    ],
    []
  );

  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
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
    <div className="data-grid">
      {/* Search/Filter */}
      <input
        value={globalFilter ?? ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search..."
        className="search-input"
      />

      {/* Table */}
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ cursor: 'pointer' }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: ' ↑',
                    desc: ' ↓',
                  }[header.column.getIsSorted() as string] ?? null}
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
    </div>
  );
};

export default DataGridTable;
```

### 🎯 เมื่อไหร่ควรใช้
- ต้องการ feature ครบ (sort, filter, group)
- มีข้อมูลซับซ้อน
- ต้องการ professional look

---

## 📊 สรุปเปรียบเทียบ

| วิธี | Bundle Size | Performance | UX | Learning Curve | เหมาะกับ |
|------|------------|-------------|-----|----------------|----------|
| Virtual Scrolling | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ข้อมูลมาก (100+ rows) |
| Pagination | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ข้อมูลปานกลาง (20-100 rows) |
| Infinite Scroll | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Social feed, ข้อมูลมาก |
| Card View | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Mobile, หลายคอลัมน์ |
| Horizontal Scroll | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ข้อมูลน้อย (< 50 rows) |
| Data Grid | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | Feature ครบ, ซับซ้อน |

---

## 🎯 คำแนะนำสำหรับโปรเจกต์นี้

### ตารางที่มีข้อมูลไม่มาก (< 50 rows)
✅ **ใช้วิธีปัจจุบัน (Horizontal Scroll)** ได้เลย

### ตารางที่มีข้อมูลมาก (> 50 rows)
1. **AdminUserManagement**: ใช้ **Pagination** (10-20 items per page)
2. **SummaryView**: ใช้ **Pagination** หรือ **Virtual Scrolling**

### บน Mobile
- **Building Tables**: แปลงเป็น **Card View** เพื่อ UX ที่ดีกว่า
- **SummaryView**: ใช้ **Card View** แทน table

### สำหรับอนาคต
- หากต้องการ feature เพิ่ม (sort, filter): ใช้ **TanStack Table**
- หากมีข้อมูลมากมาก (> 1000 rows): ใช้ **Virtual Scrolling**

---

## 📚 Resources

- [react-window Documentation](https://github.com/bvaughn/react-window)
- [TanStack Table Documentation](https://tanstack.com/table/latest)
- [AG Grid Documentation](https://www.ag-grid.com/)
- [CSS Tricks: Responsive Tables](https://css-tricks.com/responsive-data-tables/)

