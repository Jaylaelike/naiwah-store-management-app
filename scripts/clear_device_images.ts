import Database from 'better-sqlite3';
import PocketBase from 'pocketbase';
import path from 'path';

const dbPath = path.join(process.cwd(), 'dev.db');
console.log('🗄️  Database path:', dbPath);
const db = new Database(dbPath);

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

async function main() {
    console.log('🧹 Starting device images clear...\n');

    // 1. Get all image records from SQLite
    const images = db.prepare('SELECT id, pbCollectionId, pbRecordId, pbFilename, url FROM DeviceImage').all() as {
        id: number;
        pbCollectionId: string | null;
        pbRecordId: string | null;
        pbFilename: string | null;
        url: string;
    }[];

    console.log(`📊 Found ${images.length} image records in database`);

    // 2. Try to delete from PocketBase storage
    let pbDeleted = 0;
    let pbErrors = 0;
    const pbImages = images.filter((img) => img.pbCollectionId && img.pbRecordId);

    if (pbImages.length > 0) {
        console.log(`\n☁️  Attempting to delete ${pbImages.length} images from PocketBase (${PB_URL})...`);
        try {
            const pb = new PocketBase(PB_URL);
            pb.autoCancellation(false);

            for (const img of pbImages) {
                try {
                    await pb.collection(img.pbCollectionId!).delete(img.pbRecordId!);
                    pbDeleted++;
                } catch (err: any) {
                    // Record may already be deleted or PB may be offline
                    pbErrors++;
                    if (pbErrors <= 3) {
                        console.error(`   ⚠ PB delete failed for record ${img.pbRecordId}: ${err.message}`);
                    }
                }
            }
            if (pbErrors > 3) {
                console.log(`   ... and ${pbErrors - 3} more PB errors (suppressed)`);
            }
            console.log(`   ✔ PocketBase: ${pbDeleted} deleted, ${pbErrors} errors`);
        } catch (err: any) {
            console.error(`   ⚠ PocketBase connection failed: ${err.message}`);
            console.log('   Proceeding with database cleanup only...');
        }
    } else {
        console.log('\n☁️  No PocketBase images found, skipping PB cleanup.');
    }

    // 3. Clear DeviceImage table in SQLite
    const result = db.prepare('DELETE FROM DeviceImage').run();
    console.log(`\n🗑️  Deleted ${result.changes} records from DeviceImage table`);

    // 4. Verify
    const remaining = db.prepare('SELECT count(*) as c FROM DeviceImage').get() as { c: number };
    console.log(`\n📋 Remaining image records: ${remaining.c}`);

    console.log('\n🎉 Device images cleared successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Clear failed:', e);
        process.exit(1);
    })
    .finally(() => {
        db.close();
    });
