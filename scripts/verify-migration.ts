
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Initialize Prisma Client
const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({
    url: 'file:' + dbPath
});
const prisma = new PrismaClient({ adapter });

async function main() {
    const usersCheck = ['01615', '00217', '80249']; // Sample users to verify new pattern

    console.log('Verifying migration for selected users...');

    for (const username of usersCheck) {
        const user = await prisma.user.findUnique({
            where: { username },
            select: { username: true, imageUrl: true }
        });

        if (user) {
            console.log(`User: ${user.username}, ImageURL: ${user.imageUrl}`);
        } else {
            console.error(`User ${username} not found in DB!`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
