"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface FilterOptions {
    sites: string[];
    facilities: string[];
    centers: string[];
}

interface AnalyticsFiltersProps {
    options: FilterOptions;
    onFilterChange: (filters: any) => void;
}

export function AnalyticsFilters({ options, onFilterChange }: AnalyticsFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [site, setSite] = useState<string>("All");
    const [facility, setFacility] = useState<string>("All");
    const [center, setCenter] = useState<string>("All");

    // Initialize from URL params
    useEffect(() => {
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const siteParam = searchParams.get("site");
        const facilityParam = searchParams.get("facilityProvider");
        const centerParam = searchParams.get("engineeringCenter");

        if (startDate && endDate) {
            setDateRange({
                from: new Date(startDate),
                to: new Date(endDate)
            });
        }
        if (siteParam) setSite(siteParam);
        if (facilityParam) setFacility(facilityParam);
        if (centerParam) setCenter(centerParam);

        // Initial fetch with params if they exist
        if (startDate || siteParam || facilityParam || centerParam) {
            onFilterChange({
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                site: siteParam === "All" ? undefined : siteParam,
                facilityProvider: facilityParam === "All" ? undefined : facilityParam,
                engineeringCenter: centerParam === "All" ? undefined : centerParam,
            });
        }
    }, []); // Run once on mount

    const handleApply = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (dateRange?.from) params.set("startDate", dateRange.from.toISOString());
        else params.delete("startDate");

        if (dateRange?.to) params.set("endDate", dateRange.to.toISOString());
        else params.delete("endDate");

        if (site && site !== "All") params.set("site", site);
        else params.delete("site");

        if (facility && facility !== "All") params.set("facilityProvider", facility);
        else params.delete("facilityProvider");

        if (center && center !== "All") params.set("engineeringCenter", center);
        else params.delete("engineeringCenter");

        router.push(`/?${params.toString()}`);

        onFilterChange({
            startDate: dateRange?.from,
            endDate: dateRange?.to,
            site: site === "All" ? undefined : site,
            facilityProvider: facility === "All" ? undefined : facility,
            engineeringCenter: center === "All" ? undefined : center,
        });
    };

    const handleReset = () => {
        setDateRange(undefined);
        setSite("All");
        setFacility("All");
        setCenter("All");
        router.push("/");
        onFilterChange({});
    };

    return (
        <div className="bg-card p-4 rounded-lg border shadow-sm space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2 lg:col-span-2">
                    <Label>Date Range</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label>Site</Label>
                    <Select value={site} onValueChange={setSite}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Site" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Sites</SelectItem>
                            {options.sites.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Facility Provider</Label>
                    <Select value={facility} onValueChange={setFacility}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Provider" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Providers</SelectItem>
                            {options.facilities.map((f) => (
                                <SelectItem key={f} value={f}>
                                    {f}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Engineering Center</Label>
                    <Select value={center} onValueChange={setCenter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Center" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Centers</SelectItem>
                            {options.centers.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleReset}>Reset</Button>
                <Button onClick={handleApply}>Apply Filters</Button>
            </div>
        </div>
    );
}
