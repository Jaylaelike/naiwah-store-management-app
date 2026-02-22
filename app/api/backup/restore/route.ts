import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file extension
        if (!file.name.endsWith('.db')) {
            return NextResponse.json(
                { error: 'Invalid file type. Please upload a .db file.' },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Validate SQLite magic bytes
        const magic = buffer.slice(0, 16).toString('ascii');
        if (!magic.startsWith('SQLite format 3')) {
            return NextResponse.json(
                { error: 'Invalid SQLite database file' },
                { status: 400 }
            );
        }

        const dbPath = path.join(process.cwd(), 'dev.db');

        // Create a backup of current DB before restoring
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const backupDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        if (fs.existsSync(dbPath)) {
            const autoBackupPath = path.join(backupDir, `pre-restore-${timestamp}.db`);
            fs.copyFileSync(dbPath, autoBackupPath);
        }

        // Write the uploaded file as the new database
        fs.writeFileSync(dbPath, buffer);

        return NextResponse.json({
            success: true,
            message: 'Database restored successfully. Please restart the application.',
        });
    } catch (error: any) {
        console.error('Backup restore error:', error);
        return NextResponse.json(
            { error: 'Failed to restore database' },
            { status: 500 }
        );
    }
}
