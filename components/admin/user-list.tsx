'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserActions } from '@/components/admin/user-actions';
import { UserFormDialog } from '@/components/admin/user-form-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface User {
    id: number;
    username: string;
    email: string | null;
    role: string;
    employeeId: string | null;
    department: string | null;
    thaiName: string | null;
    engName: string | null;
    imageUrl: string | null;
    createdAt: Date;
    // Add other fields if needed for display or edit mapping
    position?: string | null;
    section?: string | null;
    division?: string | null;
    mobilePhone?: string | null;
}

interface UserListProps {
    users: User[];
}

export function UserList({ users }: UserListProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <CardTitle>All Users</CardTitle>
                <UserFormDialog />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <Avatar>
                                        <AvatarImage src={user.imageUrl || ''} />
                                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user.thaiName || user.engName || user.username}</span>
                                        <span className="text-xs text-muted-foreground">{user.email || user.username}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'Admin' ? 'destructive' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>{user.department || '-'}</TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString('th-TH')}</TableCell>
                                <TableCell className="text-right">
                                    <UserActions user={user} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
