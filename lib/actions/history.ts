'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { notifyAdmins } from '@/lib/notifications';

export type HistoryItem = {
    id: number;
    type: 'Repair' | 'Transfer' | 'Update';
    date: Date;
    description: string;
    details: any; // Flexible for now
    user: {
        name: string | null;
        image: string | null;
    } | null;
};

export async function getDeviceHistory(deviceId: number): Promise<HistoryItem[]> {
    try {
        const [repairs, transfers, auditLogs] = await Promise.all([
            prisma.repairHistory.findMany({
                where: { deviceId },
                include: { loggedBy: true },
                orderBy: { repairDate: 'desc' },
            }),
            prisma.transferHistory.findMany({
                where: { deviceId },
                include: { approvedBy: true },
                orderBy: { transferDate: 'desc' },
            }),
            prisma.deviceAuditLog.findMany({
                where: { deviceId },
                include: { user: true },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        const history: HistoryItem[] = [
            ...repairs.map((r) => ({
                id: r.id,
                type: 'Repair' as const,
                date: r.repairDate,
                description: r.description,
                details: {},
                user: r.loggedBy ? {
                    name: r.loggedBy.thaiName || r.loggedBy.engName || r.loggedBy.username,
                    image: r.loggedBy.imageUrl
                } : null,
            })),
            ...transfers.map((t) => ({
                id: t.id,
                type: 'Transfer' as const,
                date: t.transferDate,
                description: `Transferred to ${t.toLocation}`,
                details: {
                    from: t.fromLocation,
                    to: t.toLocation,
                },
                user: t.approvedBy ? {
                    name: t.approvedBy.thaiName || t.approvedBy.engName || t.approvedBy.username,
                    image: t.approvedBy.imageUrl
                } : null,
            })),
            ...auditLogs.map((a) => {
                let details = {};
                try {
                    details = JSON.parse(a.details);
                } catch (e) {
                    // ignore parse error
                }
                const fieldCount = Object.keys(details).length;

                return {
                    id: a.id,
                    type: 'Update' as const,
                    date: a.createdAt,
                    description: `Updated ${fieldCount} field${fieldCount !== 1 ? 's' : ''}`,
                    details: details,
                    user: a.user ? {
                        name: a.user.thaiName || a.user.engName || a.user.username,
                        image: a.user.imageUrl
                    } : null
                };
            }),
        ];

        // Sort combined history by date descending
        return history.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
        console.error('Failed to fetch device history:', error);
        return [];
    }
}

export async function logRepair(deviceId: number, description: string) {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    if (!userId) {
        throw new Error('Unauthorized');
    }

    try {
        // Fetch device details for email
        const device = await prisma.device.findUnique({ where: { id: deviceId } });
        if (!device) throw new Error('Device not found');

        // Create repair entry
        await prisma.repairHistory.create({
            data: {
                deviceId,
                description,
                loggedById: userId,
            },
        });

        // Optionally update device status to 'Repair' if it's unrelated
        await prisma.device.update({
            where: { id: deviceId },
            data: { status: 'Repair' },
        });

        await notifyAdmins(
            'Repair Logged',
            `A repair log was added for device ID ${deviceId}: "${description}"`,
            'INFO',
            `/dashboard/devices/${deviceId}`
        );

        // Send Email Notification
        // Since we don't have explicit email input in the form, we'll try to determine recipients.
        // For now, we'll send to "nocadmin@thaipbs.or.th" as per reference, or perhaps a configured list.
        // The user request example had `user_to` in the body. I'll hardcode a default for demonstration
        // or attempt to find relevant users. Let's start with a safe default or checking env.

        // Construct email data
        const emailData = {
            posting_date: new Date().toLocaleDateString('th-TH'),
            station_name: device.station || 'Unknown Station',
            facility_name: device.center || device.section || 'Unknown Facility',
            detail_data: description,
            start_time: new Date().toLocaleTimeString('th-TH'), // Approximation
            end_time: 'N/A', // Not known at start of repair
            sum_time: 'N/A',
            user_to: ['nocadmin@thaipbs.or.th'], // Default recipient as per user example logic, adjust if needed
            cc: [],
        };

        // Dynamically import to avoid circular dependency issues if any, or just standard import at top.
        // We'll standard import at top.
        const { sendRepairEmail } = await import('@/lib/email');
        await sendRepairEmail(emailData);

        revalidatePath(`/dashboard/devices/${deviceId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to log repair:', error);
        return { success: false, error: 'Failed to log repair' };
    }
}

export async function transferDevice(
    deviceId: number,
    section: string | undefined,
    center: string | undefined,
    station: string | undefined
) {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    if (!userId) {
        throw new Error('Unauthorized');
    }

    try {
        // Get current device location for history
        const device = await prisma.device.findUnique({ where: { id: deviceId } });
        if (!device) throw new Error('Device not found');

        const fromLocation = [device.section, device.center, device.station].filter(Boolean).join(' > ') || 'Unknown';
        const toLocation = [section, center, station].filter(Boolean).join(' > ');

        await prisma.$transaction([
            // Update device location
            prisma.device.update({
                where: { id: deviceId },
                data: {
                    section,
                    center,
                    station,
                    status: 'Active', // Assume transfer implies active use, or keep as is? Let's default to Active if transferring.
                },
            }),
            // Log transfer
            prisma.transferHistory.create({
                data: {
                    deviceId,
                    fromLocation,
                    toLocation,
                    approvedById: userId,
                },
            }),
        ]);

        revalidatePath(`/dashboard/devices/${deviceId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to transfer device:', error);
        return { success: false, error: 'Failed to transfer device' };
    }
}
