
import fs from 'node:fs';
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
    const sqlFilePath = path.join(process.cwd(), 'user_update-14-35-29-334.sql');

    if (!fs.existsSync(sqlFilePath)) {
        console.error(`SQL file not found at: ${sqlFilePath}`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(sqlFilePath, 'utf-8');

    // Regex to capture values inside parenthesis (...)
    const valuesRegex = /\((.*?)\)/gs;

    // Let's iterate over matches
    const matches = fileContent.matchAll(valuesRegex);

    let updatedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;
    let processedCount = 0;

    for (const match of matches) {
        const rowString = match[1];

        const parts: string[] = [];
        let current = '';
        let inQuote = false;

        for (let i = 0; i < rowString.length; i++) {
            const char = rowString[i];
            if (char === "'" && (i === 0 || rowString[i - 1] !== '\\')) { // Simple quote check
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                parts.push(current.trim().replace(/^'|'$/g, '').replace(/''/g, "'")); // Unquote and unescape
                current = '';
                continue;
            }
            current += char;
        }
        parts.push(current.trim().replace(/^'|'$/g, '').replace(/''/g, "'"));

        if (parts.length < 15) {
            // skip malformed or incomplete parts
            continue;
        }

        processedCount++;

        const username = parts[2];
        const imageUrl = parts[14];

        if (!username || !imageUrl || imageUrl === 'NULL') {
            continue;
        }

        try {
            // Check if user exists
            const user = await prisma.user.findUnique({
                where: { username: String(username) },
            });

            if (user) {
                // Only update if imageUrl is different or missing? 
                // The requirement is to migrate, so we overwrite.
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
    console.log(`Processed Tuples: ${processedCount}`);
    console.log(`Successfully Updated: ${updatedCount}`);
    console.log(`Users Not Found: ${notFoundCount}`);
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
