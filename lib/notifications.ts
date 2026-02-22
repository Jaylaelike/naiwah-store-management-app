import { prisma } from '@/lib/prisma';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export async function createNotification(
    userId: number,
    title: string,
    message: string,
    type: NotificationType = 'INFO',
    link?: string
) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link,
            },
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
}

export async function notifyAdmins(title: string, message: string, type: NotificationType = 'INFO', link?: string) {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'Admin' },
            select: { id: true },
        });

        for (const admin of admins) {
            await createNotification(admin.id, title, message, type, link);
        }
    } catch (error) {
        console.error('Failed to notify admins:', error);
    }
}
