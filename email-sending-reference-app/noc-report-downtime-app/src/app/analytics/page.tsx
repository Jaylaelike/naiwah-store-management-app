import { getDowntimeStats, getFilterOptions, FilterParams } from "./actions";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { DowntimeChart } from "@/components/analytics/DowntimeChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import AnalyticsClientPage from "./AnalyticsClientPage";

// We'll separate the client component for state management
export default async function AnalyticsPage() {
    const filterOptions = await getFilterOptions();

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground">
                    Analyze downtime records, trends, and distributions.
                </p>
            </div>

            <Suspense fallback={<div>Loading analytics...</div>}>
                <AnalyticsClientPage filterOptions={filterOptions} />
            </Suspense>
        </div>
    );
}
