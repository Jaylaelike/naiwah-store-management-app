import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCalendarContext } from '../../calendar-context'
import { addMonths, addWeeks, subMonths, subWeeks, addDays, subDays } from 'date-fns'
import { format } from 'date-fns'

export default function CalendarHeaderDate() {
    const { mode, date, setDate } = useCalendarContext()

    const navigate = (direction: 'prev' | 'next') => {
        if (mode === 'month') {
            setDate(direction === 'prev' ? subMonths(date, 1) : addMonths(date, 1))
        } else if (mode === 'week') {
            setDate(direction === 'prev' ? subWeeks(date, 1) : addWeeks(date, 1))
        } else {
            setDate(direction === 'prev' ? subDays(date, 1) : addDays(date, 1))
        }
    }

    const navigateToday = () => setDate(new Date())

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('prev')}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={navigateToday}>
                Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('next')}>
                <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold text-lg ml-2">
                {format(date, 'MMMM yyyy')}
            </h2>
        </div>
    )
}
