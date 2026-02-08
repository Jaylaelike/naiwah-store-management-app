
import { getDeviceByUuid, getDeviceByAssetId } from '../lib/actions/device';
import { prisma } from '../lib/prisma';

async function main() {
    console.log('Verifying QR Code Navigation Logic...');

    // 1. Get a device
    const device = await prisma.device.findFirst({
        where: { uuid: { not: null } }
    });

    if (!device) {
        console.error('No devices found to test with.');
        process.exit(1);
    }

    console.log(`Testing with device: ${device.assetId} (UUID: ${device.uuid})`);

    // 2. Test getDeviceByUuid
    try {
        const foundByUuid = await getDeviceByUuid(device.uuid!);
        if (foundByUuid?.id === device.id) {
            console.log('✅ getDeviceByUuid working correctly.');
        } else {
            console.error('❌ getDeviceByUuid FAILED.');
        }
    } catch (e) {
        console.error('❌ getDeviceByUuid threw error:', e);
    }

    // 3. Test getDeviceByAssetId (Legacy fallback)
    try {
        const foundByAssetId = await getDeviceByAssetId(device.assetId);
        if (foundByAssetId?.id === device.id) {
            console.log('✅ getDeviceByAssetId working correctly.');
        } else {
            console.error('❌ getDeviceByAssetId FAILED.');
        }
    } catch (e) {
        console.error('❌ getDeviceByAssetId threw error:', e);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
