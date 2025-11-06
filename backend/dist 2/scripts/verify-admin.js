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
async function verifyAdmin() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const usersService = app.get(users_service_1.UsersService);
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
    }
    else {
        console.log('✅ Admin user found!');
        console.log(`   Username: ${user.username}`);
        console.log(`   isAdmin: ${user.isAdmin}`);
        console.log(`   Password hash: ${user.password.substring(0, 20)}...`);
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
//# sourceMappingURL=verify-admin.js.map