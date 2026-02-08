"use client";

import { useState, useEffect } from "react";
import { getDowntimeStats, DowntimeStats, FilterParams } from "./actions";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { DowntimeChart } from "@/components/analytics/DowntimeChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AnalyticsClientPage({ filterOptions }: { filterOptions: any }) {
    const [stats, setStats] = useState<DowntimeStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async (filters: FilterParams = {}) => {
        setLoading(true);
        try {
            const data = await getDowntimeStats(filters);
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div>
            <AnalyticsFilters options={filterOptions} onFilterChange={fetchStats} />

            {loading && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {!loading && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-card to-secondary/10">
                        <CardHeader>
                            <CardTitle className="text-2xl">Total Records: {stats.totalRecords}</CardTitle>
                            <CardDescription>Overview of all downtime events matching criteria</CardDescription>
                        </CardHeader>
                    </Card>



                    <Card>
                        <CardHeader>
                            <CardTitle>Records by Site</CardTitle>
                            <CardDescription>Distribution across different sites</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DowntimeChart title="" data={stats.bySite} type="bar" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>By Facility Provider</CardTitle>
                            <CardDescription>Breakdown by provider</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DowntimeChart title="" data={stats.byFacility} type="bar" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>By Engineering Center</CardTitle>
                            <CardDescription>Regional distribution</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <DowntimeChart title="" data={stats.byCenter} type="donut" />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
