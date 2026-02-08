'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Monitor, PlusCircle, QrCode, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QRScannerDialog } from '@/components/devices/qr-scanner-dialog';

interface DashboardActionsProps {
    role: string;
}

export function DashboardActions({ role }: DashboardActionsProps) {
    const quickActions = [
        { href: '/dashboard/devices', label: 'รายการอุปกรณ์', icon: Monitor, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { href: '/dashboard/devices/new', label: 'เพิ่มอุปกรณ์', icon: PlusCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
        {
            href: '#scan',
            label: 'สแกน QR Code',
            icon: QrCode,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            isAction: true
        },
    ];

    if (role === 'Admin') {
        quickActions.push({
            href: '/dashboard/admin',
            label: 'จัดการระบบ',
            icon: Settings,
            color: 'text-red-500',
            bg: 'bg-red-500/10'
        });
    }

    return (
        <div>
            <h3 className="mb-4 text-lg font-semibold">เมนูด่วน</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    const CardComponent = (
                        <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-dashed hover:border-solid h-full">
                            <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                                <div className={cn("p-3 rounded-full", action.bg)}>
                                    <Icon className={cn("h-6 w-6", action.color)} />
                                </div>
                                <span className="font-medium text-sm text-center">{action.label}</span>
                            </CardContent>
                        </Card>
                    );

                    if (action.isAction && action.href === '#scan') {
                        return (
                            <QRScannerDialog key={index}>
                                {CardComponent}
                            </QRScannerDialog>
                        );
                    }

                    return (
                        <Link key={index} href={action.href}>
                            {CardComponent}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
