import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

const BACKUP_DIR = "/Users/user/Desktop/noc-report-app-web/managerdb/backups/2026-01-20T03-21-28";

interface MainDbBackup {
    id: number;
    Site: string;
    FacilityProvider: string;
    EngineeringCenter: string;
    PostingDate: string;
    DowntimeStart: string;
    DowntimeEnd: string;
    DowntimeTotal: string;
    Detail: string;
    JobTickets: string;
    Reporter: string;
    Approver: string;
    Remark: string;
    created_at: string;
    updatedAt: string | null;
}

interface UserBackup {
    id: string;
    username: string;
    role: string;
    hashed_password: string;
}

interface ReporterBackup {
    id_reporter: number;
    username_reporter: string;
}

async function importData() {
    console.log("Starting data import from backup...");
    console.log("Backup directory:", BACKUP_DIR);

    // Import Users
    const usersFile = path.join(BACKUP_DIR, "users.json");
    const usersData = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
    console.log(`\nImporting ${usersData.rowCount} users...`);

    for (const user of usersData.data as UserBackup[]) {
        try {
            await prisma.user.upsert({
                where: { username: user.username },
                update: {},
                create: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    hashedPassword: user.hashed_password,
                },
            });
        } catch (error) {
            console.error(`Error importing user ${user.username}:`, error);
        }
    }
    console.log("Users imported successfully!");

    // Import Reporters
    const reportersFile = path.join(BACKUP_DIR, "reporters.json");
    const reportersData = JSON.parse(fs.readFileSync(reportersFile, "utf-8"));
    console.log(`\nImporting ${reportersData.rowCount} reporters...`);

    for (const reporter of reportersData.data as ReporterBackup[]) {
        try {
            const existing = await prisma.reporter.findFirst({
                where: { usernameReporter: reporter.username_reporter },
            });
            if (!existing) {
                await prisma.reporter.create({
                    data: {
                        usernameReporter: reporter.username_reporter,
                    },
                });
            }
        } catch (error) {
            console.error(`Error importing reporter ${reporter.username_reporter}:`, error);
        }
    }
    console.log("Reporters imported successfully!");

    // Import MainDb records
    const maindbFile = path.join(BACKUP_DIR, "maindbs.json");
    const maindbData = JSON.parse(fs.readFileSync(maindbFile, "utf-8"));
    console.log(`\nImporting ${maindbData.rowCount} main database records...`);

    let imported = 0;
    let skipped = 0;

    for (const record of maindbData.data as MainDbBackup[]) {
        try {
            await prisma.mainDb.create({
                data: {
                    Site: record.Site,
                    FacilityProvider: record.FacilityProvider,
                    EngineeringCenter: record.EngineeringCenter,
                    PostingDate: new Date(record.PostingDate),
                    DowntimeStart: new Date(record.DowntimeStart),
                    DowntimeEnd: new Date(record.DowntimeEnd),
                    DowntimeTotal: record.DowntimeTotal,
                    Detail: record.Detail,
                    JobTickets: record.JobTickets,
                    Reporter: record.Reporter,
                    Approver: record.Approver || null,
                    Remark: record.Remark,
                    createdAt: new Date(record.created_at),
                },
            });
            imported++;
        } catch (error) {
            console.error(`Error importing record ${record.id}:`, error);
            skipped++;
        }
    }

    console.log(`\nMain database records: ${imported} imported, ${skipped} skipped`);
    console.log("\n✅ Data import completed!");
}

importData()
    .catch((e) => {
        console.error("Import failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
