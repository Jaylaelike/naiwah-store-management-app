'use client';

import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/logo';

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        // Start fading out after 2 seconds
        const fadeTimer = setTimeout(() => {
            setOpacity(0);
        }, 2000);

        // Remove from DOM after transition completes (2s + 500ms transition)
        const unmountTimer = setTimeout(() => {
            setIsVisible(false);
        }, 2500);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(unmountTimer);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 text-white transition-opacity duration-500 ease-in-out"
            style={{ opacity }}
        >
            <div className="flex flex-col items-center animate-in zoom-in-50 duration-700 fade-in-0">
                <div className="bg-white/20 backdrop-blur-md p-6 rounded-3xl shadow-2xl mb-6 border border-white/30">
                    <Logo iconSize={64} textSize="text-4xl" className="scale-150 text-white" showText={true} />
                </div>

                <div className="mt-8 flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-white animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-3 w-3 rounded-full bg-white animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-3 w-3 rounded-full bg-white animate-bounce"></div>
                </div>
            </div>
        </div>
    );
}
