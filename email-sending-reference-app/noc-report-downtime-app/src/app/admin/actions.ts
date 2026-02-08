"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Auth Check ---
async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
    }
}

// --- Reporters ---
export async function getReporters() {
    await checkAdmin();
    return await prisma.reporter.findMany({
        orderBy: { id: "desc" },
    });
}

export async function createReporter(username: string) {
    await checkAdmin();
    const reporter = await prisma.reporter.create({
        data: { usernameReporter: username },
    });
    revalidatePath("/admin/reporters");
    return reporter;
}

export async function deleteReporter(id: number) {
    await checkAdmin();
    await prisma.reporter.delete({ where: { id } });
    revalidatePath("/admin/reporters");
}

export async function updateReporter(id: number, username: string) {
    await checkAdmin();
    await prisma.reporter.update({
        where: { id },
        data: { usernameReporter: username },
    });
    revalidatePath("/admin/reporters");
}

// --- Email Settings ---
export async function getEmailSettings() {
    await checkAdmin();
    return await prisma.emailSetting.findMany({
        orderBy: { id: "desc" },
    });
}

export async function createEmailSetting(data: {
    enterprise: string;
    username: string;
    telephone: string;
    emails: string;
}) {
    await checkAdmin();
    const setting = await prisma.emailSetting.create({ data });
    revalidatePath("/admin/email-settings");
    return setting;
}

export async function updateEmailSetting(
    id: number,
    data: {
        enterprise: string;
        username: string;
        telephone: string;
        emails: string;
    }
) {
    await checkAdmin();
    const setting = await prisma.emailSetting.update({
        where: { id },
        data,
    });
    revalidatePath("/admin/email-settings");
    return setting;
}

export async function deleteEmailSetting(id: number) {
    await checkAdmin();
    await prisma.emailSetting.delete({ where: { id } });
    revalidatePath("/admin/email-settings");
}

// --- CC Email Settings ---
export async function getCCEmailSettings() {
    await checkAdmin();
    return await prisma.cCEmailSetting.findMany({
        orderBy: { id: "desc" },
    });
}

export async function createCCEmailSetting(data: {
    enterpriseCc: string;
    usernameCc: string;
    telephoneCc: string;
    emailsCc: string;
}) {
    await checkAdmin();
    const setting = await prisma.cCEmailSetting.create({ data });
    revalidatePath("/admin/cc-email-settings");
    return setting;
}

export async function updateCCEmailSetting(
    id: number,
    data: {
        enterpriseCc: string;
        usernameCc: string;
        telephoneCc: string;
        emailsCc: string;
    }
) {
    await checkAdmin();
    const setting = await prisma.cCEmailSetting.update({
        where: { id },
        data,
    });
    revalidatePath("/admin/cc-email-settings");
    return setting;
}

export async function deleteCCEmailSetting(id: number) {
    await checkAdmin();
    await prisma.cCEmailSetting.delete({ where: { id } });
    revalidatePath("/admin/cc-email-settings");
}
