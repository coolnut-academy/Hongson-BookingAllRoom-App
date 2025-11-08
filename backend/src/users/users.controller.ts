import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Helper function เพื่อตรวจสอบว่าเป็น admin หรือไม่
  private checkAdminAccess(user: any) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can access this resource');
    }
  }

  // Helper function เพื่อตรวจสอบว่าเป็น god หรือไม่
  private isGod(user: any): boolean {
    return user.username === 'admingod';
  }

  // GET /users - ดึง users ทั้งหมด
  @Get()
  async findAll(@Request() req) {
    this.checkAdminAccess(req.user);

    const users = await this.usersService.findAll();
    
    // แปลง isAdmin เป็น role สำหรับ frontend
    return users.map((user: any) => ({
      _id: user._id,
      name: user.name,
      username: user.username,
      isAdmin: user.isAdmin,
      role: user.isAdmin 
        ? (user.username === 'admingod' ? 'god' : 'admin')
        : 'user',
      displayName: user.displayName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  // GET /users/:id - ดึง user ตาม id
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    this.checkAdminAccess(req.user);

    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // แปลง isAdmin เป็น role สำหรับ frontend
    return {
      _id: user._id,
      name: user.name,
      username: user.username,
      isAdmin: user.isAdmin,
      role: user.isAdmin
        ? (user.username === 'admingod' ? 'god' : 'admin')
        : 'user',
      displayName: user.displayName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // POST /users - สร้าง user ใหม่
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    this.checkAdminAccess(req.user);

    // ตรวจสอบว่า admin ธรรมดาสามารถสร้างได้เฉพาะ user
    if (!this.isGod(req.user) && createUserDto.role !== 'user') {
      throw new ForbiddenException(
        'Regular admins can only create users with role "user"',
      );
    }

    // ตรวจสอบว่ามี password หรือไม่
    if (!createUserDto.password) {
      throw new BadRequestException('Password is required');
    }

    try {
      const user = await this.usersService.createFromDto(createUserDto);
      
      // แปลง isAdmin เป็น role สำหรับ frontend
      return {
        _id: user._id,
        name: user.name,
        username: user.username,
        isAdmin: user.isAdmin,
        role: user.isAdmin
          ? (user.username === 'admingod' ? 'god' : 'admin')
          : 'user',
        displayName: user.displayName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error: any) {
      if (error.message === 'Username already exists') {
        throw new BadRequestException('Username already exists');
      }
      throw error;
    }
  }

  // PUT /users/:id - อัปเดต user
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    this.checkAdminAccess(req.user);

    // ตรวจสอบว่า user ที่จะแก้ไขมีอยู่หรือไม่
    const existingUser = await this.usersService.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // ตรวจสอบสิทธิ์การแก้ไข
    const isGod = this.isGod(req.user);
    const targetIsGod = existingUser.username === 'admingod';
    
    // God เท่านั้นที่แก้ไข god คนอื่นได้
    if (targetIsGod && !isGod) {
      throw new ForbiddenException(
        'Only God admin can modify other God admins',
      );
    }

    // Admin ธรรมดาแก้ไขได้เฉพาะ user
    if (!isGod && existingUser.isAdmin) {
      throw new ForbiddenException(
        'Regular admins can only modify users with role "user"',
      );
    }

    // ตรวจสอบ role ที่จะเปลี่ยน
    if (updateUserDto.role !== undefined) {
      // Admin ธรรมดาเปลี่ยน role ได้เฉพาะ 'user'
      if (!isGod && updateUserDto.role !== 'user') {
        throw new ForbiddenException(
          'Regular admins can only set role to "user"',
        );
      }

      // ห้ามเปลี่ยน god เป็น role อื่น (ยกเว้น god เอง)
      if (targetIsGod && updateUserDto.role !== 'god' && !isGod) {
        throw new ForbiddenException('Cannot change God admin role');
      }
    }

    // ตรวจสอบ username ซ้ำ (ถ้ามีการเปลี่ยน username)
    if (updateUserDto.username && updateUserDto.username !== existingUser.username) {
      const userWithSameUsername = await this.usersService.findByUsername(
        updateUserDto.username,
      );
      if (
        userWithSameUsername &&
        (userWithSameUsername as any)._id.toString() !== id
      ) {
        throw new BadRequestException('Username already exists');
      }
    }

    try {
      const updatedUser = await this.usersService.update(id, updateUserDto);
      
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      // แปลง isAdmin เป็น role สำหรับ frontend
      return {
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        isAdmin: updatedUser.isAdmin,
        role: updatedUser.isAdmin
          ? (updatedUser.username === 'admingod' ? 'god' : 'admin')
          : 'user',
        displayName: updatedUser.displayName,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    } catch (error: any) {
      if (error.message === 'Username already exists') {
        throw new BadRequestException('Username already exists');
      }
      throw error;
    }
  }

  // DELETE /users/:id - ลบ user
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    this.checkAdminAccess(req.user);

    // ตรวจสอบว่า user ที่จะลบมีอยู่หรือไม่
    const existingUser = await this.usersService.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // ตรวจสอบสิทธิ์การลบ
    const isGod = this.isGod(req.user);
    const targetIsGod = existingUser.username === 'admingod';
    
    // God เท่านั้นที่ลบ god คนอื่นได้
    if (targetIsGod && !isGod) {
      throw new ForbiddenException(
        'Only God admin can delete other God admins',
      );
    }

    // Admin ธรรมดาลบได้เฉพาะ user
    if (!isGod && existingUser.isAdmin) {
      throw new ForbiddenException(
        'Regular admins can only delete users with role "user"',
      );
    }

    // ห้ามลบตัวเอง
    if ((existingUser as any)._id.toString() === req.user.userId) {
      throw new ForbiddenException('Cannot delete yourself');
    }

    const deletedUser = await this.usersService.remove(id);
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }
}

