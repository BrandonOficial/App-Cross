import { useWorkoutStore } from '../store/useWorkoutStore';
import { ChevronRight } from 'lucide-react';

export function UpNext() {
    const { routine, currentExerciseIndex, nextExercise } = useWorkoutStore();
    const exercises = routine?.exercises ?? [];
    const nextIndex = currentExerciseIndex + 1;

    if (nextIndex >= exercises.length) return null;

    const nextEx = exercises[nextIndex];

    return (
        <div className="mb-6">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">Próximo</p>
            <button
                onClick={nextExercise}
                aria-label="Ir para o próximo exercício"
                className="w-full flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.07] hover:border-white/10 active:scale-[0.98] transition-all text-left"
            >
                <span className="text-sm font-semibold truncate">{nextEx?.exercise?.name || 'Próximo exercício'}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
        </div>
    );
}

