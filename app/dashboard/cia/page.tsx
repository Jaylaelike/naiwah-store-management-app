import { getDevices } from '@/lib/actions/device';
import { CiaTable } from '@/components/cia/cia-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CiaStats } from '@/components/cia/cia-stats';

export default async function CiaDashboardPage() {
    const devices = await getDevices();

    // Sort devices by Asset ID or potentially by importance if needed
    // For now, default sort from getDevices is createdAt desc.

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight"> Asset Importance Level (CIA)</h2>
            </div>

            <CiaStats devices={devices} />

            <Card>
                <CardHeader>
                    <CardTitle>Asset Importance Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                    <CiaTable devices={devices} />
                </CardContent>
            </Card>
        </div>
    );
}
