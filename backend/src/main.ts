import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS for frontend
  // รองรับทั้ง production และ preview URLs ของ Vercel
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://hongson-booking-all-room-app.vercel.app',
  ];

  // เพิ่ม preview URLs ของ Vercel (pattern: *.vercel.app)
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // อนุญาต requests ที่ไม่มี origin (เช่น mobile apps, Postman)
      if (!origin) {
        return callback(null, true);
      }

      // ตรวจสอบว่า origin อยู่ใน allowed list หรือเป็น Vercel preview URL
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `MongoDB URI: ${configService.get<string>('MONGODB_URI') ? 'Connected' : 'Not configured'}`,
  );
}
bootstrap();
