import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<User>);
    findByUsername(username: string): Promise<User | null>;
    create(username: string, hashedPassword: string, isAdmin?: boolean, displayName?: string): Promise<User>;
}
