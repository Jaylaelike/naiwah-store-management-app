import type { NextAuthConfig } from 'next-auth';

// Edge-compatible config (no database adapters)
export const authConfig: NextAuthConfig = {
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        authorized({ auth, request }) {
            const isAuthenticated = !!auth?.user;
            const { pathname } = request.nextUrl;

            // Public routes
            const publicRoutes = ['/login', '/api/auth'];
            const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

            if (isPublicRoute) return true;
            if (!isAuthenticated) return false;

            // Admin-only routes
            if (pathname.startsWith('/admin') && auth?.user?.role !== 'Admin') {
                return false;
            }

            return true;
        },
        jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id as string;
                token.role = user.role;
                token.department = user.department;
                token.picture = user.image;
            }
            if (trigger === "update" && session?.user?.image) {
                token.picture = session.user.image;
            }
            return token;
        },
        session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.department = token.department as string | undefined;
                session.user.image = token.picture;
            }
            return session;
        },
    },
    providers: [], // Configured in auth.ts
};
