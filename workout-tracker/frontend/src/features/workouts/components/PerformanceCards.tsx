import { useQuery } from '@tanstack/react-query';
import { fetchSessionsHistory } from '@/lib/api';
import type { WorkoutSession } from '@/lib/api';
import { useWorkoutStore } from '../store/useWorkoutStore';

interface PerformanceCardsProps {
    exerciseId: string;
}

export function PerformanceCards({ exerciseId }: PerformanceCardsProps) {
    // Busca o histórico de sessões do usuário para calcular o volume anterior
    const { data: sessions = [] } = useQuery<WorkoutSession[]>({
        queryKey: ['history-sessions'],
        queryFn: () => fetchSessionsHistory(),
        staleTime: 5 * 60 * 1000,
    });

    const sets = useWorkoutStore((s) => s.exerciseSets[exerciseId] ?? []);

    // 1. Calcula o volume total atual deste exercício (peso * repetições)
    const currentVolume = sets
        .filter((s) => s.weight && s.reps)
        .reduce((sum, s) => sum + (parseFloat(s.weight) * parseInt(s.reps, 10)), 0);

    // 2. Localiza a última sessão concluída no histórico que contém este exercício
    const lastSessionWithExercise = sessions.find((session) =>
        session.sets?.some((set) => set.exerciseId === exerciseId)
    );

    // 3. Calcula o volume total anterior deste exercício na última sessão
    const lastVolume = lastSessionWithExercise
        ? lastSessionWithExercise.sets!
            .filter((set) => set.exerciseId === exerciseId)
            .reduce((sum, set) => sum + (Number(set.weight) * set.reps), 0)
        : 0;

    const formattedLastVolume = lastVolume > 0 
        ? `${lastVolume.toLocaleString('pt-BR')} kg` 
        : '—';

    const formattedCurrentVolume = currentVolume > 0 
        ? `${currentVolume.toLocaleString('pt-BR')} kg` 
        : '0 kg';

    return (
        // Mantemos a simetria de grid de 2 colunas side-by-side no mobile,
        // agora focado inteiramente na métrica de sobrecarga progressiva (Volume Comparator).
        <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Previous Volume */}
            <div className="glass-card p-4 flex flex-col gap-2">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">
                    Volume Anterior
                </p>
                <p className="text-2xl font-extrabold tracking-tight text-white/80">
                    {formattedLastVolume}
                </p>
            </div>

            {/* Current Volume */}
            <div className="glass-card p-4 flex flex-col gap-2">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">
                    Volume Atual
                </p>
                <p className="text-2xl font-extrabold tracking-tight text-primary shadow-primary/20">
                    {formattedCurrentVolume}
                </p>
            </div>
        </div>
    );
}
