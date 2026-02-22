'use client';

import { SidebarContent } from './sidebar-content';

export function Sidebar() {
    return (
        <div className="hidden h-full w-64 md:flex">
            <SidebarContent className="border-r" />
        </div>
    );
}
