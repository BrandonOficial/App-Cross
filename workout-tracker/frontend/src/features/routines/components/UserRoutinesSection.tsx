import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Play, Dumbbell, Layers, Trash2, Pencil } from 'lucide-react';
import { fetchRoutines, startWorkoutSession, deleteRoutine } from '@/lib/api';
import type { Routine } from '@/lib/api';
import { useWorkoutStore } from '@/features/workouts/store/useWorkoutStore';
import type { ActiveRoutine } from '@/features/workouts/store/useWorkoutStore';
import { useState } from 'react';
import { EditRoutineModal } from './EditRoutineModal';

export function UserRoutinesSection() {
    const navigate = useNavigate();
    const startWorkout = useWorkoutStore((s) => s.startWorkout);

    const { data: routines = [], isLoading } = useQuery<Routine[]>({
        queryKey: ['routines'],
        queryFn: () => fetchRoutines(),
        staleTime: 60 * 1000,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8 gap-2">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground">Carregando rotinas...</span>
            </div>
        );
    }

    if (routines.length === 0) {
        return (
            <div className="glass-card p-6 text-center mb-4">
                <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm font-bold text-white/70 mb-1">Nenhuma rotina criada</p>
                <p className="text-xs text-muted-foreground">Crie sua primeira rotina para iniciar treinos estruturados.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 mb-2">
            {routines.map((routine) => (
                <RoutineItem key={routine.id} routine={routine} />
            ))}
        </div>
    );
}

function RoutineItem({ routine }: { routine: Routine }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const startWorkout = useWorkoutStore((s) => s.startWorkout);
    const [isStarting, setIsStarting] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    // Extrai grupos musculares únicos
    const muscleGroups = [...new Set(
        routine.exercises.map((re) => re.exercise.muscleGroup).filter(Boolean)
    )];

    const deleteMutation = useMutation({
        mutationFn: () => deleteRoutine(routine.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] });
            setShowConfirmDelete(false);
        },
    });

    const handleStart = async () => {
        try {
            setIsStarting(true);
            const session = await startWorkoutSession(routine.id);

            const activeRoutine: ActiveRoutine = {
                name: routine.name,
                exercises: routine.exercises.map((re) => ({
                    id: re.id,
                    exerciseId: re.exerciseId,
                    exercise: { id: re.exercise.id, name: re.exercise.name },
                })),
            };

            startWorkout(session.id, activeRoutine);
            navigate('/app/workout/active');
        } catch {
            // Fallback local
            const localId = `local-${Date.now()}`;
            const activeRoutine: ActiveRoutine = {
                name: routine.name,
                exercises: routine.exercises.map((re) => ({
                    id: re.id,
                    exerciseId: re.exerciseId,
                    exercise: { id: re.exercise.id, name: re.exercise.name },
                })),
            };
            startWorkout(localId, activeRoutine);
            navigate('/app/workout/active');
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <div className="glass-card overflow-hidden group">
            <div className="p-4 flex items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold leading-tight truncate">{routine.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                            {routine.exercises.length} exercícios
                        </span>
                        {muscleGroups.length > 0 && (
                            <>
                                <span className="text-white/10">•</span>
                                <span className="text-[10px] font-bold tracking-wider uppercase text-primary truncate">
                                    {muscleGroups.slice(0, 2).join(' · ')}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Edit Button */}
                <button
                    onClick={() => setShowEdit(true)}
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Delete Button */}
                <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all"
                >
                    <Trash2 className="w-4 h-4 text-red-400" />
                </button>

                {/* Start Button */}
                <button
                    onClick={handleStart}
                    disabled={isStarting}
                    className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 hover:bg-primary hover:border-primary transition-all group/btn active:scale-90"
                >
                    <Play className="w-4 h-4 text-primary group-hover/btn:text-white fill-current ml-0.5 transition-colors" />
                </button>
            </div>

            {/* Delete Confirmation */}
            {showConfirmDelete && (
                <div className="px-4 pb-4 flex items-center gap-3 animate-in">
                    <p className="text-xs text-red-400 flex-1">Deletar "{routine.name}"?</p>
                    <button
                        onClick={() => setShowConfirmDelete(false)}
                        className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                        className="text-[10px] font-bold uppercase tracking-wider text-white px-3 py-1.5 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                    >
                        {deleteMutation.isPending ? 'Deletando...' : 'Deletar'}
                    </button>
                </div>
            )}

            {/* Edit Modal */}
            {showEdit && (
                <EditRoutineModal routine={routine} onClose={() => setShowEdit(false)} />
            )}
        </div>
    );
}
