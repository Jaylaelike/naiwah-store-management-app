'use client';

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
    // Only use basePath in production
    const basePath = process.env.NODE_ENV === 'production' ? '/naiwah/api/auth' : undefined;
    return <SessionProvider basePath={basePath}>{children}</SessionProvider>;
}
