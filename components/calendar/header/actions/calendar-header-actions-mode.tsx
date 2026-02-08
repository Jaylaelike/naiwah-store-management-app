'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Mode, calendarModes } from '../../calendar-types'
import { useCalendarContext } from '../../calendar-context'
import { calendarModeIconMap } from '../../calendar-mode-icon-map'
import { cn } from '@/lib/utils'

export default function CalendarHeaderActionsMode() {
    const { mode, setMode } = useCalendarContext()

    return (
        <ToggleGroup
            className="flex gap-0 -space-x-px rounded-sm border overflow-hidden shadow-sm shadow-black/5 rtl:space-x-reverse"
            type="single"
            variant="outline"
            value={mode}
            onValueChange={(value) => {
                if (value) setMode(value as Mode)
            }}
        >
            {calendarModes.map((modeValue) => {
                const isSelected = mode === modeValue
                return (
                    <ToggleGroupItem
                        key={modeValue}
                        value={modeValue}
                        className={cn(
                            'rounded-none shadow-none first:rounded-s-sm last:rounded-e-sm focus-visible:z-10 text-xs px-2.5 h-8',
                            isSelected && 'relative z-[2] bg-muted'
                        )}
                    >
                        <span className="flex items-center gap-1">
                            {calendarModeIconMap[modeValue]}
                            {modeValue.charAt(0).toUpperCase() + modeValue.slice(1)}
                        </span>
                    </ToggleGroupItem>
                )
            })}
        </ToggleGroup>
    )
}

