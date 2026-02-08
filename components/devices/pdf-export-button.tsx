'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface PdfExportButtonProps {
    elementId: string;
    fileName: string;
}

export function PdfExportButton({ elementId, fileName }: PdfExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const input = document.getElementById(elementId);
            if (!input) {
                throw new Error(`Element with id '${elementId}' not found`);
            }

            const pages = input.getElementsByClassName('pdf-page');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            if (pages.length > 0) {
                // Multi-page export
                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i] as HTMLElement;

                    if (i > 0) {
                        pdf.addPage();
                    }

                    const imgData = await toPng(page, {
                        backgroundColor: '#ffffff',
                        cacheBust: true,
                        width: 794, // A4 width in px at 96 DPI approx (210mm)
                        height: 1123, // A4 height in px at 96 DPI approx (297mm)
                        style: {
                            transform: 'scale(1)',
                        }
                    });

                    // We assume the page is designed to fit A4, so we simply add it
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                }
            } else {
                // Single-page export (Backward compatibility)
                const imgData = await toPng(input, {
                    backgroundColor: '#ffffff',
                    cacheBust: true,
                });

                const imgProps = pdf.getImageProperties(imgData);
                const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            }

            pdf.save(`${fileName}.pdf`);
            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error('PDF Export Error:', error);
            toast.error('Failed to export PDF');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
        >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Export PDF
        </Button>
    );
}
