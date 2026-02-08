import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
    className?: string;
    iconSize?: number;
    textSize?: string;
    showText?: boolean;
}

export function Logo({
    className = "",
    iconSize = 32,
    textSize = "text-xl",
    showText = true
}: LogoProps) {
    return (
        <div className={`flex items-center gap-2 font-bold ${className}`}>
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <ShieldCheck size={iconSize} strokeWidth={2.5} />
            </div>
            {showText && (
                <span className={`${textSize} tracking-tight`}>
                    NAIWAH<span className="text-primary"> Store</span>
                </span>
            )}
        </div>
    );
}
