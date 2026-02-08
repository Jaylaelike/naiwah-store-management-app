"use client";

import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PdfExportButtonProps {
    elementId: string;
    fileName?: string;
}

export function PdfExportButton({ elementId, fileName = "downtime-report" }: PdfExportButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownloadPdf = async () => {
        const element = document.getElementById(elementId);
        if (!element) {
            toast.error("Could not find report content");
            return;
        }

        setIsGenerating(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Improve quality
                logging: false,
                useCORS: true,
                backgroundColor: "#ffffff",
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });

            const imgData = canvas.toDataURL("image/png");

            // A4 dimensions in mm
            const pdfWidth = 210;
            const pdfHeight = 297;

            const pdf = new jsPDF("p", "mm", "a4");

            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // If content is longer than one page, we might need multiple pages or scale it down.
            // For this implementation, we'll scale to fit width and let height be whatever (single page for now usually)
            // or split if crucial. Given the report nature, let's keep it simple first.

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
            pdf.save(`${fileName}.pdf`);

            toast.success("PDF Report generated successfully");
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate PDF");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg"
        >
            <Download className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Download PDF"}
        </Button>
    );
}
