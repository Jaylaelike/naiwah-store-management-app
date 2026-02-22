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

// --- Multidimensional Analytics ---

export interface ChartDataItem {
    name: string;
    value: number;
}

export interface StackedSectionItem {
    section: string;
    Active: number;
    Spare: number;
    Repair: number;
    Disposed: number;
    Unknown: number;
    total: number;
}

export interface CiaRadarItem {
    dimension: string;
    high: number;
    medium: number;
    low: number;
    unset: number;
}

export interface TimelineItem {
    month: string;
    created: number;
    updated: number;
}

export interface FunctionItem {
    name: string;
    value: number;
    fill: string;
}

export interface CenterStatusItem {
    center: string;
    Active: number;
    Spare: number;
    Repair: number;
    Disposed: number;
    Unknown: number;
    total: number;
}

export interface AnalyticsData {
    statusData: ChartDataItem[];
    sectionData: ChartDataItem[];
    ciaData: {
        c: ChartDataItem[];
        i: ChartDataItem[];
        a: ChartDataItem[];
    };
    // Multidimensional perspectives
    sectionByStatus: StackedSectionItem[];
    ciaRadar: CiaRadarItem[];
    activityTimeline: TimelineItem[];
    functionDistribution: FunctionItem[];
    centerByStatus: CenterStatusItem[];
    riskMatrix: { c: string; i: string; a: string; count: number }[];
}

const FUNCTION_COLORS = [
    '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

function normalizeCiaLevel(score: string | null): 'high' | 'medium' | 'low' | 'unset' {
    if (!score) return 'unset';
    const s = score.toLowerCase().trim();
    // Handle compound formats like "3 - สูง", "2 - ปานกลาง", "1 - ต่ำ"
    if (s === 'high' || s.includes('สูง') || s === '3' || s.startsWith('3 ')) return 'high';
    if (s === 'medium' || s === 'med' || s.includes('ปานกลาง') || s === '2' || s.startsWith('2 ')) return 'medium';
    if (s === 'low' || s.includes('ต่ำ') || s === '1' || s.startsWith('1 ')) return 'low';
    return 'unset';
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
    try {
        const devices = await prisma.device.findMany({
            select: {
                status: true,
                section: true,
                center: true,
                function: true,
                c_score: true,
                i_score: true,
                a_score: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // 1) Status distribution
        const statusCounts: Record<string, number> = {};
        devices.forEach(d => {
            const status = d.status || 'Unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

        // 2) Section distribution (flat top 10)
        const sectionCounts: Record<string, number> = {};
        devices.forEach(d => {
            const section = d.section || 'ไม่ระบุ';
            sectionCounts[section] = (sectionCounts[section] || 0) + 1;
        });
        const sectionData = Object.entries(sectionCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        // 3) CIA scores distribution
        const cScoreCounts: Record<string, number> = {};
        const iScoreCounts: Record<string, number> = {};
        const aScoreCounts: Record<string, number> = {};
        devices.forEach(d => {
            const c = d.c_score || 'ไม่กำหนด';
            const i = d.i_score || 'ไม่กำหนด';
            const a = d.a_score || 'ไม่กำหนด';
            cScoreCounts[c] = (cScoreCounts[c] || 0) + 1;
            iScoreCounts[i] = (iScoreCounts[i] || 0) + 1;
            aScoreCounts[a] = (aScoreCounts[a] || 0) + 1;
        });
        const formatCiaData = (counts: Record<string, number>) =>
            Object.entries(counts).map(([name, value]) => ({ name, value }));

        // 4) Section × Status (stacked bar - top 10 sections)
        const sectionStatusMap: Record<string, Record<string, number>> = {};
        devices.forEach(d => {
            const section = d.section || 'ไม่ระบุ';
            const status = d.status || 'Unknown';
            if (!sectionStatusMap[section]) sectionStatusMap[section] = {};
            sectionStatusMap[section][status] = (sectionStatusMap[section][status] || 0) + 1;
        });
        const sectionByStatus: StackedSectionItem[] = Object.entries(sectionStatusMap)
            .map(([section, statuses]) => ({
                section,
                Active: statuses['Active'] || 0,
                Spare: statuses['Spare'] || 0,
                Repair: statuses['Repair'] || 0,
                Disposed: statuses['Disposed'] || 0,
                Unknown: statuses['Unknown'] || 0,
                total: Object.values(statuses).reduce((a, b) => a + b, 0),
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        // 5) CIA Radar - aggregate counts by normalized level
        const ciaRadar: CiaRadarItem[] = [
            { dimension: 'Confidentiality', high: 0, medium: 0, low: 0, unset: 0 },
            { dimension: 'Integrity', high: 0, medium: 0, low: 0, unset: 0 },
            { dimension: 'Availability', high: 0, medium: 0, low: 0, unset: 0 },
        ];
        devices.forEach(d => {
            ciaRadar[0][normalizeCiaLevel(d.c_score)]++;
            ciaRadar[1][normalizeCiaLevel(d.i_score)]++;
            ciaRadar[2][normalizeCiaLevel(d.a_score)]++;
        });

        // 6) Activity timeline - devices created/updated per month (last 12 months)
        const now = new Date();
        const monthsMap: Record<string, { created: number; updated: number }> = {};
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthsMap[key] = { created: 0, updated: 0 };
        }
        devices.forEach(d => {
            if (d.createdAt) {
                const cd = new Date(d.createdAt);
                const ck = `${cd.getFullYear()}-${String(cd.getMonth() + 1).padStart(2, '0')}`;
                if (monthsMap[ck]) monthsMap[ck].created++;
            }
            if (d.updatedAt) {
                const ud = new Date(d.updatedAt);
                const uk = `${ud.getFullYear()}-${String(ud.getMonth() + 1).padStart(2, '0')}`;
                if (monthsMap[uk]) monthsMap[uk].updated++;
            }
        });
        const activityTimeline: TimelineItem[] = Object.entries(monthsMap).map(([month, data]) => ({
            month,
            ...data,
        }));

        // 7) Function/type distribution
        const functionCounts: Record<string, number> = {};
        devices.forEach(d => {
            const fn = d.function || 'ไม่ระบุ';
            functionCounts[fn] = (functionCounts[fn] || 0) + 1;
        });
        const functionDistribution: FunctionItem[] = Object.entries(functionCounts)
            .map(([name, value], idx) => ({
                name,
                value,
                fill: FUNCTION_COLORS[idx % FUNCTION_COLORS.length],
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        // 8) Center × Status
        const centerStatusMap: Record<string, Record<string, number>> = {};
        devices.forEach(d => {
            const center = d.center || 'ไม่ระบุ';
            const status = d.status || 'Unknown';
            if (!centerStatusMap[center]) centerStatusMap[center] = {};
            centerStatusMap[center][status] = (centerStatusMap[center][status] || 0) + 1;
        });
        const centerByStatus: CenterStatusItem[] = Object.entries(centerStatusMap)
            .map(([center, statuses]) => ({
                center,
                Active: statuses['Active'] || 0,
                Spare: statuses['Spare'] || 0,
                Repair: statuses['Repair'] || 0,
                Disposed: statuses['Disposed'] || 0,
                Unknown: statuses['Unknown'] || 0,
                total: Object.values(statuses).reduce((a, b) => a + b, 0),
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 8);

        // 9) Risk matrix - C×I×A combinations
        const riskMap: Record<string, number> = {};
        devices.forEach(d => {
            const c = normalizeCiaLevel(d.c_score);
            const i = normalizeCiaLevel(d.i_score);
            const a = normalizeCiaLevel(d.a_score);
            const key = `${c}|${i}|${a}`;
            riskMap[key] = (riskMap[key] || 0) + 1;
        });
        const riskMatrix = Object.entries(riskMap)
            .map(([key, count]) => {
                const [c, i, a] = key.split('|');
                return { c, i, a, count };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 15);

        return {
            statusData,
            sectionData,
            ciaData: {
                c: formatCiaData(cScoreCounts),
                i: formatCiaData(iScoreCounts),
                a: formatCiaData(aScoreCounts),
            },
            sectionByStatus,
            ciaRadar,
            activityTimeline,
            functionDistribution,
            centerByStatus,
            riskMatrix,
        };
    } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        return {
            statusData: [],
            sectionData: [],
            ciaData: { c: [], i: [], a: [] },
            sectionByStatus: [],
            ciaRadar: [],
            activityTimeline: [],
            functionDistribution: [],
            centerByStatus: [],
            riskMatrix: [],
        };
    }
}
