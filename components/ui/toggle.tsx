"use client"

import * as React from "react"
import { VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toggleVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
    {
        variants: {
            variant: {
                default: "bg-transparent",
                outline:
                    "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
            },
            size: {
                default: "h-9 px-3",
                sm: "h-8 px-2",
                lg: "h-10 px-3",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Toggle = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof toggleVariants> & {
        pressed?: boolean
        onPressedChange?: (pressed: boolean) => void
    }
>(({ className, variant, size, pressed, onPressedChange, ...props }, ref) => {
    const [internalPressed, setInternalPressed] = React.useState(false)
    const isControlled = pressed !== undefined
    const currentPressed = isControlled ? pressed : internalPressed

    return (
        <button
            ref={ref}
            type="button"
            className={cn(toggleVariants({ variant, size, className }))}
            aria-pressed={currentPressed}
            data-state={currentPressed ? "on" : "off"}
            onClick={() => {
                const newValue = !currentPressed
                if (!isControlled) {
                    setInternalPressed(newValue)
                }
                onPressedChange?.(newValue)
            }}
            {...props}
        />
    )
})

Toggle.displayName = "Toggle"

export { Toggle, toggleVariants }
