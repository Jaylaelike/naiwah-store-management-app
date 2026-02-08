import { getCCEmailSettings } from "@/app/admin/actions";
import { CCEmailSettingList } from "@/components/admin/CCEmailSettingList";

export default async function CCEmailSettingsPage() {
    const settings = await getCCEmailSettings();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Manage CC Email Subscribers</h1>
                <p className="text-muted-foreground">Add or remove carbon copy (CC) email subscribers.</p>
            </div>
            <CCEmailSettingList initialSettings={settings} />
        </div>
    );
}
