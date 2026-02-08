import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                console.log('[Auth] Starting authorization...');
                console.log('[Auth] Credentials received:', !!credentials?.username, !!credentials?.password);

                if (!credentials?.username || !credentials?.password) {
                    console.log('[Auth] Missing credentials');
                    return null;
                }

                try {
                    console.log('[Auth] Looking up user:', credentials.username);
                    const user = await prisma.user.findUnique({
                        where: { username: credentials.username as string },
                    });

                    console.log('[Auth] User found:', !!user);

                    if (!user) {
                        console.log('[Auth] User not found');
                        return null;
                    }

                    console.log('[Auth] Comparing passwords...');
                    const isValid = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    );

                    console.log('[Auth] Password valid:', isValid);

                    if (!isValid) {
                        console.log('[Auth] Invalid password');
                        return null;
                    }

                    console.log('[Auth] Auth successful for user:', user.username);
                    return {
                        id: String(user.id),
                        name: user.thaiName || user.engName || user.username,
                        email: user.email,
                        role: user.role,
                        department: user.department || undefined,
                        image: user.imageUrl,
                    };
                } catch (error) {
                    console.error('[Auth] Error during authorization:', error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
});
