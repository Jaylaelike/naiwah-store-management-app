'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Schema for User Create/Update
const UserSchema = z.object({
    username: z.string().min(3),
    email: z.string().email().optional().or(z.literal('')),
    password: z.string().min(6).optional().or(z.literal('')),
    role: z.enum(['Admin', 'User']),
    employeeId: z.string().optional(),
    department: z.string().optional(),
    thaiName: z.string().optional(),
    engName: z.string().optional(),
    position: z.string().optional(),
    section: z.string().optional(),
    division: z.string().optional(), // Added based on Prisma schema
    mobilePhone: z.string().optional(), // Added based on Prisma schema
});

export type UserFormData = z.infer<typeof UserSchema>;

export async function getUsers() {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        throw new Error('Unauthorized');
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                employeeId: true,
                department: true,
                division: true,
                section: true,
                position: true,
                engName: true,
                thaiName: true,
                mobilePhone: true,
                imageUrl: true,
                createdAt: true,
            }
        });
        return users;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
    }
}

export async function createUser(data: UserFormData) {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        return { success: false, error: 'Unauthorized' };
    }

    const result = UserSchema.safeParse(data);
    if (!result.success) {
        return { success: false, error: 'Invalid data' };
    }

    const { username, password, email, ...rest } = result.data;

    if (!password) {
        return { success: false, error: 'Password is required for new users' };
    }

    try {
        // Check if username or email exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    ...(email ? [{ email }] : [])
                ]
            }
        });

        if (existingUser) {
            return { success: false, error: 'Username or specific Email already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                email: email || null,
                ...rest,
            }
        });

        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to create user:', error);
        return { success: false, error: 'Failed to create user' };
    }
}

export async function updateUser(userId: number, data: UserFormData) {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        return { success: false, error: 'Unauthorized' };
    }

    const result = UserSchema.safeParse(data);
    if (!result.success) {
        return { success: false, error: 'Invalid data' };
    }

    const { username, password, email, ...rest } = result.data;

    try {
        // Check uniqueness excluding current user
        const existingUser = await prisma.user.findFirst({
            where: {
                AND: [
                    {
                        OR: [
                            { username },
                            ...(email ? [{ email }] : [])
                        ]
                    },
                    { NOT: { id: userId } }
                ]
            }
        });

        if (existingUser) {
            return { success: false, error: 'Username or Email already taken by another user' };
        }

        const updateData: any = {
            username,
            email: email || null,
            ...rest,
        };

        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        revalidatePath('/dashboard/admin/users');
        return { success: true };

    } catch (error) {
        console.error('Failed to update user:', error);
        return { success: false, error: 'Failed to update user' };
    }
}

export async function updateUserRole(userId: number, newRole: string) {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
        });

        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to update user role:', error);
        return { success: false, error: 'Failed to update user role' };
    }
}

export async function deleteUser(userId: number) {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await prisma.user.delete({
            where: { id: userId },
        });

        revalidatePath('/dashboard/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete user:', error);
        return { success: false, error: 'Failed to delete user. Ensure they exist and have no restrictive relations.' };
    }
}
