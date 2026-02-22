'use client'

import { useState } from 'react'
import Calendar from '@/components/calendar/calendar'
import { CalendarEvent, Mode } from '@/components/calendar/calendar-types'

interface RawCalendarEvent extends Omit<CalendarEvent, 'start' | 'end'> {
    start: string
    end: string
}

export default function CalendarClientWrapper({
    initialEvents,
}: {
    initialEvents: RawCalendarEvent[]
}) {
    // Convert string dates to Date objects
    const parsedEvents: CalendarEvent[] = initialEvents.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
    }))

    const [events, setEvents] = useState<CalendarEvent[]>(parsedEvents)
    const [mode, setMode] = useState<Mode>('month')
    const [date, setDate] = useState<Date>(new Date())

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            <Calendar
                events={events}
                setEvents={setEvents}
                mode={mode}
                setMode={setMode}
                date={date}
                setDate={setDate}
            />
        </div>
    )
}
