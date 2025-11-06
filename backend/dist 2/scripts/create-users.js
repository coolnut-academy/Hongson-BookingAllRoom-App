"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcrypt"));
async function createUsers() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const usersService = app.get(users_service_1.UsersService);
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
            const existingUser = await usersService.findByUsername(username);
            if (existingUser) {
                existingUser.password = hashedPassword;
                existingUser.displayName = displayName;
                await existingUser.save();
                console.log(`✅ Updated user: ${username} (${displayName})`);
            }
            else {
                await usersService.create(username, hashedPassword, false, displayName);
                console.log(`✅ Created user: ${username} (${displayName})`);
            }
        }
        catch (error) {
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
//# sourceMappingURL=create-users.js.map