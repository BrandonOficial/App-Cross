import { Zap, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '@/features/workouts/store/useWorkoutStore';
import { startWorkoutSession } from '@/lib/api';
import { useState } from 'react';

export function QuickStartBanner() {
    const navigate = useNavigate();
    const startWorkout = useWorkoutStore((s) => s.startWorkout);
    const [isLoading, setIsLoading] = useState(false);

    const handleQuickStart = async () => {
        try {
            setIsLoading(true);
            const session = await startWorkoutSession();

            // Inicia treino livre SEM exercícios predefinidos.
            // O user usa o botão "+" no WorkoutTopBar para adicionar exercícios do banco.
            const freeRoutine = {
                name: 'Treino Livre',
                exercises: [],
            };

            startWorkout(session.id, freeRoutine);
            navigate('/app/workout/active');
        } catch {
            // Fallback local se o backend estiver offline
            const localId = `local-${Date.now()}`;
            const freeRoutine = {
                name: 'Treino Livre',
                exercises: [],
            };
            startWorkout(localId, freeRoutine);
            navigate('/app/workout/active');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleQuickStart}
            disabled={isLoading}
            className="w-full glass-card p-5 mb-5 flex items-center gap-4 group hover:bg-white/[0.07] transition-all active:scale-[0.98]"
        >
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/25 transition-colors shadow-[0_0_20px_rgba(230,0,35,0.2)]">
                <Zap className="w-7 h-7 text-primary" />
            </div>

            {/* Text */}
            <div className="flex-1 text-left">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-0.5">Quick Start</p>
                <h3 className="text-lg font-bold">Iniciar Treino Livre</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Adicione exercícios na hora</p>
            </div>

            {/* Play */}
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(230,0,35,0.4)] group-hover:shadow-[0_0_25px_rgba(230,0,35,0.6)] transition-all">
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                )}
            </div>
        </button>
    );
}
