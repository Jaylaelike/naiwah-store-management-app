import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDown, ArrowLeft, Table } from 'lucide-react';

export default async function ReportsPage() {
    const session = await auth();
    if (session?.user?.role !== 'Admin') {
        redirect('/dashboard');
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/admin">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Reports</h2>
                    <p className="text-muted-foreground">
                        Generate and export system data.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Table className="h-5 w-5" />
                            Device Inventory Report
                        </CardTitle>
                        <CardDescription>
                            Complete list of all devices, including status, location, and specs.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                Includes: Asset ID, Device Name, Brand, Model, Serial, Status, Location (Section/Center/Station).
                            </p>
                            <Button asChild className="w-full sm:w-auto">
                                <a href="/api/reports/inventory" target="_blank" download>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Download CSV
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Table className="h-5 w-5" />
                            Repair History Report
                        </CardTitle>
                        <CardDescription>
                            Log of all repair activities performed on devices.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                Includes: Date, Asset ID, Device Name, Description, Logged By.
                            </p>
                            <Button asChild className="w-full sm:w-auto">
                                <a href="/api/reports/repairs" target="_blank" download>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Download CSV
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
