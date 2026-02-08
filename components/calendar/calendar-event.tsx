import { CalendarEvent as CalendarEventType } from './calendar-types'
import { useCalendarContext } from './calendar-context'
import { format, isSameDay, isSameMonth } from 'date-fns'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface EventPosition {
    left: string
    width: string
    top: string
    height: string
}

function getOverlappingEvents(
    currentEvent: CalendarEventType,
    events: CalendarEventType[]
): CalendarEventType[] {
    return events.filter((event) => {
        if (event.id === currentEvent.id) return false
        return (
            currentEvent.start < event.end &&
            currentEvent.end > event.start &&
            isSameDay(currentEvent.start, event.start)
        )
    })
}

function calculateEventPosition(
    event: CalendarEventType,
    allEvents: CalendarEventType[]
): EventPosition {
    const overlappingEvents = getOverlappingEvents(event, allEvents)
    const group = [event, ...overlappingEvents].sort(
        (a, b) => a.start.getTime() - b.start.getTime()
    )
    const position = group.indexOf(event)
    const width = `${100 / (overlappingEvents.length + 1)}%`
    const left = `${(position * 100) / (overlappingEvents.length + 1)}%`

    const startHour = event.start.getHours()
    const startMinutes = event.start.getMinutes()

    let endHour = event.end.getHours()
    let endMinutes = event.end.getMinutes()

    if (!isSameDay(event.start, event.end)) {
        endHour = 23
        endMinutes = 59
    }

    const topPosition = startHour * 128 + (startMinutes / 60) * 128
    const duration = endHour * 60 + endMinutes - (startHour * 60 + startMinutes)
    const height = (duration / 60) * 128

    return {
        left,
        width,
        top: `${topPosition}px`,
        height: `${height}px`,
    }
}

export default function CalendarEvent({
    event,
    month = false,
    className,
}: {
    event: CalendarEventType
    month?: boolean
    className?: string
}) {
    const { events, date } = useCalendarContext()
    const router = useRouter()

    // Only calculate position for non-month views
    const style = month ? {} : calculateEventPosition(event, events)

    const handleEventClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (event.deviceId) {
            router.push(`/dashboard/devices/${event.deviceId}`)
        }
    }

    return (
        <div
            className={cn(
                `px-3 py-1.5 rounded-md truncate cursor-pointer transition-all duration-300 bg-${event.color}-500/10 hover:bg-${event.color}-500/20 border border-${event.color}-500`,
                !month && 'absolute',
                className
            )}
            style={style}
            onClick={handleEventClick}
        >
            <div
                className={cn(
                    `flex flex-col w-full text-${event.color}-500`,
                    month && 'flex-row items-center justify-between'
                )}
            >
                <p className={cn('font-bold truncate', month && 'text-xs')}>
                    {event.title}
                </p>
                <p className={cn('text-sm', month && 'text-xs')}>
                    <span>{format(event.start, 'h:mm a')}</span>
                    <span className={cn('mx-1', month && 'hidden')}>-</span>
                    <span className={cn(month && 'hidden')}>
                        {format(event.end, 'h:mm a')}
                    </span>
                </p>
            </div>
        </div>
    )
}

