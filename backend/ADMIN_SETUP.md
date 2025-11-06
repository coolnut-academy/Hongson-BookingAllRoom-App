# Admin Setup Guide

## สร้าง Admin User

ใช้คำสั่งต่อไปนี้เพื่อสร้าง admin user:

```bash
cd backend
npm run create-admin
```

## Admin Credentials

- **Username:** `adminhongson`
- **Password:** `admin3141`

## Admin Privileges

Admin user มีสิทธิ์พิเศษดังนี้:

1. **ลบการจองของทุกคนได้** - Admin สามารถลบการจองของ user คนอื่นได้
2. **จองแทน user อื่นได้** - Admin สามารถจองแทน user อื่นได้โดยระบุ `userIdForBooking` ใน request body

## API Usage

### จองแทน User อื่น (Admin Only)

```json
POST /bookings
{
  "date": "2025-12-22",
  "selections": [
    { "roomId": "131", "slot": "am" }
  ],
  "userIdForBooking": "user_id_here"  // Optional: สำหรับ admin
}
```

### ลบการจอง (Admin สามารถลบของทุกคนได้)

```
DELETE /bookings/:id
```

Admin สามารถลบการจองของทุกคนได้ แต่ user ธรรมดาจะลบได้เฉพาะของตัวเองเท่านั้น

## Notes

- Admin user จะถูกสร้างหรืออัพเดททุกครั้งที่รัน script `create-admin`
- ถ้า admin user มีอยู่แล้ว script จะอัพเดท password และ isAdmin flag
- ถ้ายังไม่มี script จะสร้างใหม่

