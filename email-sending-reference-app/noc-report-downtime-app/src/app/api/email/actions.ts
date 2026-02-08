"use server";

import { prisma } from "@/lib/prisma";

// Fetch all email recipients
export async function getEmailRecipients() {
    try {
        const emails = await prisma.emailSetting.findMany({
            select: {
                id: true,
                enterprise: true,
                username: true,
                emails: true,
            },
            orderBy: { username: "asc" },
        });
        return emails;
    } catch (error) {
        console.error("Error fetching email recipients:", error);
        return [];
    }
}

// Fetch all CC email recipients
export async function getCcEmailRecipients() {
    try {
        const ccEmails = await prisma.cCEmailSetting.findMany({
            select: {
                id: true,
                enterpriseCc: true,
                usernameCc: true,
                emailsCc: true,
            },
            orderBy: { usernameCc: "asc" },
        });
        return ccEmails;
    } catch (error) {
        console.error("Error fetching CC email recipients:", error);
        return [];
    }
}

// Send email report
export async function sendEmailReport(data: {
    posting_date: string;
    station_name: string;
    facility_name: string;
    detail_data: string;
    start_time: string;
    end_time: string;
    sum_time: string;
    user_to: string[];
    cc: string[];
}): Promise<{ success: boolean; message: string }> {
    try {
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sendmail`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            return { success: false, message: error.message || "Failed to send email" };
        }

        return { success: true, message: "Email sent successfully" };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, message: "Failed to send email" };
    }
}
