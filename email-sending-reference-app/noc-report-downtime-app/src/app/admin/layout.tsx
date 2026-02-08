import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "admin") {
        redirect("/");
    }

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-muted/40">
            <div className="w-full flex-none md:w-64 bg-card border-r">
                <div className="flex h-full px-3 py-4 md:px-2 flex-col gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">A</div>
                        <span className="font-bold text-lg">Admin Panel</span>
                    </div>

                    <Link href="/admin/reporters">
                        <Button variant="ghost" className="w-full justify-start">
                            Reporters
                        </Button>
                    </Link>
                    <Link href="/admin/email-settings">
                        <Button variant="ghost" className="w-full justify-start">
                            Email Settings
                        </Button>
                    </Link>
                    <Link href="/admin/cc-email-settings">
                        <Button variant="ghost" className="w-full justify-start">
                            CC Email Settings
                        </Button>
                    </Link>

                    <div className="mt-auto">
                        <Link href="/">
                            <Button variant="outline" className="w-full justify-start">
                                Back to App
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
                {children}
            </div>
        </div>
    );
}
