import { cn } from '@/lib/utils'

export default function CalendarHeaderActions({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) {
    return (
        <div className={cn('flex items-center gap-2', className)}>{children}</div>
    )
}
