import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { v7 as uuidv7 } from 'uuid';

// Use same path resolution as lib/prisma.ts
const dbPath = path.join(process.cwd(), 'dev.db');
console.log('🗄️  Database path:', dbPath);
const db = new Database(dbPath);

async function main() {
    console.log('🌱 Starting seed...');

    // Hash passwords function
    const hashPassword = async (pwd: string) => await bcrypt.hash(pwd, 10);

    // 1. Create Admin user
    const adminPassword = await hashPassword('admin123');
    const insertOrUpdate = db.prepare(`
    INSERT INTO User (username, password, email, role, thaiName, engName, department, position, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(username) DO UPDATE SET
      password = excluded.password,
      role = excluded.role,
      updatedAt = datetime('now')
  `);

    insertOrUpdate.run(
        'admin',
        adminPassword,
        'admin@naiwah.local',
        'Admin',
        'ผู้ดูแลระบบ',
        'System Administrator',
        'IT',
        'Administrator'
    );

    console.log('✅ Admin user created/updated');

    // 2. Import users from CSV
    const csvPath = path.join(process.cwd(), 'user_db.csv');
    if (fs.existsSync(csvPath)) {
        console.log(`\n📂 Reading users from ${csvPath}...`);
        const fileContent = fs.readFileSync(csvPath, 'utf-8');

        // Parse CSV with multiline support
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            relax_quotes: true,
        });

        console.log(`📊 Found ${records.length} users in CSV. Processing...`);

        const insertUser = db.prepare(`
      INSERT INTO User (
        username, password, email, role, 
        employeeId, department, division, engName, thaiName, 
        mobilePhone, position, section, imageUrl,
        createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(username) DO UPDATE SET
        password = excluded.password,
        email = excluded.email,
        department = excluded.department,
        division = excluded.division,
        engName = excluded.engName,
        thaiName = excluded.thaiName,
        mobilePhone = excluded.mobilePhone,
        position = excluded.position,
        section = excluded.section,
        imageUrl = excluded.imageUrl,
        updatedAt = datetime('now')
    `);

        let successCount = 0;
        let errorCount = 0;

        for (const rec of records) {
            const record = rec as any;
            try {
                // Map CSV fields to DB fields
                // CSV: id,email,username,password,createdAt,updatedAt,employeeId,Department,Division,EngName,Mobile_Phone,Position,Section,ThaiName,image_url

                // Handle username or fallback to ID
                const username = record.username || record.id?.toString();
                if (!username) {
                    // Skip completely empty rows or invalid records
                    continue;
                }

                // Password handling - use CSV password or default to username if missing
                const rawPassword = record.password || username;
                const hashedPassword = await hashPassword(rawPassword);

                // Determine role - default to 'User'
                const role = 'User';

                // Clean up mobile phone (remove formatting if needed or keep as string)
                // Handle "NULL" strings
                const clean = (val: any) => {
                    if (!val) return null;
                    const s = String(val).trim();
                    if (s === 'NULL' || s === 'None' || s === '-' || s === '') return null;
                    return s;
                };

                // Build image URL from employeeId
                const empId = clean(record.employeeId);
                let imageUrl = empId ? `https://mis.thaipbs.or.th/files/emp/${empId}.jpg` : null;

                insertUser.run(
                    username,
                    hashedPassword,
                    clean(record.email),
                    role,
                    clean(record.employeeId),
                    clean(record.Department),
                    clean(record.Division),
                    clean(record.EngName),
                    clean(record.ThaiName),
                    clean(record.Mobile_Phone),
                    clean(record.Position),
                    clean(record.Section),
                    imageUrl
                );
                successCount++;
            } catch (err: any) {
                console.error(`❌ Error importing user ${record.username || 'unknown'}:`, err.message);
                errorCount++;
            }
        }

        console.log(`\n✅ CSV Import completed: ${successCount} successful, ${errorCount} failed.`);

    } else {
        // Fallback: try user_update.sql
        const sqlPath = path.join(process.cwd(), 'user_update.sql');
        if (fs.existsSync(sqlPath)) {
            console.log(`\n📂 CSV not found, falling back to ${sqlPath}...`);
            const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

            // Parse PostgreSQL-style INSERT VALUES tuples
            // Format: ('id', 'email', 'username', 'password', 'createdAt', 'updatedAt', 'employeeId', 'Department', 'Division', 'EngName', 'Mobile_Phone', 'Position', 'Section', 'ThaiName', 'image_url')
            const tupleRegex = /\(\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*\)/g;

            const insertUserSql = db.prepare(`
                INSERT INTO User (
                    username, password, email, role,
                    employeeId, department, division, engName, thaiName,
                    mobilePhone, position, section, imageUrl,
                    createdAt, updatedAt
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                ON CONFLICT(username) DO UPDATE SET
                    email = excluded.email,
                    department = excluded.department,
                    division = excluded.division,
                    engName = excluded.engName,
                    thaiName = excluded.thaiName,
                    mobilePhone = excluded.mobilePhone,
                    position = excluded.position,
                    section = excluded.section,
                    imageUrl = excluded.imageUrl,
                    updatedAt = datetime('now')
            `);

            let sqlSuccess = 0;
            let sqlError = 0;
            let match;

            while ((match = tupleRegex.exec(sqlContent)) !== null) {
                try {
                    const [, , email, username, rawPassword, , , employeeId, department, division, engName, mobilePhone, position, section, thaiName, imageUrl] = match;

                    if (!username) continue;

                    const clean = (val: string) => {
                        const s = val.trim();
                        if (s === 'NULL' || s === 'None' || s === '-' || s === '') return null;
                        return s;
                    };

                    const hashedPassword = await hashPassword(rawPassword || username);
                    const cleanEmployeeId = clean(employeeId);
                    const empImageUrl = cleanEmployeeId ? `https://mis.thaipbs.or.th/files/emp/${cleanEmployeeId}.jpg` : null;

                    insertUserSql.run(
                        username,
                        hashedPassword,
                        clean(email),
                        'User',
                        cleanEmployeeId,
                        clean(department),
                        clean(division),
                        clean(engName),
                        clean(thaiName),
                        clean(mobilePhone),
                        clean(position),
                        clean(section),
                        empImageUrl
                    );
                    sqlSuccess++;
                } catch (err: any) {
                    console.error(`❌ Error importing user from SQL:`, err.message);
                    sqlError++;
                }
            }
            console.log(`\n✅ SQL Import completed: ${sqlSuccess} successful, ${sqlError} failed.`);
        } else {
            console.log(`\n⚠️  No user data file found (tried ${csvPath} and user_update.sql). Skipping user import.`);
        }
    }

    // 3. Import devices from CSV
    const deviceCsvPath = path.join(process.cwd(), 'context', 'database_example.csv');
    if (fs.existsSync(deviceCsvPath)) {
        console.log(`\n📂 Reading devices from ${deviceCsvPath}...`);
        const fileContent = fs.readFileSync(deviceCsvPath, 'utf-8');

        // Parse CSV
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            relax_quotes: true,
        });

        console.log(`📊 Found ${records.length} devices in CSV. Processing...`);

        const insertDevice = db.prepare(`
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

        let successCount = 0;
        let errorCount = 0;

        for (const rec of records) {
            const record = rec as any;
            try {
                // Map fields
                // Header: "New Asset\n(ค.ศ.)",Status,Function,Device IP,Device Name,Sub_System,CodeID,Section,Center,Station,Brand,Model,Serial Number,IP Address Scan,Mac Address Scan...

                const assetId = record['New Asset\n(ค.ศ.)'];
                if (!assetId) continue;

                // Status mapping
                let status = 'Active';
                const rawStatus = record['Status'];
                if (rawStatus === 'ใช้งาน') status = 'Active';
                else if (rawStatus === 'สำรอง') status = 'Spare';
                else if (rawStatus === 'ส่งซ่อม') status = 'Repair';
                else if (rawStatus === 'ตัดจำหน่าย') status = 'Disposed';

                // Build hostId from IP octets columns (IP, ส่วนงานฯ, สถานี, อุปกรณ์ (Host_ID))
                const hostIdRaw = record['อุปกรณ์ (Host_ID)'] || null;
                const ipCol = record['IP'] || null;
                let hostId: string | null = null;
                if (hostIdRaw || ipCol) {
                    // Use the full IP or compose from octets
                    hostId = hostIdRaw ? String(hostIdRaw).trim() : ipCol;
                }

                insertDevice.run(
                    uuidv7(),
                    assetId,
                    status,
                    record['Function'] || null,
                    record['Device Name'] || null,
                    record['Brand'] || null,
                    record['Model'] || null,
                    record['Serial Number'] || null,
                    record['IP Address Scan'] || null,
                    record['Mac Address Scan'] || null,
                    record['C'] || null,
                    record['I'] || null,
                    record['A'] || null,
                    hostId,
                    record['Section'] || null,
                    record['Center'] || null,
                    record['Station'] || null
                );
                successCount++;
            } catch (err: any) {
                console.error(`❌ Error importing device ${record['New Asset\n(ค.ศ.)'] || 'unknown'}:`, err.message);
                errorCount++;
            }
        }
        console.log(`\n✅ Device Import completed: ${successCount} successful, ${errorCount} failed.`);
    } else {
        console.log(`\n⚠️  Device CSV file not found at ${deviceCsvPath}. Skipping device import.`);
    }

    // Verify users count
    const count = db.prepare('SELECT count(*) as count FROM User').get() as { count: number };
    console.log(`\n📋 Total users in database: ${count.count}`);

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
