# Environment Variables Setup

## สำหรับการพัฒนา (Development)

สร้างไฟล์ `.env.local` ในโฟลเดอร์ `frontend/` และเพิ่ม:

```
VITE_API_BASE_URL=http://localhost:3000
```

## สำหรับการ Deploy บน Vercel

1. ไปที่ Vercel Dashboard
2. เลือกโปรเจกต์ของคุณ
3. ไปที่ Settings > Environment Variables
4. เพิ่ม Environment Variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: URL ของ Backend API (เช่น `https://your-backend.onrender.com`)
   - **Environment**: Production, Preview, Development (เลือกทั้งหมด)

## หมายเหตุ

- ไฟล์ `.env.local` จะถูก git ignore (ไม่ควร commit)
- ไฟล์ `.env.example` เป็นตัวอย่างเท่านั้น
- หลังจากเพิ่ม Environment Variable ใน Vercel ให้ Redeploy เพื่อให้การเปลี่ยนแปลงมีผล

