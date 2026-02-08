import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ApprovalList } from '@/components/admin/approval-list';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getPendingRequests() {
    return prisma.approvalRequest.findMany({
        where: { status: 'PENDING' },
        include: {
            requestedBy: true,
            device: true
        },
        orderBy: { createdAt: 'desc' },
    });
}

export default async function ApprovalPage() {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        redirect('/dashboard');
    }

    const requests = await getPendingRequests();

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/admin">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pending Approvals</h2>
                    <p className="text-muted-foreground">
                        Review and approve device change requests.
                    </p>
                </div>
            </div>

            <ApprovalList requests={requests} />
        </div>
    );
}
