import { Play, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useWorkoutStore } from '@/features/workouts/store/useWorkoutStore';
import { fetchDashboardSummary } from '@/lib/api';
import type { DashboardSummary } from '@/lib/api';

export function HeroBanner() {
    const navigate = useNavigate();
    const isActive = useWorkoutStore((s) => s.isActive);
    const routine = useWorkoutStore((s) => s.routine);

    const { data: summary } = useQuery<DashboardSummary>({
        queryKey: ['dashboard-summary'],
        queryFn: fetchDashboardSummary,
        staleTime: 60 * 1000,
    });

    const handleClick = () => {
        if (isActive) {
            navigate('/app/workout/active');
        } else {
            navigate('/app/routines');
        }
    };

    const weeklyVolume = summary?.weeklyVolume ?? 0;
    const weeklyLabel = weeklyVolume >= 1000
        ? `${(weeklyVolume / 1000).toFixed(1)}k kg`
        : `${weeklyVolume} kg`;
    const totalSessions = summary?.totalSessions ?? 0;

    return (
        <div className="relative rounded-2xl overflow-hidden h-[200px] group cursor-pointer" onClick={handleClick}>
            {/* Background Gradient Fallback (quando não tem imagem) */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#0d0d0d] to-[#1a0a0e]" />

            {/* Red Glow Effect (top corners) */}
            <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-primary/80 blur-xl" />
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 blur-3xl rounded-full" />
            <div className="absolute top-0 left-0 w-20 h-20 bg-primary/20 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full" />

            {/* Geometric Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 right-4 w-24 h-24 border border-white/20 rounded-full" />
                <div className="absolute top-8 right-8 w-16 h-16 border border-white/10 rounded-full" />
                <div className="absolute bottom-6 left-6 w-20 h-[1px] bg-white/10" />
                <div className="absolute bottom-10 left-6 w-12 h-[1px] bg-white/10" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-5">
                {isActive ? (
                    <>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                            </span>
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-green-400">
                                Treino em andamento
                            </p>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight leading-tight mb-4">
                            {routine?.name ?? 'Treino Ativo'}
                        </h2>
                        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-sm px-5 py-2.5 rounded-full w-fit transition-all shadow-[0_0_20px_rgba(230,0,35,0.4)] hover:shadow-[0_0_30px_rgba(230,0,35,0.6)]">
                            <span>RETOMAR TREINO</span>
                            <Zap className="w-4 h-4 fill-current" />
                        </button>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40">
                                {totalSessions} treinos • {weeklyLabel} esta semana
                            </span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight leading-tight mb-4">
                            Supere seus Limites.
                        </h2>
                        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-sm px-5 py-2.5 rounded-full w-fit transition-all shadow-[0_0_20px_rgba(230,0,35,0.4)] hover:shadow-[0_0_30px_rgba(230,0,35,0.6)]">
                            <span>INICIAR TREINO</span>
                            <Play className="w-4 h-4 fill-current" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
