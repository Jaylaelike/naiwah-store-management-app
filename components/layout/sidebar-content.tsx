'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Box,
    Monitor,
    History,
    FileText,
    ShieldCheck,
    LogOut,
    Users,
    Calendar,
    Shield,
    DatabaseBackup,
    Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';

interface SidebarContentProps {
    className?: string;
    onLinkClick?: () => void;
}

export function SidebarContent({ className, onLinkClick }: SidebarContentProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'Admin';

    const links = [
        { href: '/dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
        { href: '/dashboard/calendar', label: 'มุมมองปฏิทิน', icon: Calendar },
        { href: '/dashboard/devices', label: 'รายการอุปกรณ์', icon: Monitor },
        { href: '/dashboard/requests', label: 'คำขอของฉัน', icon: FileText },
        { href: '/dashboard/history', label: 'ประวัติการซ่อม', icon: History },
        // { href: '/dashboard/inventory', label: 'คลังอุปกรณ์', icon: Box },
        { href: '/dashboard/cia', label: 'ความสำคัญทรัพย์สิน', icon: Shield },
    ];

    const adminLinks = [
        { href: '/dashboard/admin', label: 'ผู้ดูแลระบบ', icon: ShieldCheck },
        { href: '/dashboard/admin/users', label: 'จัดการผู้ใช้', icon: Users },
        { href: '/dashboard/admin/backup', label: 'สำรอง/กู้คืนข้อมูล', icon: DatabaseBackup },
        { href: '/dashboard/admin/settings', label: 'ตั้งค่าระบบ', icon: Settings },
    ];

    return (
        <div className={cn("flex h-full flex-col bg-card/50 backdrop-blur-xl", className)}>
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary" onClick={onLinkClick}>
                    <Box className="h-6 w-6" />
                    <span>NAIWAH Store</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-2">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={onLinkClick}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                    isActive ? "bg-neutral-100 text-primary dark:bg-neutral-800" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        );
                    })}

                    {isAdmin && (
                        <>
                            <div className="mt-4 mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Admin Zone
                            </div>
                            {adminLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={onLinkClick}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                            isActive ? "bg-neutral-100 text-primary dark:bg-neutral-800" : "text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </>
                    )}
                </nav>
            </div>

            <div className="border-t p-4">
                {session && (
                    <div className="mb-4 flex items-center gap-3 px-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-primary/20 overflow-hidden">
                            {session.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || 'User'}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span>{session.user?.name?.[0] || 'U'}</span>
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="truncate text-sm font-medium">{session.user?.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{session.user?.role}</p>
                        </div>
                    </div>
                )}
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    onClick={() => signOut()}
                >
                    <LogOut className="h-4 w-4" />
                    ออกจากระบบ
                </Button>
            </div>
        </div>
    );
}
