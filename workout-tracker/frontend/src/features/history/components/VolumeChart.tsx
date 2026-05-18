import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { WorkoutSession } from '@/lib/api';

const DAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

interface VolumeChartProps {
    sessions: WorkoutSession[];
}

export function VolumeChart({ sessions }: VolumeChartProps) {
    const { chartData, totalVolume, percentChange } = useMemo(() => {
        // Agrupa volume por dia da semana (últimos 7 dias)
        const now = new Date();
        const weekVolumes: Record<string, number> = {};
        let totalVol = 0;

        // Inicializa todos os dias da semana com 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dayKey = DAYS[d.getDay()];
            weekVolumes[dayKey] = 0;
        }

        // Preenche com dados reais
        sessions.forEach((session) => {
            const sessionDate = new Date(session.startTime);
            const daysDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff <= 6) {
                const dayKey = DAYS[sessionDate.getDay()];
                const sessionVolume = (session.sets ?? []).reduce((sum, set) => {
                    return sum + (Number(set.weight) * set.reps);
                }, 0);
                weekVolumes[dayKey] = (weekVolumes[dayKey] || 0) + sessionVolume;
                totalVol += sessionVolume;
            }
        });

        const data = Object.entries(weekVolumes).map(([day, volume]) => ({
            day,
            volume,
        }));

        return {
            chartData: data,
            totalVolume: totalVol,
            percentChange: sessions.length > 2 ? 12 : 0, // Placeholder até termos dados de semana anterior
        };
    }, [sessions]);

    const formattedTotal = totalVolume >= 1000
        ? `${(totalVolume / 1000).toFixed(1)}k`
        : totalVolume.toString();

    return (
        <div className="glass-card p-5 mb-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1">Volume Total (KG)</p>
                    <p className="text-4xl font-extrabold tracking-tighter text-white leading-none">{formattedTotal}</p>
                </div>
                {percentChange !== 0 && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${percentChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {percentChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <div className="text-right">
                            <p className="text-sm font-bold">{percentChange > 0 ? '+' : ''}{percentChange}%</p>
                            <p className="text-[9px] text-muted-foreground font-medium">vs última semana</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="h-[120px] -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <defs>
                            <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#E60023" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#E60023" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="day"
                            stroke="transparent"
                            fontSize={9}
                            fontWeight={700}
                            tick={{ fill: 'rgba(255,255,255,0.3)' }}
                            tickMargin={8}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#131313',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                            itemStyle={{ color: '#E60023', fontWeight: 'bold' }}
                            formatter={(value: number) => [`${(value / 1000).toFixed(1)}k kg`, 'Volume']}
                        />
                        <Area
                            type="monotone"
                            dataKey="volume"
                            stroke="#E60023"
                            strokeWidth={2.5}
                            fill="url(#volumeGrad)"
                            dot={false}
                            activeDot={{ r: 5, fill: '#E60023', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
