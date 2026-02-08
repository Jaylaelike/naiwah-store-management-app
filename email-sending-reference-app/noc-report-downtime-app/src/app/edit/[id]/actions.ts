"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const UpdateRecordSchema = z.object({
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

export type UpdateRecordState = {
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

// Get a single record by ID
export async function getRecordById(id: number) {
    try {
        const record = await prisma.mainDb.findUnique({
            where: { id },
        });
        return record;
    } catch (error) {
        console.error("Error fetching record:", error);
        return null;
    }
}

// Update a downtime record
export async function updateDowntimeRecord(
    id: number,
    prevState: UpdateRecordState,
    formData: FormData
): Promise<UpdateRecordState> {
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

    const validatedFields = UpdateRecordSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed. Please check the form fields.",
            success: false,
        };
    }

    const data = validatedFields.data;

    try {
        const downtimeStart = new Date(data.DowntimeStart);
        const downtimeEnd = new Date(data.DowntimeEnd);

        await prisma.mainDb.update({
            where: { id },
            data: {
                Site: data.Site,
                FacilityProvider: data.FacilityProvider,
                EngineeringCenter: data.EngineeringCenter,
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
        console.error("Error updating record:", error);
        return {
            message: "Database error. Failed to update record.",
        };
    }

    revalidatePath("/");
    return {
        message: "Record updated successfully!",
        success: true,
    };
}

// Delete a downtime record
export async function deleteDowntimeRecord(id: number): Promise<{ success: boolean; message: string }> {
    try {
        await prisma.mainDb.delete({
            where: { id },
        });
        revalidatePath("/");
        return { success: true, message: "Record deleted successfully" };
    } catch (error) {
        console.error("Error deleting record:", error);
        return { success: false, message: "Failed to delete record" };
    }
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
