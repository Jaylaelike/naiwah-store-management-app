'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    AreaChart,
    Area,
    CartesianGrid,
} from 'recharts';
import type { AnalyticsData } from '@/lib/actions/dashboard';

interface DashboardChartsProps {
    data: AnalyticsData;
}

const STATUS_COLORS: Record<string, string> = {
    Active: '#22c55e',
    Spare: '#a855f7',
    Repair: '#eab308',
    Disposed: '#ef4444',
    Unknown: '#6b7280',
};

const CIA_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const RISK_COLORS: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
    unset: '#94a3b8',
};

const STATUS_KEYS = ['Active', 'Spare', 'Repair', 'Disposed', 'Unknown'] as const;

// Custom tooltip component for consistent styling
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string; fill?: string }>; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
            {label && <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>}
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                    <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: entry.color || entry.fill }}
                    />
                    <span className="text-muted-foreground">{entry.name}:</span>
                    <span className="font-semibold">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}

// ===========================================
// Chart Sections
// ===========================================

function StatusPieChart({ data }: { data: AnalyticsData['statusData'] }) {
    const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

    return (
        <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">สถานะอุปกรณ์</CardTitle>
                <CardDescription className="text-xs">สัดส่วนอุปกรณ์แยกตามสถานะ</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6b7280'} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        {/* Center label */}
                        <text x="50%" y="48%" textAnchor="middle" className="fill-foreground text-2xl font-bold">
                            {total}
                        </text>
                        <text x="50%" y="56%" textAnchor="middle" className="fill-muted-foreground text-xs">
                            ทั้งหมด
                        </text>
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 text-xs mt-1">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.name] || '#6b7280' }} />
                            <span className="text-muted-foreground">{item.name}</span>
                            <span className="font-medium">{item.value}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function SectionStatusStackedBar({ data }: { data: AnalyticsData['sectionByStatus'] }) {
    return (
        <Card className="backdrop-blur-sm bg-card/50 col-span-1 lg:col-span-2">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">แผนก × สถานะอุปกรณ์</CardTitle>
                <CardDescription className="text-xs">มุมมองหลายมิติ: จำนวนอุปกรณ์แต่ละแผนก แยกตามสถานะ</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical" margin={{ left: 5, right: 20, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis
                            type="category"
                            dataKey="section"
                            width={90}
                            tick={{ fontSize: 11 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                        {STATUS_KEYS.map((status) => (
                            <Bar
                                key={status}
                                dataKey={status}
                                stackId="status"
                                fill={STATUS_COLORS[status]}
                                radius={status === 'Unknown' ? [0, 4, 4, 0] : undefined}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function CiaRadarChart({ data }: { data: AnalyticsData['ciaRadar'] }) {
    return (
        <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CIA Risk Radar</CardTitle>
                <CardDescription className="text-xs">ภาพรวมระดับ C-I-A ขององค์กร</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                        <PolarGrid stroke="#888" strokeOpacity={0.3} />
                        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: '#888' }} />
                        <PolarRadiusAxis tick={{ fontSize: 9, fill: '#888' }} axisLine={false} />
                        <Radar name="High" dataKey="high" stroke="#ef4444" fill="#ef4444" fillOpacity={0.45} strokeWidth={2} />
                        <Radar name="Medium" dataKey="medium" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.35} strokeWidth={2} />
                        <Radar name="Low" dataKey="low" stroke="#22c55e" fill="#22c55e" fillOpacity={0.25} strokeWidth={2} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function CiaDetailCharts({ ciaData }: { ciaData: AnalyticsData['ciaData'] }) {
    const renderCiaChart = (title: string, chartData: { name: string; value: number }[]) => (
        <div className="flex-1 min-w-45">
            <p className="text-sm font-medium text-center mb-2 text-muted-foreground">{title}</p>
            <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                    >
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CIA_COLORS[index % CIA_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 text-xs mt-1">
                {chartData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CIA_COLORS[index % CIA_COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}: {item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CIA Score Distribution</CardTitle>
                <CardDescription className="text-xs">Confidentiality · Integrity · Availability</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    {renderCiaChart('Confidentiality', ciaData.c)}
                    {renderCiaChart('Integrity', ciaData.i)}
                    {renderCiaChart('Availability', ciaData.a)}
                </div>
            </CardContent>
        </Card>
    );
}

function ActivityTimelineChart({ data }: { data: AnalyticsData['activityTimeline'] }) {
    return (
        <Card className="backdrop-blur-sm bg-card/50 col-span-1 lg:col-span-2">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">กิจกรรมอุปกรณ์ (12 เดือน)</CardTitle>
                <CardDescription className="text-xs">แนวโน้มการสร้างและอัปเดตอุปกรณ์รายเดือน</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradUpdated" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                        <Area
                            type="monotone"
                            dataKey="created"
                            name="สร้างใหม่"
                            stroke="#3b82f6"
                            fill="url(#gradCreated)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="updated"
                            name="อัปเดต"
                            stroke="#22c55e"
                            fill="url(#gradUpdated)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function FunctionDistributionChart({ data }: { data: AnalyticsData['functionDistribution'] }) {
    return (
        <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ประเภทอุปกรณ์</CardTitle>
                <CardDescription className="text-xs">จำนวนอุปกรณ์แยกตามฟังก์ชัน (Top 10)</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data} margin={{ left: 5, right: 10, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 9 }}
                            angle={-30}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="จำนวน" radius={[4, 4, 0, 0]}>
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function CenterStatusChart({ data }: { data: AnalyticsData['centerByStatus'] }) {
    return (
        <Card className="backdrop-blur-sm bg-card/50 col-span-1 lg:col-span-2">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ศูนย์ × สถานะอุปกรณ์</CardTitle>
                <CardDescription className="text-xs">กระจายอุปกรณ์ตามศูนย์/สถานที่ แยกสถานะ</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data} margin={{ left: 5, right: 20, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="center" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                        {STATUS_KEYS.map((status) => (
                            <Bar key={status} dataKey={status} stackId="status" fill={STATUS_COLORS[status]} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

function RiskMatrixTable({ data }: { data: AnalyticsData['riskMatrix'] }) {
    const levelLabel: Record<string, string> = {
        high: 'สูง',
        medium: 'กลาง',
        low: 'ต่ำ',
        unset: 'ไม่กำหนด',
    };
    const levelBadge: Record<string, string> = {
        high: 'bg-red-500/15 text-red-700 dark:text-red-400',
        medium: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
        low: 'bg-green-500/15 text-green-700 dark:text-green-400',
        unset: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
    };

    return (
        <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Matrix (C×I×A)</CardTitle>
                <CardDescription className="text-xs">การกระจายระดับความเสี่ยง C-I-A ขององค์กร (Top 15)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-auto max-h-80">
                    <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-card">
                            <tr className="border-b">
                                <th className="text-left py-2 px-1 font-medium text-muted-foreground">C</th>
                                <th className="text-left py-2 px-1 font-medium text-muted-foreground">I</th>
                                <th className="text-left py-2 px-1 font-medium text-muted-foreground">A</th>
                                <th className="text-right py-2 px-1 font-medium text-muted-foreground">จำนวน</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => (
                                <tr key={i} className="border-b border-border/40">
                                    <td className="py-1.5 px-1">
                                        <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-medium ${levelBadge[row.c]}`}>
                                            {levelLabel[row.c]}
                                        </span>
                                    </td>
                                    <td className="py-1.5 px-1">
                                        <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-medium ${levelBadge[row.i]}`}>
                                            {levelLabel[row.i]}
                                        </span>
                                    </td>
                                    <td className="py-1.5 px-1">
                                        <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-medium ${levelBadge[row.a]}`}>
                                            {levelLabel[row.a]}
                                        </span>
                                    </td>
                                    <td className="text-right py-1.5 px-1 font-semibold tabular-nums">{row.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

// ===========================================
// Main Dashboard Charts with Tab Perspectives
// ===========================================

export function DashboardCharts({ data }: DashboardChartsProps) {
    return (
        <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 lg:w-125">
                <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
                <TabsTrigger value="organizational">องค์กร</TabsTrigger>
                <TabsTrigger value="security">ความปลอดภัย</TabsTrigger>
                <TabsTrigger value="trends">แนวโน้ม</TabsTrigger>
            </TabsList>

            {/* Overview Perspective */}
            <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <StatusPieChart data={data.statusData} />
                    <SectionStatusStackedBar data={data.sectionByStatus} />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <FunctionDistributionChart data={data.functionDistribution} />
                    <ActivityTimelineChart data={data.activityTimeline} />
                </div>
            </TabsContent>

            {/* Organizational Perspective */}
            <TabsContent value="organizational" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <SectionStatusStackedBar data={data.sectionByStatus} />
                    <FunctionDistributionChart data={data.functionDistribution} />
                </div>
                <CenterStatusChart data={data.centerByStatus} />
            </TabsContent>

            {/* Security / CIA Perspective */}
            <TabsContent value="security" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <CiaRadarChart data={data.ciaRadar} />
                    <CiaDetailCharts ciaData={data.ciaData} />
                    <RiskMatrixTable data={data.riskMatrix} />
                </div>
            </TabsContent>

            {/* Trends Perspective */}
            <TabsContent value="trends" className="space-y-4">
                <ActivityTimelineChart data={data.activityTimeline} />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <StatusPieChart data={data.statusData} />
                    <CenterStatusChart data={data.centerByStatus} />
                </div>
            </TabsContent>
        </Tabs>
    );
}
