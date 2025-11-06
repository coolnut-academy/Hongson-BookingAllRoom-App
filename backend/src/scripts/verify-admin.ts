import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

async function verifyAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const adminUsername = 'adminhongson';
  const adminPassword = 'admin3141';

  console.log('🔍 Checking admin user...\n');

  const user = await usersService.findByUsername(adminUsername);

  if (!user) {
    console.log('❌ Admin user not found!');
    console.log('📝 Creating admin user...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await usersService.create(adminUsername, hashedPassword, true);
    console.log('✅ Admin user created successfully!');
  } else {
    console.log('✅ Admin user found!');
    console.log(`   Username: ${user.username}`);
    console.log(`   isAdmin: ${user.isAdmin}`);
    console.log(`   Password hash: ${user.password.substring(0, 20)}...`);

    // Test password
    const isValid = await bcrypt.compare(adminPassword, user.password);
    console.log(`   Password valid: ${isValid ? '✅' : '❌'}`);

    if (!isValid) {
      console.log('\n⚠️  Password mismatch! Updating password...');
      user.password = await bcrypt.hash(adminPassword, 10);
      user.isAdmin = true;
      await user.save();
      console.log('✅ Password updated successfully!');
    }

    if (!user.isAdmin) {
      console.log('\n⚠️  User is not admin! Updating...');
      user.isAdmin = true;
      await user.save();
      console.log('✅ User is now admin!');
    }
  }

  await app.close();
  process.exit(0);
}

verifyAdmin().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

