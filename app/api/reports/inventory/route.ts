import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { Device } from '@prisma/client';

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const devices = await prisma.device.findMany({
            orderBy: { assetId: 'asc' },
        });

        const csvHeader = 'Asset ID,Name,Function,Brand,Model,Serial Number,Status,Section,Center,Station,IP Address,MAC Address,Confidentiality,Integrity,Availability,Host ID,Created At\n';
        const csvRows = devices.map((device: Device) => {
            const clean = (str: string | null) => `"${(str || '').replace(/"/g, '""')}"`;
            return [
                clean(device.assetId),
                clean(device.deviceName),
                clean(device.function),
                clean(device.brand),
                clean(device.model),
                clean(device.serialNumber),
                clean(device.status),
                clean(device.section),
                clean(device.center),
                clean(device.station),
                clean(device.ipAddress),
                clean(device.macAddress),
                clean(device.c_score),
                clean(device.i_score),
                clean(device.a_score),
                clean(device.hostId),
                clean(device.createdAt.toISOString()),
            ].join(',');
        });

        const csvContent = csvHeader + csvRows.join('\n');
        // Add BOM for Excel compatibility with UTF-8
        const bom = '\uFEFF';
        const finalContent = bom + csvContent;

        return new NextResponse(finalContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="inventory_report_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error('Failed to generate inventory report:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
