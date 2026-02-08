'use client';

import { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarContent } from './sidebar-content';
import { NotificationPopover } from './notification-popover';

export function Header() {
    const [open, setOpen] = useState(false);

    return (
        <header className="flex h-16 items-center justify-between border-b bg-card/50 px-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0">
                        <SidebarContent onLinkClick={() => setOpen(false)} />
                    </SheetContent>
                </Sheet>
                <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
            </div>

            <div className="flex items-center gap-2">
                <NotificationPopover />
                {/* Placeholder for Theme Toggle if implemented */}
            </div>
        </header>
    );
}
