import { Dumbbell, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkoutSessionCardProps {
    session: {
        id: string;
        dateLabel: string;
        name: string;
        duration: string;
        volume: string;
        records: number;
        tags: string[];
        hasBackground?: boolean;
    };
}

export function WorkoutSessionCard({ session }: WorkoutSessionCardProps) {
    const navigate = useNavigate();
    
    return (
        <div 
            onClick={() => navigate(`/app/history/${session.id}`)}
            className={`glass-card overflow-hidden mb-4 relative cursor-pointer hover:bg-white/[0.1] transition-colors ${session.hasBackground ? 'min-h-[180px]' : ''}`}
        >
            {/* Optional Background Image for featured sessions */}
            {session.hasBackground && (
                <>
                    <img
                        src="/exercise-squat.png"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
                </>
            )}

            <div className="relative z-10 p-5">
                {/* Date Label */}
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    {session.dateLabel}
                </p>

                {/* Title Row */}
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold leading-tight pr-4">{session.name}</h3>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="w-4 h-4 text-primary" />
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-center">
                        <p className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground mb-0.5">Duração</p>
                        <p className="text-sm font-bold">{session.duration}</p>
                    </div>
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-center">
                        <p className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground mb-0.5">Volume</p>
                        <p className="text-sm font-bold">{session.volume}</p>
                    </div>
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-center">
                        <p className="text-[9px] font-bold tracking-wider uppercase text-muted-foreground mb-0.5">Recordes</p>
                        <p className={`text-sm font-bold ${session.records > 0 ? 'text-primary' : ''}`}>{session.records}</p>
                    </div>
                </div>

                {/* Tags */}
                {session.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                        {session.tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-[9px] font-bold tracking-wider uppercase bg-white/[0.04] border border-white/[0.06] rounded-full px-3 py-1 text-muted-foreground"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
