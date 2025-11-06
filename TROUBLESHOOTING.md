# Troubleshooting: Admin Login Issue

## ปัญหา: Login ไม่ได้ แจ้งเตือน "Invalid credentials"

### วิธีแก้ไข:

1. **Restart Backend Server**
   - หยุด backend server (Ctrl+C)
   - รันใหม่: `npm run start:dev` หรือ `npm start`

2. **ตรวจสอบ MongoDB Connection**
   - ตรวจสอบว่า MongoDB ทำงานอยู่
   - ตรวจสอบไฟล์ `.env` ว่ามี `MONGODB_URI` ถูกต้อง

3. **ตรวจสอบ Admin User**
   ```bash
   cd backend
   npm run verify-admin
   ```
   - Script นี้จะตรวจสอบและแก้ไข admin user อัตโนมัติ

4. **สร้าง Admin User ใหม่**
   ```bash
   cd backend
   npm run create-admin
   ```

### Admin Credentials:
- **Username:** `adminhongson`
- **Password:** `admin3141`

### สาเหตุที่เป็นไปได้:

1. **Backend Server ไม่ได้ Restart** - หลังจากอัปเดต schema ต้อง restart server
2. **MongoDB Connection Error** - ตรวจสอบว่า MongoDB เชื่อมต่อได้
3. **Password Hash ไม่ตรง** - ใช้ `npm run verify-admin` เพื่อแก้ไข

### ตรวจสอบ Logs:

ดู logs ใน backend console เพื่อดู error message ที่แท้จริง

