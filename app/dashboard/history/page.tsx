import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RepairHistoryRow } from '@/components/history/repair-history-row';
import { HistoryToolbar } from '@/components/history/history-toolbar';
import { Prisma } from '@prisma/client';
import { endOfDay, startOfDay } from 'date-fns';

async function getRepairHistory(params: { q?: string; from?: string; to?: string; status?: string }) {
    const { q, from, to, status } = params;

    const where: Prisma.RepairHistoryWhereInput = {};

    // Search Query Condition
    if (q) {
        where.OR = [
            { device: { assetId: { contains: q } } },
            { device: { deviceName: { contains: q } } },
            { description: { contains: q } },
            { loggedBy: { username: { contains: q } } },
            { loggedBy: { thaiName: { contains: q } } },
            { loggedBy: { engName: { contains: q } } },
        ];
    }

    // Status Filter
    if (status && status !== 'all') {
        where.device = {
            ...(where.device as Prisma.DeviceWhereInput),
            status: status
        };
    }

    // Date Range Filter
    if (from || to) {
        where.repairDate = {};
        if (from) {
            where.repairDate.gte = startOfDay(new Date(from));
        }
        if (to) {
            where.repairDate.lte = endOfDay(new Date(to));
        }
    }

    return prisma.repairHistory.findMany({
        where,
        include: {
            device: true,
            loggedBy: true,
        },
        orderBy: {
            repairDate: 'desc',
        },
    });
}

export default async function RepairHistoryPage(props: {
    searchParams?: Promise<{ q?: string; from?: string; to?: string; status?: string }>;
}) {
    const searchParams = await props.searchParams;
    const params = {
        q: searchParams?.q,
        from: searchParams?.from,
        to: searchParams?.to,
        status: searchParams?.status,
    };

    // Auth check
    await auth();

    const history = await getRepairHistory(params);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">ประวัติการซ่อม</h2>
                <p className="text-muted-foreground">
                    รายการประวัติการซ่อมบำรุงอุปกรณ์ทั้งหมด
                </p>
            </div>

            <HistoryToolbar />

            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>วันที่ซ่อม</TableHead>
                            <TableHead>Asset ID</TableHead>
                            <TableHead>อุปกรณ์</TableHead>
                            <TableHead>รายละเอียด</TableHead>
                            <TableHead>ผู้บันทึก</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    {params.q || params.from || params.status ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่มีข้อมูลประวัติการซ่อม'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            history.map((record) => (
                                <RepairHistoryRow key={record.id} record={record}>
                                    <TableCell className="font-medium">
                                        {new Date(record.repairDate).toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell>{record.device.assetId}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{record.device.deviceName}</span>
                                            <span className="text-xs text-muted-foreground">{record.device.model}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={record.description}>
                                        {record.description}
                                    </TableCell>
                                    <TableCell>
                                        {record.loggedBy?.thaiName || record.loggedBy?.engName || record.loggedBy?.username || '-'}
                                    </TableCell>
                                </RepairHistoryRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
