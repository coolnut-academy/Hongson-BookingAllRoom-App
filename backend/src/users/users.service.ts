import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

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
