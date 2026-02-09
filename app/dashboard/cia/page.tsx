import { getDevices } from '@/lib/actions/device';
import { CiaClientWrapper } from '@/components/cia/cia-client-wrapper';

export const dynamic = 'force-dynamic';

export default async function CiaDashboardPage() {
    const devices = await getDevices();

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight"> Asset Importance Level (CIA)</h2>
            </div>

            <CiaClientWrapper devices={devices} />
        </div>
    );
}

