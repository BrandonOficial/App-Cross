import { Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '@/lib/api';
import type { DashboardSummary } from '@/lib/api';

export function StatsOverview() {
    const { data: summary } = useQuery<DashboardSummary>({
        queryKey: ['dashboard-summary'],
        queryFn: () => fetchDashboardSummary(),
        staleTime: 30 * 1000,
    });

    const streak = summary?.currentStreak ?? 0;
    const totalSessions = summary?.totalSessions ?? 0;
    const estimatedCalories = summary?.estimatedCalories ?? 0;

    const formattedCalories = estimatedCalories >= 1000
        ? `${(estimatedCalories / 1000).toFixed(1)}k`
        : estimatedCalories.toLocaleString('en-US');

    return (
        <div className="grid grid-cols-5 gap-3">
            {/* Current Streak — Tall card (spans 2 cols) */}
            <div className="col-span-2 glass-card p-4 flex flex-col justify-between min-h-[160px]">
                <Flame className="w-6 h-6 text-orange-500 mb-2" />
                <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1">Streak Atual</p>
                    <p className="text-5xl font-extrabold tracking-tighter leading-none text-primary">{streak}</p>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-1">Dias</p>
                </div>
            </div>

            {/* Right Column — 2 stacked cards (spans 3 cols) */}
            <div className="col-span-3 flex flex-col gap-3">
                {/* Total Workouts */}
                <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1">Treinos Totais</p>
                    <p className="text-3xl font-extrabold tracking-tighter">{totalSessions}</p>
                </div>

                {/* Active Calories */}
                <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1">Calorias Ativas</p>
                    <p className="text-3xl font-extrabold tracking-tighter">{formattedCalories}</p>
                </div>
            </div>
        </div>
    );
}
