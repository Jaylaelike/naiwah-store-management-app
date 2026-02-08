import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Settings, ShieldAlert, FileCheck } from 'lucide-react';
import { getDashboardStats } from '@/lib/actions/dashboard';

export default async function AdminDashboardPage() {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        redirect('/dashboard');
    }

    const stats = await getDashboardStats();

    const adminModules = [
        {
            title: 'จัดการผู้ใช้งาน',
            description: 'จัดการสิทธิ์และบัญชีผู้ใช้',
            href: '/dashboard/admin/users',
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
        {
            title: 'รายงานและการส่งออก',
            description: 'ดูรายงานและดาวน์โหลดข้อมูล',
            href: '/dashboard/admin/reports',
            icon: FileText,
            color: 'text-green-600',
            bg: 'bg-green-100',
        },
        {
            title: 'คำขออนุมัติ',
            description: 'ตรวจสอบและอนุมัติการเปลี่ยนแปลง',
            href: '/dashboard/admin/approvals',
            icon: FileCheck,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
        },
    ];

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                    <p className="text-muted-foreground">
                        จัดการระบบและดูภาพรวมสำหรับผู้ดูแลระบบ
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">อุปกรณ์ทั้งหมด</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">รอซ่อม / ส่งซ่อม</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.repair}</div>
                    </CardContent>
                </Card>
            </div>

            <h3 className="text-xl font-semibold">เครื่องมือผู้ดูแลระบบ</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {adminModules.map((module) => (
                    <Link key={module.href} href={module.href}>
                        <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${module.bg}`}>
                                        <module.icon className={`h-6 w-6 ${module.color}`} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{module.title}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {module.description}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
