import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUsers } from '@/lib/actions/user';
import { Sidebar } from '@/components/layout/sidebar'; // Assuming this is used in layout, but here we just need content
import { UserList } from '@/components/admin/user-list';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function UserManagementPage() {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        redirect('/dashboard');
    }

    const users = await getUsers();

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/admin">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">
                        Manage user accounts and permissions.
                    </p>
                </div>
            </div>

            <UserList users={users} />
        </div>
    );
}
