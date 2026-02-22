
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

// Initialize Prisma Client
const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({
    url: 'file:' + dbPath
});
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Starting bulk update of user images...');

    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users in the database.`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
        if (!user.employeeId) {
            console.warn(`Skipping user ${user.username}: No employeeId`);
            skippedCount++;
            continue;
        }

        const newImageUrl = `https://mis.thaipbs.or.th/files/emp/${user.employeeId}.jpg`;

        try {
            await prisma.user.update({
                where: { id: user.id },
                data: { imageUrl: newImageUrl },
            });
            console.log(`Updated user ${user.username} (${user.employeeId}) -> ${newImageUrl}`);
            updatedCount++;
        } catch (error) {
            console.error(`Error updating user ${user.username}:`, error);
            errorCount++;
        }
    }

    console.log('--------------------------------------------------');
    console.log('Update Complete');
    console.log(`Total Users Processed: ${users.length}`);
    console.log(`Successfully Updated: ${updatedCount}`);
    console.log(`Skipped (No Employee ID): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
