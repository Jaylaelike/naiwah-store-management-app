import { LucideIcon } from 'lucide-react'

export type CalendarProps = {
    events: CalendarEvent[]
    setEvents: (events: CalendarEvent[]) => void
    mode: Mode
    setMode: (mode: Mode) => void
    date: Date
    setDate: (date: Date) => void
    calendarIconIsToday?: boolean // default true
}

export type CalendarContextType = {
    events: CalendarEvent[]
    setEvents: (events: CalendarEvent[]) => void
    mode: Mode
    setMode: (mode: Mode) => void
    date: Date
    setDate: (date: Date) => void
    calendarIconIsToday: boolean
    newEventDialogOpen: boolean
    setNewEventDialogOpen: (open: boolean) => void
    manageEventDialogOpen: boolean
    setManageEventDialogOpen: (open: boolean) => void
    selectedEvent: CalendarEvent | null
    setSelectedEvent: (event: CalendarEvent | null) => void
}

export type CalendarEvent = {
    id: string
    title: string
    start: Date
    end: Date
    color: ColorOption
    deviceId?: number
}

export type Mode = 'day' | 'week' | 'month'

export const calendarModes: Mode[] = ['day', 'week', 'month']

export const colorOptions = [
    { value: 'red', label: 'Red', className: 'bg-red-500' },
    { value: 'orange', label: 'Orange', className: 'bg-orange-500' },
    { value: 'amber', label: 'Amber', className: 'bg-amber-500' },
    { value: 'yellow', label: 'Yellow', className: 'bg-yellow-500' },
    { value: 'lime', label: 'Lime', className: 'bg-lime-500' },
    { value: 'green', label: 'Green', className: 'bg-green-500' },
    { value: 'emerald', label: 'Emerald', className: 'bg-emerald-500' },
    { value: 'teal', label: 'Teal', className: 'bg-teal-500' },
    { value: 'cyan', label: 'Cyan', className: 'bg-cyan-500' },
    { value: 'sky', label: 'Sky', className: 'bg-sky-500' },
    { value: 'blue', label: 'Blue', className: 'bg-blue-500' },
    { value: 'indigo', label: 'Indigo', className: 'bg-indigo-500' },
    { value: 'violet', label: 'Violet', className: 'bg-violet-500' },
    { value: 'purple', label: 'Purple', className: 'bg-purple-500' },
    { value: 'fuchsia', label: 'Fuchsia', className: 'bg-fuchsia-500' },
    { value: 'pink', label: 'Pink', className: 'bg-pink-500' },
    { value: 'rose', label: 'Rose', className: 'bg-rose-500' },
    { value: 'slate', label: 'Slate', className: 'bg-slate-500' },
    { value: 'gray', label: 'Gray', className: 'bg-gray-500' },
    { value: 'zinc', label: 'Zinc', className: 'bg-zinc-500' },
    { value: 'neutral', label: 'Neutral', className: 'bg-neutral-500' },
    { value: 'stone', label: 'Stone', className: 'bg-stone-500' },
] as const

export type ColorOption = (typeof colorOptions)[number]['value']
