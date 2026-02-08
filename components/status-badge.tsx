import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const getStatusColor = (status: string) => {
        const lowerStatus = status?.toLowerCase() || '';

        // Device Statuses
        if (lowerStatus === 'active') return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200';
        if (lowerStatus === 'repair' || lowerStatus === 'maintenance') return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200';
        if (lowerStatus === 'disposed' || lowerStatus === 'broken') return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';
        if (lowerStatus === 'spare' || lowerStatus === 'backup') return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200';

        // Approval/Request Statuses
        if (lowerStatus === 'approved' || lowerStatus === 'completed') return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200';
        if (lowerStatus === 'pending') return 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200';
        if (lowerStatus === 'rejected' || lowerStatus === 'cancelled') return 'bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200';

        // Request Types (if passed as status)
        if (lowerStatus === 'create') return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200';
        if (lowerStatus === 'update') return 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200';
        if (lowerStatus === 'delete') return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';

        // Default
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
    };

    return (
        <Badge className={`${getStatusColor(status)} ${className || ''} border`}>
            {status}
        </Badge>
    );
}
