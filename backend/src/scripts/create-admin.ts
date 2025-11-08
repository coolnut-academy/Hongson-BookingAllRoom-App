import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const adminUsername = 'adminhongson';
  const adminPassword = 'admin3141';

  // ตรวจสอบว่ามี admin อยู่แล้วหรือไม่
  const existingAdmin = await usersService.findByUsername(adminUsername);
  if (existingAdmin) {
    // อัพเดทให้เป็น admin
    existingAdmin.isAdmin = true;
    existingAdmin.password = await bcrypt.hash(adminPassword, 10);
    if (!existingAdmin.name) {
      existingAdmin.name = 'Admin Hongson';
    }
    await existingAdmin.save();
    console.log(`✅ Updated admin user: ${adminUsername}`);
  } else {
    // สร้าง admin ใหม่
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await usersService.create(
      'Admin Hongson',
      adminUsername,
      hashedPassword,
      true,
    );
    console.log(`✅ Created admin user: ${adminUsername}`);
  }

  await app.close();
  process.exit(0);
}

createAdmin().catch((error) => {
  console.error('❌ Error creating admin:', error);
  process.exit(1);
});
