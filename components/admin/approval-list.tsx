'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { approveRequest, rejectRequest } from '@/lib/actions/approval';
import { useRouter } from 'next/navigation';

interface ApprovalListProps {
    requests: any[]; // We'll define proper type
}

export function ApprovalList({ requests }: ApprovalListProps) {
    const [processing, setProcessing] = useState<number | null>(null);
    const router = useRouter(); // To force refresh after action

    const handleApprove = async (id: number) => {
        setProcessing(id);
        const result = await approveRequest(id);
        if (result.success) {
            toast.success('Request approved');
            router.refresh();
        } else {
            toast.error(result.error);
        }
        setProcessing(null);
    };

    const handleReject = async (id: number) => {
        setProcessing(id);
        const result = await rejectRequest(id);
        if (result.success) {
            toast.success('Request rejected');
            router.refresh();
        } else {
            toast.error(result.error);
        }
        setProcessing(null);
    };

    return (
        <div className="space-y-4">
            {requests.length === 0 ? (
                <div className="text-center text-muted-foreground p-8">No pending requests.</div>
            ) : (
                requests.map((request) => (
                    <Card key={request.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">
                                {request.type} Device Action
                            </CardTitle>
                            <StatusBadge status={request.status} />
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="font-semibold">Requested By</div>
                                        <div>
                                            {request.requestedBy.thaiName || request.requestedBy.engName || request.requestedBy.username}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-semibold">Date</div>
                                        <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    {request.device && (
                                        <div>
                                            <div className="font-semibold">Device</div>
                                            <div>{request.device.assetId} {request.device.deviceName ? `- ${request.device.deviceName}` : ''}</div>
                                        </div>
                                    )}
                                    <div className="col-span-2">
                                        <div className="font-semibold mb-2">Request Details</div>
                                        <div className="rounded-md border p-4 bg-muted/30">
                                            {(() => {
                                                const payload = JSON.parse(request.payload);
                                                if (request.type === 'DELETE') {
                                                    return (
                                                        <div className="text-sm text-muted-foreground">
                                                            Requesting deletion of device with ID: <span className="font-mono font-medium text-foreground">{request.deviceId}</span>
                                                        </div>
                                                    );
                                                }
                                                if (request.type === 'TRANSFER') {
                                                    return (
                                                        <div className="space-y-3 text-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
                                                                    <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">From</div>
                                                                    <div className="font-medium">{payload.fromLocation || 'Unknown'}</div>
                                                                    {payload.fromSection && <div className="text-xs text-muted-foreground">Section: {payload.fromSection}</div>}
                                                                    {payload.fromCenter && <div className="text-xs text-muted-foreground">Center: {payload.fromCenter}</div>}
                                                                    {payload.fromStation && <div className="text-xs text-muted-foreground">Station: {payload.fromStation}</div>}
                                                                </div>
                                                                <span className="text-lg text-muted-foreground">→</span>
                                                                <div className="flex-1 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3">
                                                                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">To</div>
                                                                    <div className="font-medium">{payload.toLocation || 'Unknown'}</div>
                                                                    {payload.toSection && <div className="text-xs text-muted-foreground">Section: {payload.toSection}</div>}
                                                                    {payload.toCenter && <div className="text-xs text-muted-foreground">Center: {payload.toCenter}</div>}
                                                                    {payload.toStation && <div className="text-xs text-muted-foreground">Station: {payload.toStation}</div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                        {Object.entries(payload).map(([key, value]) => {
                                                            if (!value && value !== 0) return null; // Skip empty values

                                                            const isUpdate = request.type === 'UPDATE';
                                                            const existingValue = request.device ? (request.device as any)[key] : null;
                                                            // Simple comparison (casting to string to handle number/string mismatch)
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
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 gap-2"
                                        onClick={() => handleReject(request.id)}
                                        disabled={processing === request.id}
                                    >
                                        <X className="h-4 w-4" /> Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => handleApprove(request.id)}
                                        disabled={processing === request.id}
                                    >
                                        <Check className="h-4 w-4" /> Approve
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}
