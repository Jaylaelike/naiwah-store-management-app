import { getCalendarEvents } from '@/lib/actions/calendar'
import CalendarClientWrapper from './calendar-client-wrapper'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
    const events = await getCalendarEvents()

    const serializedEvents = events.map((event) => ({
        ...event,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
    }))

    return <CalendarClientWrapper initialEvents={serializedEvents} />
}
