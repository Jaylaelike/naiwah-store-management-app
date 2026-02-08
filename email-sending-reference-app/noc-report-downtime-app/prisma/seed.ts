import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcrypt";
import path from "path";

// Get the project root (parent directory of prisma folder where seed.ts is run)
const dbPath = path.join(process.cwd(), "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Create test user
    const hashedPassword = await bcrypt.hash("thaipbseng1234", 10);

    const user = await prisma.user.upsert({
        where: { username: "thaipbs" },
        update: {},
        create: {
            username: "thaipbs",
            hashedPassword,
            role: "admin",
        },
    });

    console.log("Created user:", user.username);

    // Create sample reporters
    const reporters = ["Reporter 1", "Reporter 2"];
    for (const name of reporters) {
        const existing = await prisma.reporter.findFirst({
            where: { usernameReporter: name },
        });
        if (!existing) {
            await prisma.reporter.create({
                data: { usernameReporter: name },
            });
        }
    }

    console.log("Seed completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
