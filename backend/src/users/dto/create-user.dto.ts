export class CreateUserDto {
  name: string;
  username: string;
  password?: string;
  role: 'user' | 'admin' | 'god';
  displayName?: string;
}
