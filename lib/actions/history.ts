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
        // Get admin emails from database
        const { sendRepairEmail, getAdminEmails } = await import('@/lib/email');
        const adminEmails = await getAdminEmails();

        // Construct email data
        const emailData = {
            posting_date: new Date().toLocaleDateString('th-TH'),
            asset_id: device.assetId,
            device_name: device.deviceName || undefined,
            brand: device.brand || undefined,
            model: device.model || undefined,
            serial_number: device.serialNumber || undefined,
            status: 'Repair',
            section: device.section || undefined,
            center: device.center || undefined,
            station: device.station || undefined,
            description: description,
            repair_date: new Date().toLocaleDateString('th-TH'),
            logged_by: session?.user?.name || session?.user?.email || 'Unknown User',
            user_to: adminEmails.length > 0 ? adminEmails : [''],
            cc: [],
        };

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

        const isAdmin = session.user.role === 'Admin';

        if (isAdmin) {
            // Admin can transfer directly without approval
            await prisma.$transaction([
                prisma.device.update({
                    where: { id: deviceId },
                    data: {
                        section,
                        center,
                        station,
                        status: 'Active',
                    },
                }),
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
            return { success: true, message: 'Device transferred successfully' };
        } else {
            // Non-admin: create approval request
            const payload = JSON.stringify({
                fromSection: device.section,
                fromCenter: device.center,
                fromStation: device.station,
                fromLocation,
                toSection: section,
                toCenter: center,
                toStation: station,
                toLocation,
            });

            await prisma.approvalRequest.create({
                data: {
                    type: 'TRANSFER',
                    status: 'PENDING',
                    payload,
                    deviceId,
                    requestedById: userId,
                },
            });

            // Notify admins
            const { notifyAdmins } = await import('@/lib/notifications');
            await notifyAdmins(
                'Transfer Request',
                `${session.user.name || 'A user'} requested to transfer device ${device.assetId} from "${fromLocation}" to "${toLocation}"`,
                'WARNING',
                '/dashboard/admin/approvals'
            );

            // Send email to admin
            const { sendAdminRequestNotification } = await import('@/lib/email');
            await sendAdminRequestNotification(
                'TRANSFER',
                session?.user?.name || session?.user?.email || 'Unknown User',
                `โอนย้ายอุปกรณ์\nassetId: ${device.assetId}\ndeviceName: ${device.deviceName || '-'}\nจาก: ${fromLocation}\nไปยัง: ${toLocation}`,
                device.deviceName || device.assetId
            );

            revalidatePath('/dashboard/requests');
            revalidatePath('/dashboard/admin/approvals');
            return { success: true, pending: true, message: 'Transfer request submitted for admin approval' };
        }
    } catch (error) {
        console.error('Failed to transfer device:', error);
        return { success: false, error: 'Failed to transfer device' };
    }
}
