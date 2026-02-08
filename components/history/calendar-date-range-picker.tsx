'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { toast } from 'sonner';

const FormSchema = z.object({
    dateRange: z.object({
        from: z.date(),
        to: z.date(),
    }),
});

export function CalendarDateRangePicker() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Initialize from URL
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            dateRange: {
                from: fromParam ? new Date(fromParam) : undefined,
                to: toParam ? new Date(toParam) : undefined,
            },
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        // Update URL logic
        const params = new URLSearchParams(searchParams);
        if (data.dateRange.from) {
            params.set('from', data.dateRange.from.toISOString());
        }
        if (data.dateRange.to) {
            params.set('to', data.dateRange.to.toISOString());
        }
        router.replace(`${pathname}?${params.toString()}`);

        // Optional: Keep toast for feedback
        toast.success(`Selected date range: From ${format(data.dateRange.from, "PPP")} to ${format(data.dateRange.to, "PPP")}`);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
                <FormField
                    control={form.control}
                    name="dateRange"
                    render={({ field }) => (
                        <FormItem className="flex flex-col space-y-0">
                            {/* Removed FormLabel to fit toolbar or made it visually hidden if needed. 
                 User snippet had FormLabel. I'll keep it but maybe minimal? 
                 Actually user snippet had class "space-y-5" on form and label. 
                 For a toolbar, "space-y-5" is huge. 
                 I will adapt to "flex items-end gap-2" to align button and input.
                 And remove FormLabel or keep it screen-reader only if possible, 
                 but for now I'll remove the explicit label text or keep it very small.
             */}
                            {/* <FormLabel>Select date range</FormLabel> */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                                "w-[260px] justify-start text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                            {field.value?.from ? (
                                                field.value.to ? (
                                                    <>
                                                        {format(field.value.from, "LLL dd, y")} -{" "}
                                                        {format(field.value.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(field.value.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Pick a date range</span>
                                            )}
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={field.value?.from}
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                            {/* FormDescription removed for space */}
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" variant="secondary">Filter</Button>
            </form>
        </Form>
    );
}
