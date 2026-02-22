import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/settings';

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    return NextResponse.json(getSettings());
}

export async function PUT(request: Request) {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await request.json();
        const updated = updateSettings(body);
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Failed to update settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
