"use server";

import { prisma } from "@/lib/prisma";

export type FilterParams = {
    startDate?: Date; // changed to Date for easier handling
    endDate?: Date;
    site?: string;
    facilityProvider?: string;
    engineeringCenter?: string;
};

export type DowntimeStats = {
    totalRecords: number;
    bySite: { x: string; y: number }[];
    byFacility: { x: string; y: number }[];
    byCenter: { x: string; y: number }[];
    byDate: { x: string; y: number }[];
};

export async function getDowntimeStats(filters: FilterParams): Promise<DowntimeStats> {
    const whereClause: any = {};

    if (filters.startDate || filters.endDate) {
        whereClause.PostingDate = {};
        if (filters.startDate) whereClause.PostingDate.gte = filters.startDate;
        if (filters.endDate) whereClause.PostingDate.lte = filters.endDate;
    }

    if (filters.site && filters.site !== "All") whereClause.Site = filters.site;
    if (filters.facilityProvider && filters.facilityProvider !== "All")
        whereClause.FacilityProvider = filters.facilityProvider;
    if (filters.engineeringCenter && filters.engineeringCenter !== "All")
        whereClause.EngineeringCenter = filters.engineeringCenter;

    try {
        const records = await prisma.mainDb.findMany({
            where: whereClause,
            select: {
                Site: true,
                FacilityProvider: true,
                EngineeringCenter: true,
                PostingDate: true,
            },
        });

        const totalRecords = records.length;

        // Helper to aggregate counts
        const aggregate = (key: keyof typeof records[0]) => {
            const counts: Record<string, number> = {};
            records.forEach((r) => {
                const val = r[key] as string;
                counts[val] = (counts[val] || 0) + 1;
            });
            return Object.entries(counts).map(([x, y]) => ({ x, y }));
        };

        // Aggregate by Date (YYYY-MM-DD)
        const dateCounts: Record<string, number> = {};
        records.forEach((r) => {
            const dateParams = new Date(r.PostingDate);
            const dateStr = dateParams.toISOString().split('T')[0];
            dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        });

        const byDate = Object.entries(dateCounts)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([x, y]) => ({ x, y }));


        return {
            totalRecords,
            bySite: aggregate("Site"),
            byFacility: aggregate("FacilityProvider"),
            byCenter: aggregate("EngineeringCenter"),
            byDate,
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return {
            totalRecords: 0,
            bySite: [],
            byFacility: [],
            byCenter: [],
            byDate: [],
        };
    }
}

export async function getFilterOptions() {
    try {
        // We can optimize this by using distinct inside findMany or groupBy if needed, 
        // but for now finding distinct values via groupBy is efficient enough for small datasets.
        // Prisma doesn't support distinct very flexibly on multiple columns in one query effectively for just lists
        // So we will do separate queries.

        const sites = await prisma.mainDb.groupBy({
            by: ['Site'],
            orderBy: { Site: 'asc' },
        });

        const facilities = await prisma.mainDb.groupBy({
            by: ['FacilityProvider'],
            orderBy: { FacilityProvider: 'asc' },
        });

        const centers = await prisma.mainDb.groupBy({
            by: ['EngineeringCenter'],
            orderBy: { EngineeringCenter: 'asc' },
        });

        return {
            sites: sites.map(s => s.Site).filter(s => s && s.trim() !== ""),
            facilities: facilities.map(f => f.FacilityProvider).filter(f => f && f.trim() !== ""),
            centers: centers.map(c => c.EngineeringCenter).filter(c => c && c.trim() !== ""),
        };

    } catch (error) {
        console.error("Error getting filter options:", error);
        return { sites: [], facilities: [], centers: [] };
    }
}
