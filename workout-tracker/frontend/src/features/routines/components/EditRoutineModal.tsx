import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, ChevronUp, ChevronDown, Trash2, Plus, Dumbbell, Search } from 'lucide-react';
import { updateRoutine, fetchExercises } from '@/lib/api';
import type { Routine, Exercise } from '@/lib/api';
import { toast } from 'sonner';

interface EditRoutineModalProps {
    routine: Routine;
    onClose: () => void;
}

interface EditableExercise {
    exerciseId: string;
    name: string;
    muscleGroup: string;
    order: number;
}

export function EditRoutineModal({ routine, onClose }: EditRoutineModalProps) {
    const queryClient = useQueryClient();
    const [name, setName] = useState(routine.name);
    const [exercises, setExercises] = useState<EditableExercise[]>(
        routine.exercises.map((re, i) => ({
            exerciseId: re.exerciseId,
            name: re.exercise.name,
            muscleGroup: re.exercise.muscleGroup,
            order: i + 1,
        }))
    );
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: allExercises = [] } = useQuery<Exercise[]>({
        queryKey: ['exercises-all'],
        queryFn: () => fetchExercises(),
        staleTime: 60 * 1000,
        enabled: showAddPanel,
    });

    const existingIds = new Set(exercises.map((e) => e.exerciseId));

    const filteredExercises = allExercises.filter(
        (ex) => !existingIds.has(ex.id) && (
            !searchTerm || ex.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const mutation = useMutation({
        mutationFn: () =>
            updateRoutine(routine.id, {
                name,
                exercises: exercises.map((e, i) => ({
                    exerciseId: e.exerciseId,
                    order: i + 1,
                })),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] });
            toast.success('Rotina atualizada com sucesso!');
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erro ao atualizar rotina.');
        },
    });

    const removeExercise = (exerciseId: string) => {
        setExercises((prev) => prev.filter((e) => e.exerciseId !== exerciseId));
    };

    const addExercise = (ex: Exercise) => {
        setExercises((prev) => [
            ...prev,
            {
                exerciseId: ex.id,
                name: ex.name,
                muscleGroup: ex.muscleGroup,
                order: prev.length + 1,
            },
        ]);
    };

    const moveUp = (index: number) => {
        if (index <= 0) return;
        setExercises((prev) => {
            const arr = [...prev];
            [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
            return arr;
        });
    };

    const moveDown = (index: number) => {
        if (index >= exercises.length - 1) return;
        setExercises((prev) => {
            const arr = [...prev];
            [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
            return arr;
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Bottom Sheet */}
            <div
                className="relative z-10 w-full max-w-[430px] bg-[#1a1a1a] rounded-t-3xl border-t border-white/10 p-5 pb-6 animate-in flex flex-col"
                style={{ maxHeight: '85dvh', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle */}
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto flex-shrink-0 mb-4" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="flex items-center justify-between flex-shrink-0 mb-4 pr-12">
                    <div>
                        <h2 className="text-lg font-bold mb-0.5">Editar Rotina</h2>
                        <p className="text-xs text-muted-foreground">Altere os dados do seu treino</p>
                    </div>
                    <button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !name.trim() || exercises.length === 0}
                        className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex-shrink-0 flex items-center justify-center gap-1.5 ${
                            !mutation.isPending && name.trim() && exercises.length > 0
                                ? 'bg-primary text-white shadow-[0_0_15px_rgba(230,0,35,0.3)] hover:shadow-[0_0_25px_rgba(230,0,35,0.5)] active:scale-95'
                                : 'bg-white/5 text-white/20 cursor-not-allowed'
                        }`}
                    >
                        {mutation.isPending ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Salvando
                            </>
                        ) : (
                            'Salvar'
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto min-h-0 -mx-2 px-2 flex flex-col gap-4 mb-4">
                    {/* Name */}
                    <label className="block flex-shrink-0">
                        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">
                            Nome da Rotina
                        </span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-white/10 focus:border-primary py-2 text-sm font-bold outline-none transition-colors"
                        />
                    </label>

                    {/* Exercises List */}
                    <div>
                        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
                            Exercícios ({exercises.length})
                        </span>

                        <div className="flex flex-col gap-1.5">
                            {exercises.map((ex, i) => (
                                <div key={ex.exerciseId} className="flex items-center gap-2 bg-white/[0.04] border border-white/5 rounded-xl p-3">
                                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                                        <button
                                            onClick={() => moveUp(i)}
                                            disabled={i === 0}
                                            className="text-muted-foreground hover:text-white disabled:opacity-20 transition-colors"
                                        >
                                            <ChevronUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => moveDown(i)}
                                            disabled={i === exercises.length - 1}
                                            className="text-muted-foreground hover:text-white disabled:opacity-20 transition-colors"
                                        >
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{ex.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{ex.muscleGroup}</p>
                                    </div>
                                    <button
                                        onClick={() => removeExercise(ex.exerciseId)}
                                        className="w-7 h-7 rounded-full hover:bg-red-500/10 flex items-center justify-center transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Exercise */}
                        {!showAddPanel ? (
                            <button
                                onClick={() => setShowAddPanel(true)}
                                className="w-full mt-2 py-2.5 text-sm font-bold tracking-wider uppercase text-muted-foreground bg-white/[0.03] border border-dashed border-white/10 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Adicionar
                            </button>
                        ) : (
                            <div className="mt-2 border border-white/10 rounded-xl p-3">
                                <div className="relative mb-2">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar..."
                                        className="w-full bg-white/5 rounded-lg py-2 pl-8 pr-3 text-xs outline-none focus:bg-white/[0.08] transition-colors placeholder:text-white/20"
                                        autoFocus
                                    />
                                </div>
                                <div className="max-h-[150px] overflow-y-auto flex flex-col gap-1">
                                    {filteredExercises.slice(0, 10).map((ex) => (
                                        <button
                                            key={ex.id}
                                            onClick={() => addExercise(ex)}
                                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-left"
                                        >
                                            <Dumbbell className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                            <span className="text-xs font-bold truncate">{ex.name}</span>
                                            <span className="text-[9px] text-muted-foreground ml-auto">{ex.muscleGroup}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 pt-3">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl border border-white/10 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
