import { getEmailSettings } from "@/app/admin/actions";
import { EmailSettingList } from "@/components/admin/EmailSettingList";

export default async function EmailSettingsPage() {
    const settings = await getEmailSettings();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Manage Email Subscribers</h1>
                <p className="text-muted-foreground">Add or remove email subscribers for reports.</p>
            </div>
            <EmailSettingList initialSettings={settings} />
        </div>
    );
}
