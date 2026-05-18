import { NavLink } from 'react-router-dom';
import { Dumbbell, Compass, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNavigation() {
    const navItems = [
        { icon: Dumbbell, label: 'Treino', path: '/app/dashboard' },
        { icon: Compass, label: 'Rotinas', path: '/app/routines' },
        { icon: BarChart3, label: 'Histórico', path: '/app/history' },
        { icon: User, label: 'Perfil', path: '/app/profile' },
    ];

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full bg-[#080808] border-t border-white/5">
            <div className="grid h-[68px] max-w-[430px] grid-cols-4 mx-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "inline-flex flex-col items-center justify-center gap-1 transition-all duration-200",
                                isActive ? "text-primary" : "text-white/30 hover:text-white/50"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {/* Icon with active circle background */}
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                                    isActive 
                                        ? "bg-primary/15 shadow-[0_0_12px_rgba(230,0,35,0.3)]" 
                                        : "bg-transparent"
                                )}>
                                    <item.icon className={cn("w-5 h-5 transition-all", isActive && "scale-110")} />
                                </div>
                                <span className={cn(
                                    "text-[9px] font-semibold tracking-wider uppercase transition-all",
                                    isActive ? "text-primary" : "text-white/30"
                                )}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </div>
    );
}
