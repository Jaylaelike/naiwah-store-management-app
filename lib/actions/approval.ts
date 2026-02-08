'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/lib/notifications';
import { v7 as uuidv7 } from 'uuid';

export async function approveRequest(requestId: number) {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        throw new Error('Unauthorized');
    }

    const request = await prisma.approvalRequest.findUnique({
        where: { id: requestId },
        include: { requestedBy: true }, // Include requestedBy to get email
    });

    if (!request || request.status !== 'PENDING') {
        return { success: false, error: 'Request not found or already processed' };
    }

    const data = JSON.parse(request.payload);

    try {
        await prisma.$transaction(async (tx) => {
            // Execute the actual operation
            if (request.type === 'CREATE') {
                await tx.device.create({
                    data: {
                        ...data,
                        uuid: uuidv7(),
                    }
                });
            } else if (request.type === 'UPDATE') {
                if (!request.deviceId) throw new Error('Device ID missing for UPDATE');

                // Fetch current device for audit
                const currentDevice = await tx.device.findUnique({ where: { id: request.deviceId } });
                if (!currentDevice) throw new Error('Device not found');

                const changes = {} as Record<string, { old: any, new: any }>;
                const fields = ['assetId', 'status', 'function', 'deviceName', 'brand', 'model', 'serialNumber', 'ipAddress', 'macAddress', 'section', 'center', 'station', 'c_score', 'i_score', 'a_score', 'hostId'] as const;

                fields.forEach(field => {
                    if (data[field] === undefined) return; // Skip if field is not in payload
                    const oldVal = (currentDevice as any)[field];
                    const newVal = data[field];
                    if (String(oldVal || '') !== String(newVal || '')) {
                        changes[field] = { old: oldVal, new: newVal };
                    }
                });

                await tx.device.update({
                    where: { id: request.deviceId },
                    data,
                });

                if (Object.keys(changes).length > 0) {
                    await tx.deviceAuditLog.create({
                        data: {
                            deviceId: request.deviceId,
                            userId: request.requestedById, // Original requester is the actor
                            action: 'UPDATE',
                            details: JSON.stringify(changes),
                        },
                    });
                }
            } else if (request.type === 'DELETE') {
                if (!request.deviceId) throw new Error('Device ID missing for DELETE');
                await tx.device.delete({
                    where: { id: request.deviceId },
                });
            }

            // Update request status
            await tx.approvalRequest.update({
                where: { id: requestId },
                data: {
                    status: 'APPROVED',
                    reviewedById: parseInt(session.user.id),
                },
            });
        });

        await createNotification(
            request.requestedById,
            'Request Approved',
            `Your ${request.type} request for device updates has been approved.`,
            'SUCCESS',
            '/dashboard/requests'
        );

        // Send Email Notification
        if (request.requestedBy?.email) {
            // Dynamically import to safely handle dependencies
            const { sendApprovalEmail } = await import('@/lib/email');

            let details = '';
            if (request.type === 'CREATE') {
                details = `New Device Created: ${data.assetId || 'Unknown ID'}`;
            } else if (request.type === 'UPDATE') {
                details = `Device Update for ID: ${request.deviceId}`;
            } else if (request.type === 'DELETE') {
                details = `Device Deleted ID: ${request.deviceId}`;
            }

            await sendApprovalEmail(
                request.requestedBy.email,
                request.type,
                details,
                session.user.name || 'Admin'
            );
        }

        revalidatePath('/dashboard/admin/approvals');
        revalidatePath('/dashboard/devices');
        return { success: true };
    } catch (error) {
        console.error('Failed to approve request:', error);
        return { success: false, error: 'Failed to process approval' };
    }
}

export async function rejectRequest(requestId: number) {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        throw new Error('Unauthorized');
    }

    try {
        const request = await prisma.approvalRequest.findUnique({
            where: { id: requestId },
        });

        if (!request) {
            return { success: false, error: 'Request not found' };
        }

        await prisma.approvalRequest.update({
            where: { id: requestId },
            data: {
                status: 'REJECTED',
                reviewedById: parseInt(session.user.id),
            },
        });

        await createNotification(
            request.requestedById,
            'Request Rejected',
            `Your ${request.type} request has been rejected.`,
            'ERROR',
            '/dashboard/requests'
        );

        revalidatePath('/dashboard/admin/approvals');
        return { success: true };
    } catch (error) {
        console.error('Failed to reject request:', error);
        return { success: false, error: 'Failed to reject request' };
    }
}

export async function cancelRequest(requestId: number) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = parseInt(session.user.id);
    const request = await prisma.approvalRequest.findUnique({
        where: { id: requestId },
    });

    if (!request) {
        return { success: false, error: 'Request not found' };
    }

    if (request.requestedById !== userId && session.user.role !== 'Admin') {
        return { success: false, error: 'Unauthorized to cancel this request' };
    }

    if (request.status !== 'PENDING') {
        return { success: false, error: 'Cannot cancel processed request' };
    }

    try {
        await prisma.approvalRequest.delete({
            where: { id: requestId },
        });

        revalidatePath('/dashboard/requests');
        revalidatePath('/dashboard/admin/approvals');
        return { success: true };
    } catch (error) {
        console.error('Failed to cancel request:', error);
        return { success: false, error: 'Failed to cancel request' };
    }
}
