'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Shield, ShieldAlert, Trash, Pencil } from 'lucide-react';
import { updateUserRole, deleteUser } from '@/lib/actions/user';
import { toast } from 'sonner';
import { UserFormDialog } from '@/components/admin/user-form-dialog';

interface UserActionsProps {
    user: any; // Full user object
}

export function UserActions({ user }: UserActionsProps) {
    const [loading, setLoading] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const handleRoleChange = async () => {
        setLoading(true);
        const newRole = user.role === 'Admin' ? 'User' : 'Admin';
        try {
            const result = await updateUserRole(user.id, newRole);
            if (result.success) {
                toast.success(`Updated ${user.username}'s role to ${newRole}`);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Failed to update role');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete user ${user.username}?`)) return;

        setLoading(true);
        try {
            const result = await deleteUser(user.id);
            if (result.success) {
                toast.success(`Deleted user ${user.username}`);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Failed to delete user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <UserFormDialog
                user={user}
                open={editOpen}
                onOpenChange={setEditOpen}
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleRoleChange} disabled={loading}>
                        {user.role === 'Admin' ? (
                            <>
                                <Shield className="mr-2 h-4 w-4" /> Demote to User
                            </>
                        ) : (
                            <>
                                <ShieldAlert className="mr-2 h-4 w-4" /> Promote to Admin
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} disabled={loading} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> Delete User
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
