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
    username: string,
    hashedPassword: string,
    isAdmin: boolean = false,
    displayName?: string,
  ): Promise<User> {
    const user = new this.userModel({
      username,
      password: hashedPassword,
      isAdmin,
      displayName,
    });
    return user.save();
  }
}
