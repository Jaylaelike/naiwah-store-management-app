"use client"

import * as React from "react"
import { VariantProps } from "class-variance-authority"
import { toggleVariants } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"

const ToggleGroupContext = React.createContext<
    VariantProps<typeof toggleVariants> & {
        value?: string | string[]
        onValueChange?: (value: string) => void
        type?: "single" | "multiple"
    }
>({
    size: "default",
    variant: "default",
})

const ToggleGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof toggleVariants> & {
        type: "single" | "multiple"
        value?: string | string[]
        onValueChange?: (value: any) => void
    }
>(({ className, variant, size, children, type, value, onValueChange, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center justify-center gap-1", className)}
        {...props}
    >
        <ToggleGroupContext.Provider value={{ variant, size, type, value, onValueChange }}>
            {children}
        </ToggleGroupContext.Provider>
    </div>
))

ToggleGroup.displayName = "ToggleGroup"

const ToggleGroupItem = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof toggleVariants> & {
        value: string
    }
>(({ className, children, value, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext)
    const isSelected = context.type === "single"
        ? context.value === value
        : (Array.isArray(context.value) && context.value.includes(value))

    return (
        <button
            ref={ref}
            type="button"
            className={cn(
                toggleVariants({
                    variant: context.variant || "default",
                    size: context.size || "default",
                }),
                className
            )}
            aria-pressed={isSelected}
            data-state={isSelected ? "on" : "off"}
            onClick={() => {
                if (context.onValueChange) {
                    context.onValueChange(value)
                }
            }}
            {...props}
        >
            {children}
        </button>
    )
})

ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
