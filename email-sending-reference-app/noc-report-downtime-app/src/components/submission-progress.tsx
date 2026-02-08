"use client"

import { Check, Mail, Database, CircleCheck, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface SubmissionStep {
    id: number
    label: string
    icon: "check" | "mail" | "database" | "completed" | "loader"
}

interface SubmissionProgressProps {
    currentStep: number
    steps: SubmissionStep[]
}

function StepIcon({ step, isCompleted, isCurrent }: { step: SubmissionStep; isCompleted: boolean; isCurrent: boolean }) {
    const isActive = isCompleted || isCurrent

    const iconClasses = cn(
        "flex h-14 w-14 items-center justify-center rounded-full transition-all border-2",
        isActive ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-muted",
        isCurrent && "ring-4 ring-primary/20"
    )

    return (
        <div className={iconClasses}>
            {step.icon === "check" && <Check className="h-6 w-6" strokeWidth={2.5} />}
            {step.icon === "mail" && <Mail className="h-6 w-6" strokeWidth={2} />}
            {step.icon === "database" && <Database className="h-6 w-6" strokeWidth={2} />}
            {step.icon === "completed" && <CircleCheck className="h-6 w-6" strokeWidth={2} />}
            {step.icon === "loader" && <Loader2 className="h-6 w-6 animate-spin" strokeWidth={2} />}
        </div>
    )
}

export function SubmissionProgress({ currentStep, steps }: SubmissionProgressProps) {
    const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100
    const clampedProgress = Math.min(Math.max(progressPercentage, 0), 100);

    const currentStepLabel = steps.find((s) => s.id === currentStep)?.label || "Processing..."

    return (
        <div className="w-full max-w-4xl space-y-8 p-4">

            {/* Steps with icons and connecting lines */}
            <div className="relative mx-4">
                {/* Progress line background */}
                <div className="absolute top-7 left-0 right-0 flex items-center px-2">
                    <div className="h-1.5 w-full rounded-full bg-muted" />
                </div>

                {/* Progress line filled */}
                <div className="absolute top-7 left-0 right-0 flex items-center px-2">
                    <div
                        className="h-1.5 rounded-full bg-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${clampedProgress}%` }}
                    />
                </div>

                {/* Step items */}
                <div className="relative flex items-start justify-between">
                    {steps.map((step) => {
                        const isCompleted = step.id < currentStep
                        const isCurrent = step.id === currentStep

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-3 z-10 bg-background px-2">
                                <StepIcon step={step} isCompleted={isCompleted} isCurrent={isCurrent} />
                                <span
                                    className={cn(
                                        "text-xs sm:text-sm font-medium text-center whitespace-nowrap absolute -bottom-8",
                                        isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* spacer for labels */}
            <div className="h-6"></div>

            {/* Status badge */}
            <div className="flex justify-center pt-4">
                <Badge variant={currentStep === steps.length ? "default" : "outline"} className="px-4 py-1 text-base font-normal">
                    {currentStep === steps.length ? "Completed" : "Processing: " + currentStepLabel}
                </Badge>
            </div>
        </div>
    )
}
