import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import process from 'process';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
    // Get database URL from environment variable
    // Defaults: 
    // - Production/Docker: file:./data/dev.db
    // - Development: file:./dev.db
    const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
    
    // Extract path from file:// URL
    const dbPath = databaseUrl.replace('file:', '');
    const absolutePath = path.isAbsolute(dbPath) 
        ? dbPath 
        : path.join(process.cwd(), dbPath);

    // Correct instantiation for Prisma 7 adapter: pass config object with url
    const adapter = new PrismaBetterSqlite3({
        url: 'file:' + absolutePath
    });

    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
