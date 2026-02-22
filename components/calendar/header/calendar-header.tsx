import { cn } from '@/lib/utils'

export default function CalendarHeader({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) {
    return (
        <div
            className={cn(
                'flex items-center justify-between border-b p-4 gap-2',
                className
            )}
        >
            {children}
        </div>
    )
}
