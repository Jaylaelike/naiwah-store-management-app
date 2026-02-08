import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/reporters">
                    <Card className="hover:shadow-lg transition-all cursor-pointer">
                        <CardHeader>
                            <CardTitle>Reporters</CardTitle>
                            <CardDescription>Manage list of authorized reporters</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/admin/email-settings">
                    <Card className="hover:shadow-lg transition-all cursor-pointer">
                        <CardHeader>
                            <CardTitle>Email Settings</CardTitle>
                            <CardDescription>Manage email notification subscribers</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/admin/cc-email-settings">
                    <Card className="hover:shadow-lg transition-all cursor-pointer">
                        <CardHeader>
                            <CardTitle>CC Email Settings</CardTitle>
                            <CardDescription>Manage CC email recipients</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
