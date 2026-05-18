import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '@/lib/api';
import type { DashboardSummary } from '@/lib/api';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABELS: Record<string, string> = { MON: 'SEG', TUE: 'TER', WED: 'QUA', THU: 'QUI', FRI: 'SEX', SAT: 'SAB', SUN: 'DOM' };

export function WeeklyProgress() {
    const { data: summary } = useQuery<DashboardSummary>({
        queryKey: ['dashboard-summary'],
        queryFn: () => fetchDashboardSummary(),
        staleTime: 30 * 1000,
    });

    const weeklyVolume = summary?.weeklyVolume ?? 0;
    const dailyVolumes = summary?.dailyVolumes ?? {};

    // Converte para array ordenada por dia da semana
    const weeklyData = DAYS.map((day) => ({
        day,
        volume: dailyVolumes[day] ?? 0,
    }));

    const maxVolume = Math.max(...weeklyData.map((d) => d.volume), 1);
    const todayIndex = new Date().getDay();
    // getDay() retorna 0=SUN. DAYS array: 0=MON. Ajuste:
    const currentDay = DAYS[todayIndex === 0 ? 6 : todayIndex - 1];

    const formattedVolume = weeklyVolume >= 1000
        ? `${(weeklyVolume / 1000).toFixed(weeklyVolume >= 10000 ? 1 : 0).replace(/\.0$/, '')}k`
        : weeklyVolume.toLocaleString('en-US');

    return (
        <div className="glass-card p-5">
            {/* Header Row */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1">Progresso Semanal</p>
                    <h3 className="text-xl font-bold">Volume de Treino</h3>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-extrabold text-primary leading-none">{formattedVolume}</p>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-1">KG Levantados</p>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-16 mb-3">
                {weeklyData.map((item) => {
                    const barHeight = item.volume > 0 ? Math.max((item.volume / maxVolume) * 100, 15) : 8;
                    const isActive = item.day === currentDay;

                    return (
                        <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className={`w-full rounded-md transition-all duration-300 ${
                                    isActive
                                        ? 'bg-primary shadow-[0_0_12px_rgba(230,0,35,0.5)]'
                                        : item.volume > 0 ? 'bg-white/20' : 'bg-white/5'
                                }`}
                                style={{ height: `${barHeight}%` }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Day Labels */}
            <div className="flex justify-between gap-2">
                {DAYS.map((day) => (
                    <span
                        key={day}
                        className={`flex-1 text-center text-[9px] font-bold tracking-wider ${
                            day === currentDay
                                ? 'text-primary'
                                : 'text-muted-foreground/60'
                        }`}
                    >
                        {DAY_LABELS[day]}
                    </span>
                ))}
            </div>
        </div>
    );
}
