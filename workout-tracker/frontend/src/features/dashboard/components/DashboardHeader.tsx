import { Bell } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function DashboardHeader() {
    const user = useAuthStore((s) => s.user);
    const initial = user?.name?.charAt(0).toUpperCase() ?? '?';
    const firstName = user?.name?.split(' ')[0] ?? 'Atleta';

    return (
        <header className="flex items-center justify-between pt-2 pb-4">
            {/* Avatar com inicial */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(230,0,35,0.15)]">
                    <span className="text-sm font-extrabold text-primary">{initial}</span>
                </div>
                <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Bem-vindo</p>
                    <p className="text-base font-bold leading-tight">{firstName}</p>
                </div>
            </div>

            {/* Brand */}
            <h1 className="text-lg font-extrabold tracking-[0.15em] text-primary uppercase" style={{ fontFamily: 'Lexend, sans-serif' }}>
                VELOCITY
            </h1>

            {/* Notification Bell */}
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors relative">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
            </button>
        </header>
    );
}
