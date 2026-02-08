import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const repairs = await prisma.repairHistory.findMany({
            include: {
                device: true,
                loggedBy: true,
            },
            orderBy: { repairDate: 'desc' },
        });

        const csvHeader = 'Date,Asset ID,Device Name,Description,Logged By,Logged By (Thai Name)\n';
        const csvRows = repairs.map((repair: any) => {
            const clean = (str: string | null) => `"${(str || '').replace(/"/g, '""')}"`;
            const loggerName = repair.loggedBy?.username || 'Unknown';
            const loggerThaiName = repair.loggedBy?.thaiName || '';

            return [
                clean(repair.repairDate.toISOString()),
                clean(repair.device.assetId),
                clean(repair.device.deviceName),
                clean(repair.description),
                clean(loggerName),
                clean(loggerThaiName),
            ].join(',');
        });

        const csvContent = csvHeader + csvRows.join('\n');
        // Add BOM for Excel compatibility with UTF-8
        const bom = '\uFEFF';
        const finalContent = bom + csvContent;

        return new NextResponse(finalContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="repair_report_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error('Failed to generate repair report:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
