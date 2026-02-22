'use client';

import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { cancelRequest } from '@/lib/actions/approval';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CancelRequestButtonProps {
    requestId: number;
}

export function CancelRequestButton({ requestId }: CancelRequestButtonProps) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this request?')) return;

        setIsPending(true);
        try {
            const result = await cancelRequest(requestId);
            if (result.success) {
                toast.success('Request cancelled');
                router.refresh(); // Crucial for updating the list
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Failed to cancel request');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            disabled={isPending}
            className="w-full sm:w-auto"
        >
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                </>
            ) : (
                <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Cancel
                </>
            )}
        </Button>
    );
}
