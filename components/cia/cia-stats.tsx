'use client';

import { Device } from '@prisma/client';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CiaStatsProps {
    devices: Device[];
}

export function CiaStats({ devices }: CiaStatsProps) {
    const stats = useMemo(() => {
        const c_counts: Record<string, number> = {};
        const i_counts: Record<string, number> = {};
        const a_counts: Record<string, number> = {};

        devices.forEach(d => {
            const c = d.c_score || 'Not Set';
            const i = d.i_score || 'Not Set';
            const a = d.a_score || 'Not Set';

            c_counts[c] = (c_counts[c] || 0) + 1;
            i_counts[i] = (i_counts[i] || 0) + 1;
            a_counts[a] = (a_counts[a] || 0) + 1;
        });

        const formatData = (counts: Record<string, number>) => {
            return Object.entries(counts).map(([name, value]) => ({ name, value }));
        };

        return {
            c: formatData(c_counts),
            i: formatData(i_counts),
            a: formatData(a_counts),
        };
    }, [devices]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const renderChart = (title: string, data: { name: string; value: number }[]) => (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
            {renderChart('Confidentiality', stats.c)}
            {renderChart('Integrity', stats.i)}
            {renderChart('Availability', stats.a)}
        </div>
    );
}
