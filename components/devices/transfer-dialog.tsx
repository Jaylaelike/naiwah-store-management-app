'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft, Clock } from 'lucide-react';
import { transferDevice } from '@/lib/actions/history';
import { getUniqueLocations, UniqueLocations } from '@/lib/actions/location';
import { toast } from 'sonner';

interface TransferDialogProps {
    deviceId: number;
    currentLocation?: {
        section?: string | null;
        center?: string | null;
        station?: string | null;
    };
}

export function TransferDialog({ deviceId, currentLocation }: TransferDialogProps) {
    const [open, setOpen] = useState(false);
    const [section, setSection] = useState(currentLocation?.section || '');
    const [center, setCenter] = useState(currentLocation?.center || '');
    const [station, setStation] = useState(currentLocation?.station || '');
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState<UniqueLocations>({
        sections: [],
        centers: [],
        stations: [],
    });
    const [locationsLoading, setLocationsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setLocationsLoading(true);
            getUniqueLocations()
                .then(setLocations)
                .finally(() => setLocationsLoading(false));
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await transferDevice(deviceId, section, center, station);
            if (result.success) {
                if (result.pending) {
                    toast.info('ส่งคำขอย้ายอุปกรณ์แล้ว รอการอนุมัติจากผู้ดูแลระบบ', {
                        icon: <Clock className="h-4 w-4" />,
                        duration: 5000,
                    });
                } else {
                    toast.success(result.message || 'Device transferred successfully');
                }
                setOpen(false);
            } else {
                toast.error(result.error || 'Failed to transfer device');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Transfer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Transfer Device</DialogTitle>
                    <DialogDescription>
                        Move this device to a new location. Transfer requests require admin approval.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="section">Section</Label>
                            <Select
                                value={section}
                                onValueChange={setSection}
                                disabled={locationsLoading}
                            >
                                <SelectTrigger id="section">
                                    <SelectValue placeholder="เลือก Section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.sections.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="center">Center</Label>
                            <Select
                                value={center}
                                onValueChange={setCenter}
                                disabled={locationsLoading}
                            >
                                <SelectTrigger id="center">
                                    <SelectValue placeholder="เลือก Center" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.centers.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="station">Station</Label>
                            <Select
                                value={station}
                                onValueChange={setStation}
                                disabled={locationsLoading}
                            >
                                <SelectTrigger id="station">
                                    <SelectValue placeholder="เลือก Station" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.stations.map((st) => (
                                        <SelectItem key={st} value={st}>
                                            {st}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading || locationsLoading}>
                            {loading ? 'Submitting...' : 'Submit Transfer Request'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
