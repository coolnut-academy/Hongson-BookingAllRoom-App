import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

async function createUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const users = [
    { username: 'hs-thai', displayName: 'กลุ่มสาระภาษาไทย' },
    { username: 'hs-social', displayName: 'กลุ่มสาระสังคมศึกษา' },
    { username: 'hs-inter', displayName: 'กลุ่มสาระต่างประเทศ' },
    { username: 'hs-art', displayName: 'กลุ่มสาระศิลปะ' },
    { username: 'hs-sci', displayName: 'กลุ่มสาระวิทยาศาสตร์และเทคโนฯ' },
    { username: 'hs-sport', displayName: 'กลุ่มสาระพละศึกษา' },
    { username: 'hs-worker', displayName: 'กลุ่มสาระการงานอาชีพ' },
    { username: 'hs-tcas', displayName: 'กลุ่มสาระแนะแนว' },
    { username: 'hs-math', displayName: 'กลุ่มสาระคณิตศาสตร์' },
  ];

  const password = 'silpa2568';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('🔨 Creating users...\n');

  for (const { username, displayName } of users) {
    try {
      // ตรวจสอบว่ามี user อยู่แล้วหรือไม่
      const existingUser = await usersService.findByUsername(username);
      if (existingUser) {
        // อัพเดท password, name และ displayName
        existingUser.password = hashedPassword;
        existingUser.name = displayName || username;
        existingUser.displayName = displayName;
        await existingUser.save();
        console.log(`✅ Updated user: ${username} (${displayName})`);
      } else {
        // สร้าง user ใหม่
        await usersService.create(displayName || username, username, hashedPassword, false, displayName);
        console.log(`✅ Created user: ${username} (${displayName})`);
      }
    } catch (error: any) {
      console.error(`❌ Error creating user ${username}:`, error.message);
    }
  }

  console.log('\n✅ All users processed!');
  await app.close();
  process.exit(0);
}

createUsers().catch((error) => {
  console.error('❌ Error creating users:', error);
  process.exit(1);
});
