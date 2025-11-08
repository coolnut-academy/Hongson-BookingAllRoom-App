import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async onModuleInit() {
    this.logger.log('Bootstrapping Admin users...');
    await this.bootstrapAdmins();
  }

  private async bootstrapAdmins() {
    // 1. สร้าง Admin God
    const godUser = await this.userModel.findOne({ username: 'admingod' });
    if (!godUser) {
      this.logger.log('Admin God (admingod) not found. Creating...');
      const hashedPassword = await bcrypt.hash('admingod1618', 10);
      const newGod = new this.userModel({
        name: 'Admin God (System)',
        username: 'admingod',
        password: hashedPassword,
        isAdmin: true,
      });
      await newGod.save();
      this.logger.log('Admin God (admingod) created.');
    }

    // 2. สร้าง Admin ทั่วไป
    const adminUser = await this.userModel.findOne({ username: 'adminhongson' });
    if (!adminUser) {
      this.logger.log('Admin (adminhongson) not found. Creating...');
      const hashedPassword = await bcrypt.hash('admin3141', 10);
      const newAdmin = new this.userModel({
        name: 'Admin Hongson (System)',
        username: 'adminhongson',
        password: hashedPassword,
        isAdmin: true,
      });
      await newAdmin.save();
      this.logger.log('Admin (adminhongson) created.');
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async create(
    name: string,
    username: string,
    hashedPassword: string,
    isAdmin: boolean = false,
    displayName?: string,
  ): Promise<User> {
    const user = new this.userModel({
      name,
      username,
      password: hashedPassword,
      isAdmin,
      displayName,
    });
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async update(id: string, updateData: any): Promise<User | null> {
    // ถ้ามี password ให้ hash ก่อน
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    // แปลง role เป็น isAdmin ถ้ามี
    if (updateData.role !== undefined) {
      updateData.isAdmin = updateData.role === 'admin' || updateData.role === 'god';
      delete updateData.role; // ลบ role ออกเพราะ schema ไม่มี
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();
    return updatedUser;
  }

  async remove(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).select('-password').exec();
  }

  // Helper method สำหรับสร้าง user จาก DTO
  async createFromDto(createUserDto: any): Promise<User> {
    const { name, username, password, role } = createUserDto;
    
    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existingUser = await this.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // แปลง role เป็น isAdmin
    const isAdmin = role === 'admin' || role === 'god';
    
    // Hash password
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : await bcrypt.hash('defaultPassword123', 10); // ถ้าไม่มี password ให้ใช้ default

    return this.create(name, username, hashedPassword, isAdmin);
  }
}
