'use server';

import { signIn, signOut } from '@/auth';

export async function handleSignIn(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    await signIn('credentials', {
        username,
        password,
        redirectTo: '/dashboard',
    });
}

export async function handleSignOut() {
    await signOut({ redirectTo: '/login' });
}
