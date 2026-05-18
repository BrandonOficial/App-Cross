interface StreakRingProps {
    current: number;
    goal?: number;
}

export function StreakRing({ current, goal = 7 }: StreakRingProps) {
    const radius = 52;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(current / goal, 1);
    const offset = circumference * (1 - progress);

    return (
        <div className="glass-card p-5 flex items-center gap-5">
            {/* SVG Ring */}
            <div className="relative w-[130px] h-[130px] flex-shrink-0">
                <svg width="130" height="130" viewBox="0 0 130 130" className="transform -rotate-90">
                    {/* Track */}
                    <circle
                        cx="65" cy="65" r={radius}
                        fill="none"
                        stroke="#767676"
                        strokeWidth={strokeWidth}
                        strokeOpacity={0.2}
                    />
                    {/* Active */}
                    <circle
                        cx="65" cy="65" r={radius}
                        fill="none"
                        stroke="#E60023"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(230,0,35,0.5))' }}
                    />
                </svg>
                {/* Center number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold tracking-tighter leading-none">{current}</span>
                    <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-1">dias</span>
                </div>
            </div>

            {/* Text */}
            <div className="flex-1">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-1">Streak Semanal</p>
                <p className="text-sm font-bold text-white/90">
                    {current >= goal
                        ? '🔥 Meta atingida!'
                        : `Faltam ${goal - current} ${goal - current === 1 ? 'dia' : 'dias'}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Treine {goal} dias por semana para manter a consistência.
                </p>
            </div>
        </div>
    );
}
