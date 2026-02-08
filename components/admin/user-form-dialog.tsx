'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createUser, updateUser } from '@/lib/actions/user';
import { Plus, Pencil } from 'lucide-react';

const userSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email().optional().or(z.literal('')),
    password: z.string().optional(),
    role: z.enum(['Admin', 'User']),
    employeeId: z.string().optional(),
    department: z.string().optional(),
    thaiName: z.string().optional(),
    engName: z.string().optional(),
    position: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormDialogProps {
    user?: any; // If provided, existing user to edit
    trigger?: React.ReactNode; // Custom trigger
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function UserFormDialog({ user, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: UserFormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);

    // Use controlled state if provided, otherwise internal
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = setControlledOpen || setInternalOpen;

    const isEdit = !!user;

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            role: 'User',
            employeeId: '',
            department: '',
            thaiName: '',
            engName: '',
            position: '',
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                username: user.username,
                email: user.email || '',
                password: '', // Always empty on edit
                role: user.role,
                employeeId: user.employeeId || '',
                department: user.department || '',
                thaiName: user.thaiName || '',
                engName: user.engName || '',
                position: user.position || '',
            });
        }
    }, [user, form]);

    const onSubmit = async (data: UserFormValues) => {
        try {
            // Validation for password on create
            if (!isEdit && !data.password) {
                form.setError('password', { message: 'Password is required for new users' });
                return;
            }

            const response = isEdit
                ? await updateUser(user.id, data)
                : await createUser(data);

            if (response.success) {
                toast.success(isEdit ? 'User updated successfully' : 'User created successfully');
                setIsOpen(false);
                if (!isEdit) form.reset();
            } else {
                toast.error(response.error || 'Something went wrong');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger ? (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            ) : (
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create User
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit User' : 'Create New User'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update user details. Leave password blank to keep current.' : 'Fill in the details to create a new user.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{isEdit ? 'Password (Optional)' : 'Password *'}</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder={'********'} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="john@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="User">User</SelectItem>
                                                <SelectItem value="Admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="employeeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Employee ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="EMP001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Engineering" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="thaiName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thai Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="สมชาย" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="engName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>English Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Somchai" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Position</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Engineer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit">
                                {isEdit ? 'Save Changes' : 'Create User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
