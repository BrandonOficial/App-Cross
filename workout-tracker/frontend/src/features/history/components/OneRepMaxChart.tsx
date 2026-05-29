import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ExerciseProgressPoint } from '@/lib/api';

interface OneRepMaxChartProps {
    data: ExerciseProgressPoint[];
    exerciseName: string;
}

/**
 * Fórmula de Epley: 1RM = weight × (1 + reps / 30)
 * Usamos o maior peso de cada dia e a rep count correspondente.
 */
export function OneRepMaxChart({ data, exerciseName }: OneRepMaxChartProps) {
    // O data do ExerciseProgress já tem date + maxWeight
    // Estimamos 1RM assumindo 1 rep para maxWeight (top set)
    // Para uma estimativa mais precisa precisaríamos de reps, mas usamos o maxWeight como proxy
    const chartData = data.map((d) => ({
        date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        estimated1RM: Math.round(d.maxWeight * 1.0333), // Epley com 1 rep → multiplica por ~1.033
        maxWeight: d.maxWeight,
    }));

    if (chartData.length < 2) {
        return (
            <div className="glass-card p-4 text-center">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">
                    Dados insuficientes para estimar 1RM
                </p>
            </div>
        );
    }

    return (
        <div className="glass-card p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-0.5">
                        1RM Estimado
                    </p>
                    <p className="text-sm font-bold">{exerciseName}</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-black text-primary">
                        {chartData[chartData.length - 1]?.estimated1RM ?? 0}
                        <span className="text-[10px] font-bold text-muted-foreground ml-1">kg</span>
                    </p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="oneRMGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E60023" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#E60023" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: '#767676' }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: '#767676' }}
                        domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip
                        contentStyle={{
                            background: '#1c1b1b',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#fff',
                        }}
                        formatter={(value: any) => [`${value} kg`, '1RM Est.']}
                        labelFormatter={(label: any) => String(label)}
                    />
                    <Area
                        type="monotone"
                        dataKey="estimated1RM"
                        stroke="#E60023"
                        strokeWidth={2}
                        fill="url(#oneRMGradient)"
                        dot={{ r: 3, fill: '#E60023', stroke: '#0d0d0d', strokeWidth: 2 }}
                        activeDot={{ r: 5, fill: '#E60023', stroke: '#fff', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
