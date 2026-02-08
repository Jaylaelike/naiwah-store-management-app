import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Initialize Prisma Client with Better SQLite3 Adapter
const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({
    url: 'file:' + dbPath
});
const prisma = new PrismaClient({ adapter });

interface CsvRecord {
    username: string;
    image_url: string;
    [key: string]: any;
}

async function main() {
    const csvFilePath = path.join(process.cwd(), 'user_db.csv');

    if (!fs.existsSync(csvFilePath)) {
        console.error(`CSV file not found at: ${csvFilePath}`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    }) as CsvRecord[];

    console.log(`Found ${records.length} records in CSV.`);

    let updatedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;
    let noImageCount = 0;

    for (const record of records) {
        const username = record.username;
        const imageUrl = record.image_url; // Note: CSV column is image_url

        if (!username) {
            console.warn('Skipping record with missing username', record);
            continue;
        }

        if (!imageUrl || imageUrl === 'NULL' || imageUrl.trim() === '') {
            // console.log(`Skipping user ${username}: No image URL in CSV`);
            noImageCount++;
            continue;
        }

        try {
            // Check if user exists
            const user = await prisma.user.findUnique({
                where: { username: String(username) },
            });

            if (user) {
                await prisma.user.update({
                    where: { username: String(username) },
                    data: { imageUrl: imageUrl },
                });
                console.log(`Updated user: ${username} with image: ${imageUrl}`);
                updatedCount++;
            } else {
                console.warn(`User not found in DB: ${username}`);
                notFoundCount++;
            }
        } catch (error) {
            console.error(`Error updating user ${username}:`, error);
            errorCount++;
        }
    }

    console.log('--------------------------------------------------');
    console.log('Migration Complete');
    console.log(`Total Records Processed: ${records.length}`);
    console.log(`Successfully Updated: ${updatedCount}`);
    console.log(`Users Not Found: ${notFoundCount}`);
    console.log(`Skipped (No Image): ${noImageCount}`);
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
