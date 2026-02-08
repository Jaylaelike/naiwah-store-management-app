import PocketBase from 'pocketbase';

const globalForPb = global as unknown as { pb: PocketBase };

export const pb = globalForPb.pb || new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

if (process.env.NODE_ENV !== 'production') globalForPb.pb = pb;

// Disable auto-cancellation to allow concurrent requests
pb.autoCancellation(false);
