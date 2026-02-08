
import { prisma } from '../lib/prisma';
import { v7 as uuidv7 } from 'uuid';

async function main() {
    console.log('Starting UUID backfill...');

    const devices = await prisma.device.findMany({
        where: {
            uuid: null,
        },
    });

    console.log(`Found ${devices.length} devices without UUID.`);

    for (const device of devices) {
        const newUuid = uuidv7();
        console.log(`Updating device ${device.id} with UUID ${newUuid}`);
        await prisma.device.update({
            where: { id: device.id },
            data: { uuid: newUuid },
        });
    }

    console.log('Backfill complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
