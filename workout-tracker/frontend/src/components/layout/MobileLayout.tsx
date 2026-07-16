import { Outlet } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';

export function MobileLayout() {
    return (
        <div className="flex flex-col flex-1 bg-background text-foreground" style={{ minHeight: '100dvh' }}>
            {/* Scrollable content area that stops above the bottom nav */}
            <main
                className="flex-1 overflow-y-auto overscroll-none"
                style={{ paddingBottom: 'calc(68px + env(safe-area-inset-bottom))' }}
            >
                <div className="mx-auto px-5 py-3 max-w-[430px] flex flex-col">
                    <Outlet />
                </div>
            </main>
            <BottomNavigation />
        </div>
    );
}
