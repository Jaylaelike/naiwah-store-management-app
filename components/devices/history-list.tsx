

import { getDeviceHistory } from '@/lib/actions/history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Wrench, ArrowRightLeft, History } from 'lucide-react';

interface HistoryListProps {
    deviceId: number;
}

export async function HistoryList({ deviceId }: HistoryListProps) {
    const history = await getDeviceHistory(deviceId);

    const repairs = history.filter((item) => item.type === 'Repair');
    const audits = history.filter((item) => item.type === 'Update' || item.type === 'Transfer');

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>ประวัติการซ่อม (Repair History)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {repairs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">ไม่พบประวัติการซ่อม (No repair history found).</p>
                        ) : (
                            repairs.map((item) => (
                                <div key={`repair-${item.id}`} className="flex">
                                    <div className="mr-4 flex flex-col items-center">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-yellow-100 text-yellow-600">
                                            <Wrench className="h-4 w-4" />
                                        </div>
                                        <div className="h-full w-px bg-border" />
                                    </div>
                                    <div className="pb-8 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium leading-none">Repair</p>
                                            <span className="text-xs text-muted-foreground">{format(item.date, 'PPP p')}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                        <div className="flex items-center pt-2">
                                            <Avatar className="h-6 w-6 mr-2">
                                                <AvatarImage src={item.user?.image || ''} />
                                                <AvatarFallback>{item.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-muted-foreground">
                                                by {item.user?.name || 'Unknown User'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>ประวัติการแก้ไขข้อมูล (Edit History)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {audits.length === 0 ? (
                            <p className="text-sm text-muted-foreground">ไม่พบประวัติการแก้ไข (No edit history found).</p>
                        ) : (
                            audits.map((item) => (
                                <div key={`${item.type}-${item.id}`} className="flex">
                                    <div className="mr-4 flex flex-col items-center">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${item.type === 'Transfer' ? 'bg-blue-100 text-blue-600' :
                                            'bg-gray-100 text-gray-600'
                                            }`}>
                                            {item.type === 'Transfer' ? <ArrowRightLeft className="h-4 w-4" /> :
                                                <History className="h-4 w-4" />}
                                        </div>
                                        <div className="h-full w-px bg-border" />
                                    </div>
                                    <div className="pb-8 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium leading-none">{item.type}</p>
                                            <span className="text-xs text-muted-foreground">{format(item.date, 'PPP p')}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                        {item.type === 'Transfer' && item.details.from && (
                                            <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                                                Moved from: <span className="font-medium">{item.details.from}</span>
                                            </div>
                                        )}
                                        {item.type === 'Update' && item.details && (
                                            <div className="mt-2 text-xs bg-muted p-2 rounded space-y-1">
                                                {Object.entries(item.details).map(([key, diff]: [string, any]) => (
                                                    <div key={key} className="grid grid-cols-[100px_1fr] gap-2">
                                                        <span className="font-medium text-muted-foreground capitalize">{key}:</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="line-through text-red-500/70">{String(diff.old || '(empty)')}</span>
                                                            <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-green-600 font-medium">{String(diff.new || '(empty)')}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex items-center pt-2">
                                            <Avatar className="h-6 w-6 mr-2">
                                                <AvatarImage src={item.user?.image || ''} />
                                                <AvatarFallback>{item.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-muted-foreground">
                                                by {item.user?.name || 'Unknown User'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
