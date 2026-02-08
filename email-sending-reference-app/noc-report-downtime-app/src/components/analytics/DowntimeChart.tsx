"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// Dynamic import for client-side only rendering
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DowntimeChartProps {
    title: string;
    data: { x: string; y: number }[];
    type?: "bar" | "line" | "pie" | "donut";
    colors?: string[];
}

export function DowntimeChart({ title, data, type = "bar", colors }: DowntimeChartProps) {
    const series = [
        {
            name: "Records",
            data: data.map((d) => d.y),
        },
    ];

    const PieSeries = data.map((d) => d.y);

    const options: ApexOptions = {
        chart: {
            toolbar: { show: false },
            background: 'transparent',
        },
        title: {
            text: title,
            align: 'left',
            style: {
                color: 'currentColor'
            }
        },
        xaxis: {
            categories: data.map((d) => d.x),
            labels: {
                style: {
                    colors: 'currentColor'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: 'currentColor'
                }
            }
        },
        colors: colors,
        dataLabels: {
            enabled: false
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
            }
        },
        theme: {
            mode: 'light', // or 'dark', but 'currentColor' usually works better with shadcn themes if handled right.
            // But ApexCharts has specific themes. We might need to detect system theme.
            // For now let's stick to default.
        },
    };

    // Adjust logic for pie/donut since they take simple array for series
    if (type === 'pie' || type === 'donut') {
        const pieOptions: ApexOptions = {
            ...options,
            labels: data.map(d => d.x),
        };

        return (
            <div className="w-full bg-card text-card-foreground p-4 rounded-xl border shadow-sm">
                <Chart options={pieOptions} series={PieSeries} type={type} height={350} />
            </div>
        )
    }

    return (
        <div className="w-full bg-card text-card-foreground p-4 rounded-xl border shadow-sm">
            <Chart options={options} series={series} type={type} height={350} />
        </div>
    );
}
