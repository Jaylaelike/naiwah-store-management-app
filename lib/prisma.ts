import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import process from 'process';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
    // Use absolute path to database file
    const dbPath = path.join(process.cwd(), 'dev.db');

    // Correct instantiation for Prisma 7 adapter: pass config object with url
    const adapter = new PrismaBetterSqlite3({
        url: 'file:' + dbPath
    });

    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
