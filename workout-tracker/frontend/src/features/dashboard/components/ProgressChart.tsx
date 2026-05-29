import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { fetchExercises } from '@/lib/api';
import { useExerciseProgress } from '@/features/history/hooks/useHistory';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function ProgressChart() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  // Busca lista de exercícios para o dropdown
  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => fetchExercises(),
    staleTime: 5 * 60 * 1000,
  });

  // Define o exercício inicial se nenhum estiver selecionado
  const activeId = selectedExerciseId || (exercises.length > 0 ? exercises[0].id : null);

  // Busca dados de progresso para o exercício selecionado
  const { data: progressData = [], isLoading } = useExerciseProgress(activeId);

  // Formata a data para exibição amigável
  const chartData = progressData.map((d) => ({
    ...d,
    formattedDate: new Date(d.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    }),
  }));

  const activeExerciseName = exercises.find((e) => e.id === activeId)?.name || 'Exercício';

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Progresso de Cargas</h2>
        
        {/* Dropdown customizado simples */}
        {exercises.length > 0 && (
          <select
            value={activeId || ''}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-primary/50 text-foreground max-w-[150px] truncate"
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id} className="bg-neutral-900 text-foreground">
                {ex.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <Card className="glass-card p-4 border-white/5 relative min-h-[220px] flex flex-col justify-between">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Carregando evolução...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-sm font-semibold text-muted-foreground">Sem dados para {activeExerciseName}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Registre séries deste exercício para ver o progresso.</p>
          </div>
        ) : (
          <div className="h-40 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMaxWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary, #E60023)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-primary, #E60023)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="formattedDate"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#767676', fontSize: 9, fontWeight: 600 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#767676', fontSize: 9, fontWeight: 600 }}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#1a1a1a] border border-white/10 px-3 py-2 rounded-xl text-center shadow-xl">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{data.formattedDate}</p>
                          <p className="text-sm font-extrabold text-primary">{payload[0].value} kg</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="maxWeight"
                  stroke="var(--color-primary, #E60023)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMaxWeight)"
                  activeDot={{ r: 6, stroke: '#1a1a1a', strokeWidth: 2, fill: 'var(--color-primary, #E60023)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {chartData.length > 0 && (
          <p className="text-[10px] text-center text-muted-foreground/60 font-bold uppercase tracking-wider mt-2">
            Evolução de Peso Máximo (KG)
          </p>
        )}
      </Card>
    </div>
  );
}
