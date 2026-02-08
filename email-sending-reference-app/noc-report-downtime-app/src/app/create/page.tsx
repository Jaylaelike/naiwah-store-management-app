import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DowntimeRecordForm } from "./downtime-record-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getReporters } from "./actions";
import { getEmailRecipients, getCcEmailRecipients } from "@/app/api/email/actions";

export default async function CreatePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/signin");
    }

    const reporter = session.user.name || "Unknown";

    // Fetch all required data in parallel
    const [reporters, emailRecipients, ccEmailRecipients] = await Promise.all([
        getReporters(),
        getEmailRecipients(),
        getCcEmailRecipients(),
    ]);

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Create Downtime Record</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            Welcome, {session.user.name}
                        </span>
                        <Link href="/api/auth/signout">
                            <Button variant="outline" size="sm">
                                Sign Out
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <DowntimeRecordForm
                    reporter={reporter}
                    reporters={reporters}
                    emailRecipients={emailRecipients}
                    ccEmailRecipients={ccEmailRecipients}
                />
            </main>
        </div>
    );
}
