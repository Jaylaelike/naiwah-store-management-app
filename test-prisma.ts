import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';

// Replicate instantiation logic
const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3(new Database(dbPath) as any);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Checking if deviceAuditLog exists...");
    if (prisma.deviceAuditLog) {
        console.log("Success: prisma.deviceAuditLog exists.");
        // Try a simple count or findMany
        const count = await prisma.deviceAuditLog.count();
        console.log(`Current audit logs count: ${count}`);
    } else {
        console.error("Failure: prisma.deviceAuditLog is undefined.");
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
