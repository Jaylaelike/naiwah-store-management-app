'use server'

import { prisma } from '@/lib/prisma'
import { CalendarEvent } from '@/components/calendar/calendar-types'

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
    const [repairs, transfers, audits] = await Promise.all([
        prisma.repairHistory.findMany({
            include: {
                device: true,
            },
        }),
        prisma.transferHistory.findMany({
            include: {
                device: true,
            },
        }),
        prisma.deviceAuditLog.findMany({
            include: {
                device: true,
            },
        }),
    ])

    const repairEvents: CalendarEvent[] = repairs.map((repair) => ({
        id: `repair-${repair.id}`,
        title: `Repair: ${repair.device.assetId} - ${repair.description}`,
        start: repair.repairDate,
        end: new Date(repair.repairDate.getTime() + 60 * 60 * 1000), // +1 hour
        color: 'red',
        deviceId: repair.deviceId,
    }))

    const transferEvents: CalendarEvent[] = transfers.map((transfer) => ({
        id: `transfer-${transfer.id}`,
        title: `Transfer: ${transfer.device.assetId} (${transfer.fromLocation || '?'} -> ${transfer.toLocation || '?'})`,
        start: transfer.transferDate,
        end: new Date(transfer.transferDate.getTime() + 60 * 60 * 1000), // +1 hour
        color: 'blue',
        deviceId: repairEvents.find(e => e.id === `repair-${repairEvents.length}`)?.deviceId || transfer.deviceId, // Fallback logic is not needed here, simpler is better
    } as any))

    // Correcting the above mapping logic for transfers to be cleaner avoids the "any" cast and logic error
    // Let's rewrite the mapping clearly without the mistake in the previous block

    const transferEventsClean: CalendarEvent[] = transfers.map((transfer) => ({
        id: `transfer-${transfer.id}`,
        title: `Transfer: ${transfer.device.assetId} (${transfer.fromLocation || '?'} -> ${transfer.toLocation || '?'})`,
        start: transfer.transferDate,
        end: new Date(transfer.transferDate.getTime() + 60 * 60 * 1000), // +1 hour
        color: 'blue',
        deviceId: transfer.deviceId,
    }))


    const auditEvents: CalendarEvent[] = audits.map((audit) => ({
        id: `audit-${audit.id}`,
        title: `Audit: ${audit.device.assetId} - ${audit.action}`,
        start: audit.createdAt,
        end: new Date(audit.createdAt.getTime() + 60 * 60 * 1000), // +1 hour
        color: 'slate',
        deviceId: audit.deviceId,
    }))

    return [...repairEvents, ...transferEventsClean, ...auditEvents]
}
