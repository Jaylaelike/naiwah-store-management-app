import { getReporters } from "@/app/admin/actions";
import { ReporterList } from "@/components/admin/ReporterList";

export default async function ReportersPage() {
    const reporters = await getReporters();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Manage Reporters</h1>
                <p className="text-muted-foreground">Add or remove authorized reporters.</p>
            </div>
            <ReporterList initialReporters={reporters} />
        </div>
    );
}
