import { ChevronRight, Dumbbell, Weight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestSession } from '@/lib/api';
import type { LatestSession } from '@/lib/api';

export function LastSession() {
    const navigate = useNavigate();

    const { data: session } = useQuery<LatestSession | null>({
        queryKey: ['latest-session'],
        queryFn: () => fetchLatestSession(),
        staleTime: 30 * 1000,
    });

    if (!session) {
        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Last Session</h2>
                    <button
                        onClick={() => navigate('/app/history')}
                        className="text-xs font-bold tracking-[0.15em] uppercase text-primary hover:text-primary/80 transition-colors"
                    >
                        History
                    </button>
                </div>
                <div className="glass-card p-6 text-center">
                    <p className="text-sm text-muted-foreground">Nenhum treino registrado ainda.</p>
                </div>
            </div>
        );
    }

    const name = session.routine?.name ?? 'Treino Livre';
    const volume = session.totalVolume >= 1000
        ? `${(session.totalVolume / 1000).toFixed(1)}k kg`
        : `${session.totalVolume.toLocaleString('en-US')} kg`;
    const duration = session.durationMinutes
        ? `${session.durationMinutes} min`
        : 'Em andamento';

    const time = new Date(session.startTime).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    // Extrai muscle groups únicos
    const muscleGroups = [...new Set(
        (session.sets ?? [])
            .map(s => s.exercise?.muscleGroup)
            .filter(Boolean) as string[]
    )];
    const tags = muscleGroups.length > 0 ? muscleGroups : ['Geral'];

    return (
        <div>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Last Session</h2>
                <button
                    onClick={() => navigate('/app/history')}
                    className="text-xs font-bold tracking-[0.15em] uppercase text-primary hover:text-primary/80 transition-colors"
                >
                    History
                </button>
            </div>

            {/* Session Card */}
            <div className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.10] transition-colors" onClick={() => navigate('/app/history')}>
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-6 h-6 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-1">
                        {tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] font-bold tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded-full text-muted-foreground">
                                {tag}
                            </span>
                        ))}
                        <span className="text-[10px] font-bold tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded-full text-muted-foreground">
                            {duration}
                        </span>
                    </div>
                    <h3 className="text-base font-bold truncate">{name}</h3>
                    {/* Metrics */}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Weight className="w-3 h-3" /> {volume}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {time}
                        </span>
                    </div>
                </div>

                {/* Chevron */}
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </div>
        </div>
    );
}
