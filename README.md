# ระบบจองห้อง (Booking Room System)

Full-stack Web Application สำหรับระบบจองห้อง โดยใช้ NestJS + React + MongoDB

## Tech Stack

### Backend
- **NestJS** + TypeScript
- **MongoDB** + Mongoose
- **JWT** Authentication
- **Passport** for authentication strategies

### Frontend
- **React** + TypeScript
- **Vite** (Build tool)
- **Axios** (HTTP client)

## Project Structure

```
.
├── backend/          # NestJS Backend
│   ├── src/
│   │   ├── auth/    # Authentication module
│   │   ├── users/   # User management
│   │   ├── bookings/# Booking management
│   │   └── schemas/ # Mongoose schemas
│   └── package.json
├── frontend/        # React Frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── contexts/    # React contexts
│   │   └── data/        # Static data
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:

**สำหรับ MongoDB Online (MongoDB Atlas):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**สำหรับ MongoDB Local:**
```env
MONGODB_URI=mongodb://localhost:27017/booking-room
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**หมายเหตุ:** 
- แทนที่ `username`, `password`, `cluster`, และ `database-name` ด้วยข้อมูลจริงจาก MongoDB Atlas
- สำหรับ MongoDB Atlas: ต้อง Whitelist IP address (หรือใช้ 0.0.0.0/0 สำหรับ development)
- JWT_SECRET ควรเป็นค่าสุ่มที่ปลอดภัย (ใช้ `openssl rand -base64 32` เพื่อ generate)

4. Start MongoDB (if running locally):
```bash
# macOS
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 mongo
```

5. Start the backend server:
```bash
npm run start:dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/register` - Register new user

### Bookings
- `POST /bookings` - Create booking (requires authentication)
- `GET /bookings/status?date=YYYY-MM-DD` - Get booking status for a date
- `GET /bookings/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get summary
- `DELETE /bookings/:id` - Delete booking (requires authentication)

## Features

- ✅ User Authentication (Login/Register)
- ✅ JWT-based session management
- ✅ Room booking system (6 buildings)
- ✅ Date-based booking (support multiple dates)
- ✅ Time slot selection (AM/PM)
- ✅ Booking summary view
- ✅ Responsive UI with Thai language support

## Default Accounts

Register a new account through the login page, or use the register endpoint directly.

## Development

### Backend
```bash
cd backend
npm run start:dev    # Development mode with hot reload
npm run build        # Build for production
npm run start:prod  # Production mode
```

### Frontend
```bash
cd frontend
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Building Data

The frontend includes building data for 6 buildings:
1. อาคาร 1 - Grid layout (6 columns)
2. อาคาร 2 - Table layout with colspan rooms
3. อาคาร 3 - Table layout
4. อาคาร 4 - Table layout (อาคารนิเสสเวศ)
5. อาคารใหม่ - Table layout (ห้องรหัส A)
6. อาคารอื่นๆ - Table layout

Room data is stored in `frontend/src/data/buildings.ts`

## Notes

- Make sure MongoDB is running before starting the backend
- Update JWT_SECRET in production environment
- Frontend uses environment variable `VITE_API_URL` for API endpoint
- All dates are in ISO format (YYYY-MM-DD)

## License

This project is for educational purposes.

