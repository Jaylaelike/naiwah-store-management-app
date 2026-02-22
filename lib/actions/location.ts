'use server';

import { prisma } from '@/lib/prisma';

export interface UniqueLocations {
    sections: string[];
    centers: string[];
    stations: string[];
}

/**
 * Get unique location values from all devices.
 * Used for populating location dropdowns in transfer dialog.
 */
export async function getUniqueLocations(): Promise<UniqueLocations> {
    try {
        const devices = await prisma.device.findMany({
            select: {
                section: true,
                center: true,
                station: true,
            },
        });

        const sectionsSet = new Set<string>();
        const centersSet = new Set<string>();
        const stationsSet = new Set<string>();

        for (const device of devices) {
            if (device.section) sectionsSet.add(device.section);
            if (device.center) centersSet.add(device.center);
            if (device.station) stationsSet.add(device.station);
        }

        return {
            sections: Array.from(sectionsSet).sort(),
            centers: Array.from(centersSet).sort(),
            stations: Array.from(stationsSet).sort(),
        };
    } catch (error) {
        console.error('Failed to fetch unique locations:', error);
        return {
            sections: [],
            centers: [],
            stations: [],
        };
    }
}
