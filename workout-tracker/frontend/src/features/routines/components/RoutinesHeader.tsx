import { Bell, User } from 'lucide-react';

export function RoutinesHeader() {
    return (
        <>
            {/* Top Bar — same as Dashboard for consistency */}
            <header className="flex items-center justify-between pt-2 pb-4">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
                    <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-[0.15em] text-primary uppercase">
                    VELOCITY
                </h1>
                <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors relative">
                    <Bell className="w-5 h-5 text-white" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                </button>
            </header>

            {/* Page Title */}
            <h2 className="text-3xl font-black tracking-tight mb-4">O Arsenal</h2>
        </>
    );
}
