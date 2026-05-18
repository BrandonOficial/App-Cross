import { useQuery } from '@tanstack/react-query';
import { fetchExerciseProgress } from '@/lib/api';
import type { ExerciseProgressPoint } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ExerciseProgressChartProps {
    exerciseId: string;
    exerciseName: string;
}

export function ExerciseProgressChart({ exerciseId, exerciseName }: ExerciseProgressChartProps) {
    const { data: points = [], isLoading } = useQuery<ExerciseProgressPoint[]>({
        queryKey: ['exercise-progress', exerciseId],
        queryFn: () => fetchExerciseProgress(exerciseId),
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <div className="glass-card p-4 flex items-center justify-center h-[180px]">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (points.length < 2) {
        return (
            <div className="glass-card p-4 flex items-center justify-center h-[120px]">
                <p className="text-xs text-muted-foreground text-center">
                    Dados insuficientes para gráfico.
                    <br />Treine {exerciseName} mais vezes!
                </p>
            </div>
        );
    }

    // Formata datas para exibição curta
    const chartData = points.map((p) => ({
        date: new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        maxWeight: p.maxWeight,
    }));

    return (
        <div className="glass-card p-4">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-3">
                Progressão — {exerciseName}
            </p>
            <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <defs>
                        <linearGradient id={`grad-${exerciseId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#E60023" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#E60023" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#767676', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: '#767676', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        domain={['dataMin - 5', 'dataMax + 5']}
                        unit=" kg"
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(26,26,26,0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#fff',
                        }}
                        labelStyle={{ color: '#767676', fontSize: '10px' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="maxWeight"
                        stroke="#E60023"
                        strokeWidth={2}
                        fill={`url(#grad-${exerciseId})`}
                        dot={{ fill: '#E60023', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#E60023', stroke: '#fff', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
