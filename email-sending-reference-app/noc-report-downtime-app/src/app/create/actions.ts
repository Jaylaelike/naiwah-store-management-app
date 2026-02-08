"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

const CreateRecordSchema = z.object({
    Site: z.string().min(1, "Site is required"),
    FacilityProvider: z.string().min(1, "Facility Provider is required"),
    EngineeringCenter: z.string().min(1, "Engineering Center is required"),
    DowntimeStart: z.string().min(1, "Downtime Start is required"),
    DowntimeEnd: z.string().min(1, "Downtime End is required"),
    DowntimeTotal: z.string().min(1, "Downtime Total is required"),
    Detail: z.string().min(1, "Detail is required"),
    JobTickets: z.string().default(""),
    Reporter: z.string().min(1, "Reporter is required"),
    Approver: z.string().optional(),
    Remark: z.string().min(1, "Remark is required"),
});

export type CreateRecordState = {
    errors?: {
        Site?: string[];
        FacilityProvider?: string[];
        EngineeringCenter?: string[];
        DowntimeStart?: string[];
        DowntimeEnd?: string[];
        DowntimeTotal?: string[];
        Detail?: string[];
        JobTickets?: string[];
        Reporter?: string[];
        Approver?: string[];
        Remark?: string[];
    };
    message?: string;
    success?: boolean;
};

export async function createDowntimeRecord(
    prevState: CreateRecordState,
    formData: FormData
): Promise<CreateRecordState> {
    const rawData = {
        Site: formData.get("Site"),
        FacilityProvider: formData.get("FacilityProvider"),
        EngineeringCenter: formData.get("EngineeringCenter"),
        DowntimeStart: formData.get("DowntimeStart"),
        DowntimeEnd: formData.get("DowntimeEnd"),
        DowntimeTotal: formData.get("DowntimeTotal"),
        Detail: formData.get("Detail"),
        JobTickets: formData.get("JobTickets") || "",
        Reporter: formData.get("Reporter"),
        Approver: formData.get("Approver") || "",
        Remark: formData.get("Remark"),
    };

    const validatedFields = CreateRecordSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed. Please check the form fields.",
            success: false,
        };
    }

    const data = validatedFields.data;

    try {
        // Convert datetime strings to Date objects with timezone adjustment (+7h for Thailand)
        const downtimeStart = new Date(data.DowntimeStart);
        const downtimeEnd = new Date(data.DowntimeEnd);

        await prisma.mainDb.create({
            data: {
                Site: data.Site,
                FacilityProvider: data.FacilityProvider,
                EngineeringCenter: data.EngineeringCenter,
                PostingDate: new Date(),
                DowntimeStart: downtimeStart,
                DowntimeEnd: downtimeEnd,
                DowntimeTotal: data.DowntimeTotal,
                Detail: data.Detail,
                JobTickets: data.JobTickets,
                Reporter: data.Reporter,
                Approver: data.Approver || null,
                Remark: data.Remark,
            },
        });
    } catch (error) {
        console.error("Error creating record:", error);
        return {
            message: "Database error. Failed to create record.",
            success: false,
        };
    }

    return {
        message: "Record created successfully!",
        success: true,
    };
}

// Fetch all reporters for dropdown
export async function getReporters() {
    try {
        const reporters = await prisma.reporter.findMany({
            orderBy: { usernameReporter: "asc" },
        });
        return reporters;
    } catch (error) {
        console.error("Error fetching reporters:", error);
        return [];
    }
}
