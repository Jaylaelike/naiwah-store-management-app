'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addDeviceImage(
    deviceId: number,
    url: string,
    pbCollectionId: string,
    pbRecordId: string,
    pbFilename: string
) {
    try {
        await prisma.deviceImage.create({
            data: {
                deviceId,
                url,
                pbCollectionId,
                pbRecordId,
                pbFilename,
            },
        });
        revalidatePath(`/dashboard/devices/${deviceId}`);
    } catch (error) {
        console.error('Failed to add device image:', error);
        throw new Error('Failed to add device image');
    }
}

export async function removeDeviceImage(imageId: number, deviceId: number) {
    try {
        await prisma.deviceImage.delete({
            where: { id: imageId },
        });
        revalidatePath(`/dashboard/devices/${deviceId}`);
    } catch (error) {
        console.error('Failed to remove device image:', error);
        throw new Error('Failed to remove device image');
    }
}
