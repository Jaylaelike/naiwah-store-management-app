
import { prisma } from '../lib/prisma';

async function main() {
    console.log('Verifying UUID migration...');

    const devices = await prisma.device.findMany();
    console.log(`Found ${devices.length} devices.`);

    const uuids = new Set<string>();
    let hasError = false;

    for (const device of devices) {
        if (!device.uuid) {
            console.error(`Device ${device.id} has no UUID!`);
            hasError = true;
        } else {
            if (uuids.has(device.uuid)) {
                console.error(`Device ${device.id} has duplicate UUID: ${device.uuid}`);
                hasError = true;
            }
            uuids.add(device.uuid);
            // Basic UUID v7 validation (regex)
            const uuidV7Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidV7Regex.test(device.uuid)) {
                console.warn(`Device ${device.id} has UUID ${device.uuid} which does not look like UUID v7 (might be v4 or other valid uuid).`);
                // We used uuidv7(), so it should match.
            }
        }
    }

    if (hasError) {
        console.error('Verification FAILED.');
        process.exit(1);
    } else {
        console.log('Verification PASSED. All devices have unique UUIDs.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
