import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CancelRequestButton } from '@/components/devices/cancel-request-button';
import { PaginationControls } from '@/components/ui/pagination-controls';

async function getUserRequests(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await prisma.$transaction([
        prisma.approvalRequest.findMany({
            where: { requestedById: userId },
            include: { device: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.approvalRequest.count({
            where: { requestedById: userId },
        }),
    ]);
    return { data, total };
}

interface RequestsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RequestsPage(props: RequestsPageProps) {
    const searchParams = await props.searchParams;
    const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
    const limit = searchParams.per_page ? parseInt(searchParams.per_page as string) : 5; // Default to 5 for testing/vis

    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    if (!userId) {
        return <div>Please log in to view your requests.</div>;
    }

    const { data: requests, total } = await getUserRequests(userId, page, limit);
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">My Requests</h2>
            <p className="text-muted-foreground">
                Track the status of your device change requests.
            </p>

            <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="text-center text-muted-foreground p-8">No requests found.</div>
                    ) : (
                        requests.map((request) => (
                            <Card key={request.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-medium">
                                        {request.type} Request
                                    </CardTitle>
                                    <StatusBadge status={request.status} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">
                                        Submitted on {new Date(request.createdAt).toLocaleDateString()}
                                    </div>
                                    {request.status === 'REJECTED' && (
                                        <div className="mt-2 text-sm text-red-500">
                                            Reason: {request.reason || 'No reason provided'}
                                        </div>
                                    )}
                                    <div className="mt-2">
                                        <div className="font-semibold text-xs text-muted-foreground mb-1">Details</div>
                                        <div className="rounded-md border p-4 bg-muted/30">
                                            {(() => {
                                                const payload = JSON.parse(request.payload);
                                                if (request.type === 'DELETE') {
                                                    return (
                                                        <div className="text-sm text-muted-foreground">
                                                            Pending deletion for device ID: <span className="font-mono font-medium text-foreground">{request.deviceId}</span>
                                                        </div>
                                                    );
                                                }
                                                if (request.type === 'TRANSFER') {
                                                    return (
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-2">
                                                                    <div className="text-xs font-medium text-red-600 dark:text-red-400">From</div>
                                                                    <div className="font-medium">{payload.fromLocation || 'Unknown'}</div>
                                                                </div>
                                                                <span className="text-muted-foreground">→</span>
                                                                <div className="flex-1 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-2">
                                                                    <div className="text-xs font-medium text-green-600 dark:text-green-400">To</div>
                                                                    <div className="font-medium">{payload.toLocation || 'Unknown'}</div>
                                                                </div>
                                                            </div>
                                                            {request.device && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    Device: {request.device.assetId || '-'} {request.device.deviceName ? `- ${request.device.deviceName}` : ''}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                        {Object.entries(payload).map(([key, value]) => {
                                                            if (!value && value !== 0) return null; // Skip empty values

                                                            const isUpdate = request.type === 'UPDATE';
                                                            const existingValue = request.device ? (request.device as any)[key] : null;
                                                            const isChanged = isUpdate && existingValue !== undefined && String(value) !== String(existingValue);

                                                            return (
                                                                <div key={key} className="flex flex-col border-b last:border-0 pb-2 last:pb-0">
                                                                    <span className="text-xs font-medium text-muted-foreground capitalize">
                                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                                    </span>
                                                                    <span className={`truncate font-medium ${isChanged ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 px-1 rounded' : ''}`}>
                                                                        {String(value)}
                                                                        {isChanged && (
                                                                            <div className="text-xs text-muted-foreground line-through opacity-70">
                                                                                {String(existingValue)}
                                                                            </div>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    {request.status === 'PENDING' && (
                                        <div className="mt-4 flex justify-end">
                                            <CancelRequestButton requestId={request.id} />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
                <div className="mt-4">
                    <PaginationControls
                        hasNextPage={hasNextPage}
                        hasPrevPage={hasPrevPage}
                        totalPages={totalPages}
                    />
                </div>
            </ScrollArea >
        </div >
    );
}
