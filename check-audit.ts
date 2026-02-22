
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';

// Replicate instantiation logic
const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3(new Database(dbPath) as any);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Checking DeviceAuditLog count...");
    const count = await prisma.deviceAuditLog.count();
    console.log(`Total Audit Logs: ${count}`);

    const logs = await prisma.deviceAuditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    console.log("Recent Logs:", JSON.stringify(logs, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
