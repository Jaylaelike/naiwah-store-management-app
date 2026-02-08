"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DowntimeRecord } from "./columns";
import dayjs from "dayjs";

interface CsvExporterProps {
    data: DowntimeRecord[];
    filename?: string;
}

export function CsvExporter({ data, filename = "downtime_report" }: CsvExporterProps) {
    const handleExport = () => {
        if (!data || data.length === 0) {
            return;
        }

        // Define headers
        const headers = [
            "ID",
            "Site",
            "Facility Provider",
            "Engineering Center",
            "Posting Date",
            "Downtime Start",
            "Downtime End",
            "Downtime Total",
            "Detail",
            "Job Tickets",
            "Reporter",
            "Approver",
            "Remark",
        ];

        // Map data to rows
        const rows = data.map((item) => [
            item.id,
            `"${item.Site}"`, // Escape quotes
            `"${item.FacilityProvider}"`,
            `"${item.EngineeringCenter}"`,
            dayjs(item.PostingDate).format("YYYY-MM-DD"),
            dayjs(item.DowntimeStart).format("YYYY-MM-DD HH:mm:ss"),
            dayjs(item.DowntimeEnd).format("YYYY-MM-DD HH:mm:ss"),
            `"${item.DowntimeTotal}"`,
            `"${item.Detail.replace(/"/g, '""')}"`, // Escape double quotes in content
            `"${item.JobTickets}"`,
            `"${item.Reporter}"`,
            `"${item.Approver || ""}"`,
            `"${item.Remark.replace(/"/g, '""')}"`,
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.join(",")),
        ].join("\n");

        // Create blob and download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}_${dayjs().format("YYYY-MM-DD_HHmmss")}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
            onClick={handleExport}
        >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
        </Button>
    );
}
