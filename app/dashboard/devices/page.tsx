import { getDevices } from '@/lib/actions/device';
import { columns } from './columns';

export const dynamic = 'force-dynamic';
import { DataTable } from './data-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { QRScannerDialog } from '@/components/devices/qr-scanner-dialog';

export default async function DevicesPage() {
    const devices = await getDevices();

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Device Inventory</h2>
                    <p className="text-muted-foreground">
                        Here's a list of all devices in the inventory.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <QRScannerDialog />
                    <Button asChild>
                        <Link href="/dashboard/devices/new">
                            <Plus className="mr-2 h-4 w-4" /> Add Device
                        </Link>
                    </Button>
                </div>
            </div>
            <DataTable columns={columns} data={devices} />
        </div>
    );
}
