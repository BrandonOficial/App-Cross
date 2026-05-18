import { useQuery } from '@tanstack/react-query';
import { fetchSessionsHistory, fetchExerciseProgress } from '@/lib/api';

export function useSessionsHistory() {
    return useQuery({
        queryKey: ['history', 'sessions'],
        queryFn: () => fetchSessionsHistory(),
    });
}

export function useExerciseProgress(exerciseId: string | null) {
    return useQuery({
        queryKey: ['history', 'progress', exerciseId],
        queryFn: () => fetchExerciseProgress(exerciseId!),
        enabled: !!exerciseId, // Só executa se tiver um exerciseId selecionado
    });
}
