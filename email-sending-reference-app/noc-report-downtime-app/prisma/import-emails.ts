import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

const BACKUP_DIR = "/Users/user/Desktop/noc-report-app-web/managerdb/backups/2026-01-20T03-21-28";

interface EmailSettingBackup {
    id: number;
    enterprise: string;
    username: string;
    telphone: string;
    emails: string;
}

interface CCEmailSettingBackup {
    id_cc: number;
    enterprise_cc: string;
    username_cc: string;
    telphone_cc: string;
    emails_cc: string;
}

async function importEmailSettings() {
    console.log("Starting email settings import...\n");

    // Import EmailSettings
    const emailFile = path.join(BACKUP_DIR, "emailsettings.json");
    const emailData = JSON.parse(fs.readFileSync(emailFile, "utf-8"));
    console.log(`Importing ${emailData.rowCount} email settings...`);

    let emailImported = 0;
    for (const setting of emailData.data as EmailSettingBackup[]) {
        try {
            const existing = await prisma.emailSetting.findFirst({
                where: { username: setting.username },
            });
            if (!existing) {
                await prisma.emailSetting.create({
                    data: {
                        enterprise: setting.enterprise,
                        username: setting.username,
                        telephone: setting.telphone,
                        emails: setting.emails,
                    },
                });
                emailImported++;
            }
        } catch (error) {
            console.error(`Error importing email setting ${setting.username}:`, error);
        }
    }
    console.log(`Email settings: ${emailImported} imported`);

    // Import CCEmailSettings
    const ccEmailFile = path.join(BACKUP_DIR, "ccemailsettings.json");
    const ccEmailData = JSON.parse(fs.readFileSync(ccEmailFile, "utf-8"));
    console.log(`\nImporting ${ccEmailData.rowCount} CC email settings...`);

    let ccEmailImported = 0;
    for (const setting of ccEmailData.data as CCEmailSettingBackup[]) {
        try {
            const existing = await prisma.cCEmailSetting.findFirst({
                where: { usernameCc: setting.username_cc },
            });
            if (!existing) {
                await prisma.cCEmailSetting.create({
                    data: {
                        enterpriseCc: setting.enterprise_cc,
                        usernameCc: setting.username_cc,
                        telephoneCc: setting.telphone_cc,
                        emailsCc: setting.emails_cc,
                    },
                });
                ccEmailImported++;
            }
        } catch (error) {
            console.error(`Error importing CC email setting ${setting.username_cc}:`, error);
        }
    }
    console.log(`CC email settings: ${ccEmailImported} imported`);

    console.log("\n✅ Email settings import completed!");
}

importEmailSettings()
    .catch((e) => {
        console.error("Import failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
