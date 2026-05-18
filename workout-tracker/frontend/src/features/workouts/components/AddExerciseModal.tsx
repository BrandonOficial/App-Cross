import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Search, Plus, Dumbbell } from 'lucide-react';
import { fetchExercises } from '@/lib/api';
import type { Exercise } from '@/lib/api';
import { useWorkoutStore } from '../store/useWorkoutStore';

const MUSCLE_GROUPS = ['Todos', 'Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps', 'Pernas', 'Core'];

interface AddExerciseModalProps {
    onClose: () => void;
}

export function AddExerciseModal({ onClose }: AddExerciseModalProps) {
    const [search, setSearch] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('Todos');
    const addExercise = useWorkoutStore((s) => s.addExercise);
    const routine = useWorkoutStore((s) => s.routine);

    // IDs dos exercícios já na rotina ativa
    const existingIds = new Set(
        (routine?.exercises ?? []).map((e) => e.exercise?.id ?? e.exerciseId)
    );

    const { data: exercises = [], isLoading } = useQuery<Exercise[]>({
        queryKey: ['exercises', selectedGroup, search],
        queryFn: () => fetchExercises({
            muscleGroup: selectedGroup !== 'Todos' ? selectedGroup : undefined,
            search: search || undefined,
        }),
        staleTime: 60 * 1000,
    });

    const handleAdd = (exercise: Exercise) => {
        addExercise({
            id: `active-${exercise.id}-${Date.now()}`,
            exerciseId: exercise.id,
            exercise: { id: exercise.id, name: exercise.name },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Panel */}
            <div
                className="relative z-10 mt-auto w-full max-w-[430px] mx-auto bg-[#141414] rounded-t-3xl border-t border-white/10 max-h-[85vh] flex flex-col animate-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 pb-3 border-b border-white/5">
                    <h2 className="text-lg font-black tracking-tight">Adicionar Exercício</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-5 pt-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar exercício..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary transition-colors placeholder:text-white/20"
                        />
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="px-5 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
                    {MUSCLE_GROUPS.map((group) => (
                        <button
                            key={group}
                            onClick={() => setSelectedGroup(group)}
                            className={`text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                                selectedGroup === group
                                    ? 'bg-primary/15 border-primary/30 text-primary'
                                    : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                            }`}
                        >
                            {group}
                        </button>
                    ))}
                </div>

                {/* Exercise List */}
                <div className="flex-1 overflow-y-auto px-5 pb-5">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : exercises.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="text-sm">Nenhum exercício encontrado.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {exercises.map((ex) => {
                                const isAdded = existingIds.has(ex.id);
                                return (
                                    <div
                                        key={ex.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                            isAdded
                                                ? 'bg-primary/5 border border-primary/20'
                                                : 'bg-white/[0.04] border border-white/5 hover:bg-white/[0.08]'
                                        }`}
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                                            <Dumbbell className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{ex.name}</p>
                                            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">{ex.muscleGroup}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAdd(ex)}
                                            disabled={isAdded}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                                isAdded
                                                    ? 'bg-primary/20 text-primary cursor-default'
                                                    : 'bg-primary text-white hover:scale-110 active:scale-95 shadow-[0_0_10px_rgba(230,0,35,0.3)]'
                                            }`}
                                        >
                                            <Plus className={`w-4 h-4 ${isAdded ? 'rotate-45' : ''}`} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
