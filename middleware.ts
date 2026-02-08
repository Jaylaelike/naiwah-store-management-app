import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Use edge-compatible config without database adapter
export default NextAuth(authConfig).auth;

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
