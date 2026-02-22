import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
// Database import is not needed for the adapter instantiation anymore, but might be useful for manual queries if needed.
// However, the adapter creates its own instance.
import bcrypt from 'bcryptjs';
import path from 'path';

// Same setup as lib/prisma.ts should be
const dbPath = path.join(process.cwd(), 'dev.db');
console.log('🗄️  Database path:', dbPath);

// Correct usage for @prisma/adapter-better-sqlite3 v7.3.0
// It expects a config object with a 'url' property.
const adapter = new PrismaBetterSqlite3({
    url: 'file:' + dbPath
    // You can also pass better-sqlite3 options here if needed, e.g. readonly: false
});

const prisma = new PrismaClient({ adapter });

async function test() {
    console.log('🔍 Testing Prisma client...\n');

    try {
        // Test 1: Find admin user
        console.log('Test 1: Finding admin user...');
        const user = await prisma.user.findUnique({
            where: { username: 'admin' },
        });

        if (!user) {
            console.log('❌ Admin user not found!');
            return;
        }

        console.log('✅ Admin user found:');
        console.log('   ID:', user.id);
        console.log('   Username:', user.username);
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
        console.log('   Password hash (first 20 chars):', user.password.substring(0, 20) + '...');

        // Test 2: Verify password
        console.log('\nTest 2: Verifying password...');
        const isValid = await bcrypt.compare('admin123', user.password);
        console.log('   Password "admin123" valid:', isValid);

        if (isValid) {
            console.log('\n🎉 All tests passed! Authentication should work.');
        } else {
            console.log('\n❌ Password verification failed!');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
