import { Outlet } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';

export function MobileLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground pb-20 relative">
            <main className="mx-auto px-5 py-3 max-w-[430px] min-h-screen flex flex-col">
                <Outlet />
            </main>
            <BottomNavigation />
        </div>
    );
}
