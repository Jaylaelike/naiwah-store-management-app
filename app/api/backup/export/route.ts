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
            return NextResponse.json(
                { error: 'Database file not found' },
                { status: 404 }
            );
        }

        const fileBuffer = fs.readFileSync(dbPath);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `backup-naiwah-${timestamp}.db`;

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/x-sqlite3',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': fileBuffer.length.toString(),
            },
        });
    } catch (error: any) {
        console.error('Backup export error:', error);
        return NextResponse.json(
            { error: 'Failed to export database' },
            { status: 500 }
        );
    }
}
