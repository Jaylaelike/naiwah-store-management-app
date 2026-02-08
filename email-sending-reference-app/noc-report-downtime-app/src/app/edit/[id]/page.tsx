import { notFound } from "next/navigation";
import { getRecordById, getReporters } from "./actions";
import { EditForm } from "./edit-form";
import { getEmailRecipients, getCcEmailRecipients } from "@/app/api/email/actions";

interface EditPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: EditPageProps) {
    const { id } = await params;
    const recordId = parseInt(id, 10);

    if (isNaN(recordId)) {
        notFound();
    }

    const [record, reporters, emailRecipients, ccEmailRecipients] = await Promise.all([
        getRecordById(recordId),
        getReporters(),
        getEmailRecipients(),
        getCcEmailRecipients(),
    ]);

    if (!record) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <EditForm
                record={record}
                reporters={reporters}
                emailRecipients={emailRecipients}
                ccEmailRecipients={ccEmailRecipients}
            />
        </div>
    );
}
