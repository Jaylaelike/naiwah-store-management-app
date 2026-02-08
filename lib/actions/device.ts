'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth'; // Import auth
import { z } from 'zod'; // We'll need zod for validation, although we might do it in the form component too.
import { notifyAdmins } from '@/lib/notifications';
import { pb } from '@/lib/pocketbase';
import { addDeviceImage } from '@/lib/actions/image';
import { v7 as uuidv7 } from 'uuid';
import { sendDeviceNotification } from '@/lib/email';

// Define schema for input validation
const DeviceSchema = z.object({
    assetId: z.string().min(1, "Asset ID is required"),
    status: z.string().min(1, "Status is required"),
    function: z.string().nullable().optional(),
    deviceName: z.string().nullable().optional(),
    brand: z.string().nullable().optional(),
    model: z.string().nullable().optional(),
    serialNumber: z.string().nullable().optional(),
    ipAddress: z.string().nullable().optional(),
    macAddress: z.string().nullable().optional(),
    section: z.string().nullable().optional(),
    center: z.string().nullable().optional(),
    station: z.string().nullable().optional(),
    c_score: z.string().nullable().optional(),
    i_score: z.string().nullable().optional(),
    a_score: z.string().nullable().optional(),
    hostId: z.string().nullable().optional(),
    // Image not strictly in Zod schema here as we handle FormData manually for file, but good to keep consistency if parsing
});

// ... (types and getters)
export type DeviceState = {
    errors?: {
        assetId?: string[];
        status?: string[];
        [key: string]: string[] | undefined;
    };
    message?: string | null;
};

export async function checkAssetIdUnique(assetId: string, currentId?: number) {
    const existing = await prisma.device.findUnique({
        where: { assetId },
    });

    if (existing && existing.id !== currentId) {
        return false;
    }
    return true;
}

export async function getDevices() {
    try {
        const devices = await prisma.device.findMany({
            orderBy: { createdAt: 'desc' },
            include: { images: true },
        });
        return devices;
    } catch (error) {
        console.error('Failed to fetch devices:', error);
        throw new Error('Failed to fetch devices');
    }
}

export async function getDeviceById(id: number) {
    try {
        const device = await prisma.device.findUnique({
            where: { id },
            include: { images: true },
        });
        return device;
    } catch (error) {
        console.error('Failed to fetch device:', error);
        throw new Error('Failed to fetch device');
    }
}

export async function getDeviceByAssetId(assetId: string) {
    try {
        const device = await prisma.device.findUnique({
            where: { assetId },
        });
        return device;
    } catch (error) {
        console.error('Failed to fetch device by Asset ID:', error);
        throw new Error('Failed to fetch device');
    }
}

export async function getDeviceByUuid(uuid: string) {
    try {
        const device = await prisma.device.findFirst({
            where: { uuid },
        });
        return device;
    } catch (error) {
        console.error('Failed to fetch device by UUID:', error);
        throw new Error('Failed to fetch device');
    }
}

export async function createDevice(prevState: DeviceState, formData: FormData) {
    const validatedFields = DeviceSchema.safeParse({
        assetId: formData.get('assetId'),
        status: formData.get('status'),
        function: formData.get('function'),
        deviceName: formData.get('deviceName'),
        brand: formData.get('brand'),
        model: formData.get('model'),
        serialNumber: formData.get('serialNumber'),
        ipAddress: formData.get('ipAddress'),
        macAddress: formData.get('macAddress'),
        section: formData.get('section'),
        center: formData.get('center'),
        station: formData.get('station'),
        c_score: formData.get('c_score'),
        i_score: formData.get('i_score'),
        a_score: formData.get('a_score'),
        hostId: formData.get('hostId'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Device.',
        };
    }

    const { assetId, status, function: functionVal, deviceName, brand, model, serialNumber, ipAddress, macAddress, section, center, station, c_score, i_score, a_score, hostId } = validatedFields.data;

    // ... (uniqueness check omitted) ...
    const isUnique = await checkAssetIdUnique(assetId);
    if (!isUnique) {
        return {
            errors: {
                assetId: ['Asset ID already exists'],
            },
            message: 'Asset ID already exists.',
        };
    }

    // Check user role
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;
    if (!userId) {
        return { message: 'Unauthorized' };
    }

    if (session?.user?.role !== 'Admin') {
        const payload = JSON.stringify({
            assetId, status, function: functionVal, deviceName, brand, model,
            serialNumber, ipAddress, macAddress, section, center, station,
            c_score, i_score, a_score, hostId
        });

        try {
            await prisma.approvalRequest.create({
                data: {
                    type: 'CREATE',
                    payload,
                    requestedById: userId,
                },
            });
            await notifyAdmins(
                'New Device Request',
                'A new device creation request has been submitted.',
                'INFO',
                '/dashboard/admin/approvals'
            );

            // Send email to admin
            const { sendAdminRequestNotification } = await import('@/lib/email');
            const createFields = ['assetId', 'deviceName', 'brand', 'model', 'status', 'section', 'center', 'station'];
            const createDetails = createFields
                .filter(f => (validatedFields.data as any)[f])
                .map(f => `${f}: ${(validatedFields.data as any)[f]}`)
                .join('\n');
            await sendAdminRequestNotification(
                'CREATE',
                session?.user?.name || session?.user?.email || 'Unknown User',
                `สร้างอุปกรณ์ใหม่\n${createDetails}`,
                deviceName || assetId
            );
            // return { message: 'Request Submitted for Approval' };
        } catch (error) {
            console.error('Failed to submit request:', error);
            return { message: 'Failed to submit request' };
        }
        revalidatePath('/dashboard/requests');
        redirect('/dashboard/requests');
    }

    try {
        const newDevice = await prisma.device.create({
            data: {
                uuid: uuidv7(),
                assetId,
                status,
                function: functionVal,
                deviceName,
                brand,
                model,
                serialNumber,
                ipAddress,
                macAddress,
                section,
                center,
                station,
                createdById: userId, // Track creator
                c_score,
                i_score,
                a_score,
                hostId,
            },
        });

        const image = formData.get('image');
        if (image && image instanceof File && image.size > 0) {
            try {
                const pbFormData = new FormData();
                pbFormData.append('image', image);
                pbFormData.append('device_id', newDevice.id.toString());

                const record = await pb.collection('device_images').create(pbFormData);
                const url = pb.files.getURL(record, record.image);

                await addDeviceImage(
                    newDevice.id,
                    url,
                    record.collectionId,
                    record.id,
                    record.image
                );
            } catch (uploadError) {
                console.error('Failed to upload image:', uploadError);
                // Continue without failing the device creation, potentially warn user?
            }
        }

        // Send Notification
        await sendDeviceNotification(
            'CREATE',
            deviceName || assetId,
            `Asset ID: ${assetId}\nStatus: ${status}\nLocation: ${[section, center, station].filter(Boolean).join(' > ')}`,
            session?.user?.name || session?.user?.email || 'Unknown User'
        );

    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to Create Device.',
        };
    }

    revalidatePath('/dashboard/devices');
    redirect('/dashboard/devices');
}

export async function updateDevice(id: number, prevState: DeviceState, formData: FormData) {
    const validatedFields = DeviceSchema.safeParse({
        assetId: formData.get('assetId'),
        status: formData.get('status'),
        function: formData.get('function'),
        deviceName: formData.get('deviceName'),
        brand: formData.get('brand'),
        model: formData.get('model'),
        serialNumber: formData.get('serialNumber'),
        ipAddress: formData.get('ipAddress'),
        macAddress: formData.get('macAddress'),
        section: formData.get('section'),
        center: formData.get('center'),
        station: formData.get('station'),
        c_score: formData.get('c_score'),
        i_score: formData.get('i_score'),
        a_score: formData.get('a_score'),
        hostId: formData.get('hostId'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Device.',
        };
    }

    const { assetId, status, function: functionVal, deviceName, brand, model, serialNumber, ipAddress, macAddress, section, center, station, c_score, i_score, a_score, hostId } = validatedFields.data;

    // ... (uniqueness check omitted) ...
    const isUnique = await checkAssetIdUnique(assetId, id);
    if (!isUnique) {
        return {
            errors: {
                assetId: ['Asset ID already exists'],
            },
            message: 'Asset ID already exists.',
        };
    }

    // Check user role
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;
    if (!userId) {
        return { message: 'Unauthorized' };
    }

    if (session?.user?.role !== 'Admin') {
        const payload = JSON.stringify({
            assetId, status, function: functionVal, deviceName, brand, model,
            serialNumber, ipAddress, macAddress, section, center, station,
            c_score, i_score, a_score, hostId
        });

        try {
            await prisma.approvalRequest.create({
                data: {
                    type: 'UPDATE',
                    payload,
                    deviceId: id,
                    requestedById: userId,
                },
            });
            await notifyAdmins(
                'Update Device Request',
                `An update request for device ID ${id} has been submitted.`,
                'INFO',
                '/dashboard/admin/approvals'
            );

            // Send email to admin
            const { sendAdminRequestNotification } = await import('@/lib/email');
            const updateFields = ['assetId', 'status', 'function', 'deviceName', 'brand', 'model', 'serialNumber', 'ipAddress', 'macAddress', 'section', 'center', 'station', 'c_score', 'i_score', 'a_score', 'hostId'];
            const updateDetails = updateFields
                .filter(f => (validatedFields.data as any)[f] != null && (validatedFields.data as any)[f] !== '')
                .map(f => `${f}: ${(validatedFields.data as any)[f]}`)
                .join('\n');
            await sendAdminRequestNotification(
                'UPDATE',
                session?.user?.name || session?.user?.email || 'Unknown User',
                `อัปเดตอุปกรณ์ ID: ${id}\n${updateDetails}`,
                deviceName || assetId
            );
            // return { message: 'Update Request Submitted for Approval' };
        } catch (error) {
            console.error('Failed to submit request:', error);
            return { message: 'Failed to submit request' };
        }
        revalidatePath('/dashboard/requests');
        redirect('/dashboard/requests');
    }

    try {
        const currentDevice = await prisma.device.findUnique({ where: { id } });
        if (!currentDevice) throw new Error('Device not found');

        const changes = {} as Record<string, { old: any, new: any }>;
        const fields = ['assetId', 'status', 'function', 'deviceName', 'brand', 'model', 'serialNumber', 'ipAddress', 'macAddress', 'section', 'center', 'station', 'c_score', 'i_score', 'a_score', 'hostId'] as const;

        // Compare values
        const newData = { assetId, status, function: functionVal, deviceName, brand, model, serialNumber, ipAddress, macAddress, section, center, station, c_score, i_score, a_score, hostId };

        fields.forEach(field => {
            const oldVal = (currentDevice as any)[field];
            const newVal = newData[field];
            // Simple comparison, treating null/undefined equality loosely or strictly as needed. 
            // Here comparing string representation can guard against null vs undefined issues if types vary.
            if (String(oldVal || '') !== String(newVal || '')) {
                changes[field] = { old: oldVal, new: newVal };
            }
        });

        await prisma.$transaction(async (tx) => {
            await tx.device.update({
                where: { id },
                data: {
                    ...newData,
                    updatedById: userId,
                },
            });

            if (Object.keys(changes).length > 0) {
                await tx.deviceAuditLog.create({
                    data: {
                        deviceId: id,
                        userId: userId,
                        action: 'UPDATE',
                        details: JSON.stringify(changes),
                    },
                });
            }
        });

        // Send Notification
        const changeDetails = Object.entries(changes)
            .map(([key, val]) => `${key}: ${val.old} -> ${val.new}`)
            .join('\n');

        if (changeDetails) {
            await sendDeviceNotification(
                'UPDATE',
                deviceName || assetId,
                changeDetails,
                session?.user?.name || session?.user?.email || 'Unknown User'
            );
        }

    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to Update Device.',
        };
    }

    revalidatePath('/dashboard/devices');
    redirect('/dashboard/devices');
}

export async function deleteDevice(id: number) {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    if (!userId) {
        throw new Error('Unauthorized');
    }

    if (session?.user?.role !== 'Admin') {
        try {
            // Get device info for email
            const deviceForEmail = await prisma.device.findUnique({
                where: { id },
                select: { assetId: true, deviceName: true }
            });

            await prisma.approvalRequest.create({
                data: {
                    type: 'DELETE',
                    payload: '{}',
                    deviceId: id,
                    requestedById: userId,
                },
            });
            await notifyAdmins(
                'Delete Device Request',
                `A delete request for device ID ${id} has been submitted.`,
                'WARNING',
                '/dashboard/admin/approvals'
            );

            // Send email to admin
            const { sendAdminRequestNotification } = await import('@/lib/email');
            await sendAdminRequestNotification(
                'DELETE',
                session?.user?.name || session?.user?.email || 'Unknown User',
                `ลบอุปกรณ์\nassetId: ${deviceForEmail?.assetId || 'N/A'}\ndeviceName: ${deviceForEmail?.deviceName || 'N/A'}`,
                deviceForEmail?.deviceName || deviceForEmail?.assetId || `ID: ${id}`
            );
            // Ideally we should return a message, but delete action might be triggered differently. 
            // For now, assuming void return, forcing revalidate might show "Pending" state if implemented?
            // Actually, server actions invoked from forms or buttons usually expect void or simple return.
            // return { message: 'Delete Request Submitted' };
        } catch (error) {
            console.error('Failed to submit delete request:', error);
            throw new Error('Failed to submit delete request');
        }
        revalidatePath('/dashboard/requests');
        redirect('/dashboard/requests');
    }

    try {
        await prisma.device.delete({
            where: { id },
        });

        // Send Notification
        await sendDeviceNotification(
            'DELETE',
            `ID: ${id}`,
            `Device ID ${id} was deleted.`,
            session?.user?.name || session?.user?.email || 'Unknown User'
        );

        revalidatePath('/dashboard/devices');
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to delete device');
    }
}

export async function updateDeviceCia(id: number, formData: FormData) {
    console.log(`[updateDeviceCia] Starting update for Device ID: ${id}`);

    const CiaSchema = z.object({
        c_score: z.string().optional(),
        i_score: z.string().optional(),
        a_score: z.string().optional(),
        hostId: z.string().optional(),
    });

    const validatedFields = CiaSchema.safeParse({
        c_score: formData.get('c_score'),
        i_score: formData.get('i_score'),
        a_score: formData.get('a_score'),
        hostId: formData.get('hostId'),
    });

    if (!validatedFields.success) {
        console.error('[updateDeviceCia] Validation Failed:', validatedFields.error);
        return { success: false, error: 'Invalid Fields' };
    }

    const { c_score, i_score, a_score, hostId } = validatedFields.data;
    console.log(`[updateDeviceCia] Validated Data:`, { c_score, i_score, a_score, hostId });

    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;
    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    // Role Check
    if (session?.user?.role !== 'Admin') {
        const payload = JSON.stringify({
            c_score, i_score, a_score, hostId
        });

        try {
            // Get device info for email
            const deviceForCiaEmail = await prisma.device.findUnique({
                where: { id },
                select: { assetId: true, deviceName: true }
            });

            await prisma.approvalRequest.create({
                data: {
                    type: 'UPDATE',
                    payload,
                    deviceId: id,
                    requestedById: userId,
                },
            });
            await notifyAdmins(
                'CIA Update Request',
                `A CIA update request for device ID ${id} has been submitted.`,
                'INFO',
                '/dashboard/admin/approvals'
            );

            // Send email to admin
            const { sendAdminRequestNotification } = await import('@/lib/email');
            const ciaDetails = ['c_score', 'i_score', 'a_score', 'hostId']
                .filter(f => (validatedFields.data as any)[f] != null && (validatedFields.data as any)[f] !== '')
                .map(f => `${f}: ${(validatedFields.data as any)[f]}`)
                .join('\n');
            await sendAdminRequestNotification(
                'UPDATE',
                session?.user?.name || session?.user?.email || 'Unknown User',
                `อัปเดต CIA Score\nอุปกรณ์: ${deviceForCiaEmail?.deviceName || deviceForCiaEmail?.assetId || `ID: ${id}`}\n${ciaDetails}`,
                deviceForCiaEmail?.deviceName || deviceForCiaEmail?.assetId || `ID: ${id}`
            );

            return { success: true, message: 'Request Submitted for Approval' };
        } catch (error) {
            console.error('Failed to submit request:', error);
            return { success: false, error: 'Failed to submit request' };
        }
    }

    try {
        const currentDevice = await prisma.device.findUnique({ where: { id } });
        if (!currentDevice) return { success: false, error: 'Device not found' };

        const changes = {} as Record<string, { old: any, new: any }>;
        const newData = { c_score, i_score, a_score, hostId };
        const fields = ['c_score', 'i_score', 'a_score', 'hostId'] as const;

        fields.forEach(field => {
            const oldVal = (currentDevice as any)[field];
            const newVal = newData[field];
            if (String(oldVal || '') !== String(newVal || '')) {
                changes[field] = { old: oldVal, new: newVal };
            }
        });

        await prisma.$transaction(async (tx) => {
            await tx.device.update({
                where: { id },
                data: {
                    ...newData,
                    updatedById: userId,
                },
            });

            if (Object.keys(changes).length > 0) {
                await tx.deviceAuditLog.create({
                    data: {
                        deviceId: id,
                        userId: userId,
                        action: 'UPDATE',
                        details: JSON.stringify(changes),
                    },
                });
            }
        });

        // Send Notification if changes occurred
        const changeDetails = Object.entries(changes)
            .map(([key, val]) => `${key}: ${val.old} -> ${val.new}`)
            .join('\n');

        if (changeDetails) {
            await sendDeviceNotification(
                'UPDATE',
                currentDevice.deviceName || currentDevice.assetId,
                `CIA Scores Update:\n${changeDetails}`,
                session?.user?.name || session?.user?.email || 'Unknown User'
            );
        }

        revalidatePath('/dashboard/cia');
        return { success: true, message: 'Updated Successfully' };
    } catch (error) {
        console.error('[updateDeviceCia] DB Error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Database Update Failed' };
    }
}
