import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '@/features/workouts/store/useWorkoutStore';
import type { ActiveRoutine } from '@/features/workouts/store/useWorkoutStore';
import { startWorkoutSession } from '@/lib/api';
import type { Routine } from '@/lib/api';
import { useState } from 'react';

interface RoutineCardProps {
    routine: Routine;
}

export function RoutineCard({ routine }: RoutineCardProps) {
    const navigate = useNavigate();
    const startWorkout = useWorkoutStore((state) => state.startWorkout);
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = async () => {
        try {
            setIsLoading(true);
            const session = await startWorkoutSession(routine.id);

            // Converte Routine da API para ActiveRoutine da Store
            const activeRoutine: ActiveRoutine = {
                name: routine.name,
                exercises: routine.exercises.map((re) => ({
                    id: re.id,
                    exerciseId: re.exerciseId,
                    exercise: {
                        id: re.exercise.id,
                        name: re.exercise.name,
                    },
                })),
            };

            startWorkout(session.id, activeRoutine);
            navigate('/app/workout/active');
        } catch (error) {
            alert("Erro ao iniciar sessão no backend.");
            setIsLoading(false);
        }
    };

    return (
        <Card className="glass-card border-white/5 overflow-hidden group">
            <CardContent className="p-0">
                <div className="p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-xl font-bold mb-1">{routine.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Dumbbell className="w-4 h-4" />
                                <span>{routine.exercises.length} Exercícios</span>
                            </div>
                        </div>
                    </div>

                    <Button 
                        onClick={handleStart}
                        disabled={isLoading}
                        className="w-full font-bold bg-white/10 hover:bg-primary hover:text-white transition-all text-white border-none shadow-none"
                    >
                        <Play className="w-4 h-4 mr-2 fill-current" />
                        {isLoading ? "Iniciando..." : "Iniciar"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
