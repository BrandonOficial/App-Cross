import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';

export function ExerciseHeader() {
    const { routine, currentExerciseIndex, prevExercise, nextExercise } = useWorkoutStore();
    const exercises = routine?.exercises ?? [];
    const current = exercises[currentExerciseIndex];
    const totalExercises = exercises.length;
    const progressPercent = totalExercises > 0 ? ((currentExerciseIndex + 1) / totalExercises) * 100 : 0;

    const hasPrev = currentExerciseIndex > 0;
    const hasNext = currentExerciseIndex < totalExercises - 1;

    // ── Touch Swipe ──
    const touchStartX = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        const threshold = 60;

        if (deltaX > threshold && hasPrev) {
            prevExercise();
        } else if (deltaX < -threshold && hasNext) {
            nextExercise();
        }
        touchStartX.current = null;
    };

    return (
        <div
            className="mb-5"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Exercise Name */}
            <h2 className="text-2xl font-black tracking-tight mb-2">
                {current?.exercise?.name || 'Exercício'}
            </h2>

            {/* Navigation Row */}
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={prevExercise}
                    disabled={!hasPrev}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        hasPrev
                            ? 'bg-white/10 hover:bg-white/20 text-white active:scale-90'
                            : 'bg-white/[0.03] text-white/15 cursor-default'
                    }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-primary">
                    Exercício {currentExerciseIndex + 1} de {totalExercises}
                </p>

                <button
                    onClick={nextExercise}
                    disabled={!hasNext}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        hasNext
                            ? 'bg-white/10 hover:bg-white/20 text-white active:scale-90'
                            : 'bg-white/[0.03] text-white/15 cursor-default'
                    }`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
}
