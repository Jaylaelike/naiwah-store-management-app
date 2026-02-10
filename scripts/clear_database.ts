import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'dev.db');
console.log('🗄️  Database path:', dbPath);
const db = new Database(dbPath);

function main() {
    console.log('🧹 Starting database clear...\n');

    // Order matters: delete child tables first to respect foreign key constraints
    const tables = [
        { name: 'DeviceAuditLog', label: 'Device Audit Logs' },
        { name: 'Notification', label: 'Notifications' },
        { name: 'ApprovalRequest', label: 'Approval Requests' },
        { name: 'TransferHistory', label: 'Transfer History' },
        { name: 'RepairHistory', label: 'Repair History' },
        { name: 'DeviceImage', label: 'Device Images' },
        { name: 'Device', label: 'Devices' },
        // Uncomment to also clear users:
        // { name: 'User', label: 'Users' },
    ];

    for (const { name, label } of tables) {
        try {
            const countBefore = db.prepare(`SELECT count(*) as c FROM ${name}`).get() as { c: number };
            db.prepare(`DELETE FROM ${name}`).run();
            console.log(`   ✔ ${label} (${name}): ${countBefore.c} records deleted`);
        } catch (err: any) {
            console.error(`   ✖ ${label} (${name}): ${err.message}`);
        }
    }

    // Verify
    console.log('\n📋 Verification — remaining records:');
    for (const { name, label } of tables) {
        try {
            const count = db.prepare(`SELECT count(*) as c FROM ${name}`).get() as { c: number };
            console.log(`   ${label}: ${count.c}`);
        } catch { /* skip */ }
    }

    console.log('\n🎉 Database cleared successfully!');
}

main();
db.close();
