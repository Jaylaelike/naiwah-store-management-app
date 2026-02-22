import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { Logo } from '@/components/ui/logo';
import { ShieldCheck } from 'lucide-react';
import React from 'react';

export const MyComposition = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scale = spring({
        fps,
        frame,
        config: {
            damping: 200,
        },
    });

    const opacity = interpolate(frame, [0, 30], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const textTranslateY = interpolate(frame, [0, 30], [20, 0], {
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white',
            }}
        >
            <div style={{ opacity, transform: `scale(${scale})` }} className="flex flex-col items-center">
                <div className="bg-primary text-white p-8 rounded-3xl mb-6 shadow-xl">
                    <ShieldCheck size={120} strokeWidth={2} />
                </div>
                <h1
                    style={{
                        fontFamily: 'sans-serif',
                        fontSize: '60px',
                        fontWeight: 'bold',
                        color: '#000',
                        transform: `translateY(${textTranslateY}px)`
                    }}
                >
                    NAIWAH<span className="text-primary"> Store</span>
                </h1>
                <p
                    style={{
                        fontFamily: 'sans-serif',
                        fontSize: '24px',
                        color: '#666',
                        marginTop: '1rem',
                        opacity: interpolate(frame, [30, 60], [0, 1], { extrapolateRight: 'clamp' })
                    }}
                >
                    ระบบจัดการคลังอุปกรณ์และทรัพย์สิน
                </p>
            </div>
        </AbsoluteFill>
    );
};
