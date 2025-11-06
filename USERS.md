# Users Information

## Admin User

- **Username:** `adminhongson`
- **Password:** `admin3141`
- **Role:** Admin (สามารถลบและจองแทน user อื่นได้)

## Standard Users (9 users)

ทุก user มี password เดียวกัน: **`silpa2568`**

1. **hs-thai** - Password: `silpa2568`
2. **hs-social** - Password: `silpa2568`
3. **hs-inter** - Password: `silpa2568`
4. **hs-art** - Password: `silpa2568`
5. **hs-sci** - Password: `silpa2568`
6. **hs-sport** - Password: `silpa2568`
7. **hs-worker** - Password: `silpa2568`
8. **hs-tcas** - Password: `silpa2568`
9. **hs-math** - Password: `silpa2568`

## Scripts

### สร้าง Admin User
```bash
cd backend
npm run create-admin
```

### ตรวจสอบ Admin User
```bash
cd backend
npm run verify-admin
```

### สร้าง Users ทั้งหมด (9 users)
```bash
cd backend
npm run create-users
```

## Notes

- Script `create-users` จะสร้าง users ทั้งหมดที่มี password เดียวกัน
- ถ้า user มีอยู่แล้ว script จะอัพเดท password ให้อัตโนมัติ
- Admin user มีสิทธิ์พิเศษในการลบและจองแทน user อื่น

