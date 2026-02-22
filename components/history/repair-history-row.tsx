'use client';

import { TableRow, TableCell } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ReactNode, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface RepairHistoryRowProps {
    record: any; // Type this properly if possible, but 'any' avoids circular dep issues for quick implementation
    children: ReactNode;
}

export function RepairHistoryRow({ record, children }: RepairHistoryRowProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    return (
        <>
            <TableRow
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setOpen(true)}
            >
                {children}
            </TableRow>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>รายละเอียดประวัติการซ่อม</DialogTitle>
                        <DialogDescription>
                            ข้อมูลการซ่อมบำรุงและรายละเอียดอุปกรณ์
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-semibold text-right col-span-1">วันที่ซ่อม:</span>
                            <span className="col-span-3">
                                {new Date(record.repairDate).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-semibold text-right col-span-1">ผู้บันทึก:</span>
                            <span className="col-span-3">
                                {record.loggedBy?.thaiName || record.loggedBy?.engName || record.loggedBy?.username || '-'}
                            </span>
                        </div>
                        <div className="border-t my-2"></div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-semibold text-right col-span-1">อุปกรณ์:</span>
                            <span className="col-span-3 font-medium">{record.device.deviceName}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-semibold text-right col-span-1">Asset ID:</span>
                            <span className="col-span-3 font-mono bg-muted px-2 py-1 rounded w-fit text-sm">
                                {record.device.assetId || '-'}
                            </span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-semibold text-right col-span-1">รุ่น/Model:</span>
                            <span className="col-span-3">{record.device.model || '-'}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-semibold text-right col-span-1">Serial No:</span>
                            <span className="col-span-3 text-sm font-mono">{record.device.serialNumber || '-'}</span>
                        </div>
                        <div className="border-t my-2"></div>
                        <div className="space-y-2">
                            <span className="font-semibold">รายละเอียดการซ่อม:</span>
                            <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
                                {record.description}
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button onClick={() => router.push(`/dashboard/devices/${record.device.id}`)}>
                                ดูรายละเอียดอุปกรณ์เต็ม
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
