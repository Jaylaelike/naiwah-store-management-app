import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { v7 as uuidv7 } from 'uuid';

// Use same path resolution as lib/prisma.ts
const dbPath = path.join(process.cwd(), 'dev.db');
console.log('🗄️  Database path:', dbPath);
const db = new Database(dbPath);

// Thai status → English status mapping
const STATUS_MAP: Record<string, string> = {
    'ใช้งาน': 'Active',
    'ใช้ งาน': 'Active',   // typo variant with space
    'สำรอง': 'Spare',
    'ส่งซ่อม': 'Repair',
    'ซ่อมแซม': 'Repair',
    'ส่งเคลม': 'Repair',
    'ยกเลิก': 'Disposed',
    'ขายทอดตลาด': 'Disposed',
    'ชำรุด': 'Damaged',
    'ไม่พบ': 'Missing',
    'บำรุงรักษา': 'Maintenance',
};

function mapStatus(rawStatus: string | null | undefined): string {
    if (!rawStatus) return 'Active';
    const trimmed = rawStatus.trim();
    return STATUS_MAP[trimmed] || trimmed; // Keep as-is if no mapping found
}

function clean(val: any): string | null {
    if (val === null || val === undefined) return null;
    const s = String(val).trim();
    if (s === '' || s === 'NULL' || s === 'None' || s === '-' || s === '--') return null;
    return s;
}

async function main() {
    console.log('🌱 Starting old database seed from master_data.csv...');

    const csvPath = path.join(process.cwd(), 'context', 'master_data.csv');
    if (!fs.existsSync(csvPath)) {
        console.error(`❌ CSV file not found at ${csvPath}`);
        console.error('   Please convert master_data.xlsx to master_data.csv first.');
        process.exit(1);
    }

    console.log(`📂 Reading devices from ${csvPath}...`);
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    // Parse CSV with multiline support (header has newline in "New Asset\n(ค.ศ.)")
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true,
    });

    console.log(`📊 Found ${records.length} records in CSV. Processing...`);

    const insertDeviceUpsert = db.prepare(`
    INSERT INTO Device (
      uuid, assetId, status, function, deviceName, brand, model,
      serialNumber, ipAddress, macAddress,
      c_score, i_score, a_score, hostId,
      section, center, station,
      createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(assetId) DO UPDATE SET
      status = excluded.status,
      function = excluded.function,
      deviceName = excluded.deviceName,
      brand = excluded.brand,
      model = excluded.model,
      serialNumber = excluded.serialNumber,
      ipAddress = excluded.ipAddress,
      macAddress = excluded.macAddress,
      c_score = excluded.c_score,
      i_score = excluded.i_score,
      a_score = excluded.a_score,
      hostId = excluded.hostId,
      section = excluded.section,
      center = excluded.center,
      station = excluded.station,
      updatedAt = datetime('now')
  `);

    // Separate insert for null assetId rows (NULL never conflicts in UNIQUE)
    const insertDeviceNullAsset = db.prepare(`
    INSERT INTO Device (
      uuid, assetId, status, function, deviceName, brand, model,
      serialNumber, ipAddress, macAddress,
      c_score, i_score, a_score, hostId,
      section, center, station,
      createdAt, updatedAt
    )
    VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

    let successCount = 0;
    let errorCount = 0;
    let nullAssetCount = 0;

    // Wrap in transaction for performance (13k+ rows)
    const insertMany = db.transaction((rows: any[]) => {
        for (const rec of rows) {
            const record = rec as any;
            try {
                // CSV header: "New Asset\n(ค.ศ.)" — csv-parse may join this as one key
                // Try different possible header names
                const assetId =
                    record['New Asset\n(ค.ศ.)'] ||
                    record['New Asset (ค.ศ.)'] ||
                    record['New Asset\r\n(ค.ศ.)'] ||
                    Object.values(record)[0]; // fallback: first column value

                const cleanAssetId = clean(String(assetId));

                // Map status
                const status = mapStatus(record['Status']);

                // Build hostId from the last column
                const hostIdRaw = record['อุปกรณ์ (Host_ID)'] || null;
                const hostId = clean(hostIdRaw);

                const args = [
                    status,
                    clean(record['Function']),
                    clean(record['Device Name']),
                    clean(record['Brand']),
                    clean(record['Model']),
                    clean(record['Serial Number']),
                    clean(record['IP Address Scan']),
                    clean(record['Mac Address Scan']),
                    clean(record['C']),
                    clean(record['I']),
                    clean(record['A']),
                    hostId,
                    clean(record['Section']),
                    clean(record['Center']),
                    clean(record['Station'])
                ];

                if (cleanAssetId) {
                    // Non-null assetId: upsert
                    insertDeviceUpsert.run(uuidv7(), cleanAssetId, ...args);
                } else {
                    // Null assetId: always insert new row
                    insertDeviceNullAsset.run(uuidv7(), ...args);
                    nullAssetCount++;
                }
                successCount++;
            } catch (err: any) {
                const aid = record['New Asset\n(ค.ศ.)'] || record['New Asset (ค.ศ.)'] || 'unknown';
                console.error(`❌ Error importing device ${aid}:`, err.message);
                errorCount++;
            }
        }
    });

    // Execute the transaction
    insertMany(records);

    console.log(`\n✅ Old Database Seed completed:`);
    console.log(`   ✔ Success: ${successCount} (including ${nullAssetCount} with null assetId)`);
    console.log(`   ✖ Errors: ${errorCount}`);

    // Verify total device count
    const totalDevices = db.prepare('SELECT count(*) as count FROM Device').get() as { count: number };
    console.log(`\n📋 Total devices in database: ${totalDevices.count}`);

    // Show status distribution
    const statusDist = db.prepare('SELECT status, count(*) as count FROM Device GROUP BY status ORDER BY count DESC').all() as { status: string; count: number }[];
    console.log('\n📊 Status distribution:');
    for (const row of statusDist) {
        console.log(`   ${row.status}: ${row.count}`);
    }

    console.log('\n🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(() => {
        db.close();
    });
