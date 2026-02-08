'use server';

import { prisma } from '@/lib/prisma';

export async function getDashboardStats() {
    try {
        const [total, active, spare, repair, disposed] = await Promise.all([
            prisma.device.count(),
            prisma.device.count({ where: { status: 'Active' } }),
            prisma.device.count({ where: { status: 'Spare' } }),
            prisma.device.count({ where: { status: 'Repair' } }),
            prisma.device.count({ where: { status: 'Disposed' } }),
        ]);

        return {
            total,
            active,
            spare,
            repair,
            disposed,
        };
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        return {
            total: 0,
            active: 0,
            spare: 0,
            repair: 0,
            disposed: 0,
        };
    }
}
