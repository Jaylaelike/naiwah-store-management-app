'use client';

import { Player } from '@remotion/player';
import { MyComposition } from '@/remotion/MyComposition';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-5xl p-4">
        <div className="w-full aspect-video shadow-2xl rounded-2xl overflow-hidden mb-10 border-4 border-white/50 ring-1 ring-orange-200/50 backdrop-blur-sm">
          <Player
            component={MyComposition}
            durationInFrames={150}
            compositionWidth={1920}
            compositionHeight={1080}
            fps={30}
            style={{
              width: '100%',
              height: '100%',
            }}
            autoPlay
            loop
          />
        </div>

        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="text-center space-y-2">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Welcome to <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">NAIWAH</span>
            </h2>
            <p className="text-xl text-gray-600 font-medium">Professional Asset Management System</p>
          </div>

          <Button size="lg" className="rounded-full px-10 py-6 text-lg font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 transition-all gap-3 bg-gradient-to-r from-orange-500 to-red-600 border-0" asChild>
            <Link href="/dashboard">
              Enter System <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
