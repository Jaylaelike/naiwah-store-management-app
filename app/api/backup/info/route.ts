import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const dbPath = path.join(process.cwd(), 'dev.db');

        if (!fs.existsSync(dbPath)) {
            return NextResponse.json({ error: 'Database not found' }, { status: 404 });
        }

        const stats = fs.statSync(dbPath);

        // List existing backups
        const backupDir = path.join(process.cwd(), 'backups');
        let backups: { name: string; size: number; date: string }[] = [];

        if (fs.existsSync(backupDir)) {
            const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.db'));
            backups = files.map(f => {
                const fStats = fs.statSync(path.join(backupDir, f));
                return {
                    name: f,
                    size: fStats.size,
                    date: fStats.mtime.toISOString(),
                };
            }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        return NextResponse.json({
            database: {
                path: dbPath,
                size: stats.size,
                lastModified: stats.mtime.toISOString(),
            },
            backups,
        });
    } catch (error: any) {
        console.error('Backup info error:', error);
        return NextResponse.json(
            { error: 'Failed to get database info' },
            { status: 500 }
        );
    }
}
