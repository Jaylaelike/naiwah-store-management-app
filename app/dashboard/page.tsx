import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, Wrench, Archive, Activity, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDashboardStats, getAnalyticsData } from '@/lib/actions/dashboard';
import { DashboardActions } from '@/components/dashboard/dashboard-actions';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    const dashboardStats = await getDashboardStats();
    const analyticsData = await getAnalyticsData();

    const stats = [
        {
            title: 'อุปกรณ์ทั้งหมด',
            value: dashboardStats.total.toString(),
            icon: Box,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            title: 'ใช้งานปกติ',
            value: dashboardStats.active.toString(),
            icon: Activity,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            title: 'สำรอง',
            value: dashboardStats.spare.toString(),
            icon: Archive,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            title: 'ส่งซ่อม',
            value: dashboardStats.repair.toString(),
            icon: Wrench,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10'
        },
        {
            title: 'จำหน่ายออก',
            value: dashboardStats.disposed.toString(),
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-500/10'
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">ภาพรวม</h2>
                    <p className="text-muted-foreground">
                        ยินดีต้อนรับคุณ {session.user.name} | {session.user.department ? `แผนก: ${session.user.department}` : ''}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="backdrop-blur-sm bg-card/50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={cn("p-2 rounded-full", stat.bg)}>
                                    <Icon className={cn("h-4 w-4", stat.color)} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Analytics Charts */}
            <DashboardCharts data={analyticsData} />

            {/* Quick Actions */}
            <DashboardActions role={session.user.role} />
        </div>
    );
}
