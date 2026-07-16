import { useState, useMemo } from 'react';
import { X, Search, Check } from 'lucide-react';
import type { Exercise } from '@/lib/api';

interface CreateRoutineModalProps {
    onClose: () => void;
    onSubmit: (data: { name: string; exerciseIds: string[] }) => void;
    isLoading: boolean;
    exercises: Exercise[];
}

export function CreateRoutineModal({ onClose, onSubmit, isLoading, exercises }: CreateRoutineModalProps) {
    const [name, setName] = useState('');
    const [search, setSearch] = useState('');
    const [selectedExerciseIds, setSelectedExerciseIds] = useState<Set<string>>(new Set());

    const canSubmit = name.trim().length >= 2 && selectedExerciseIds.size > 0 && !isLoading;

    const filteredExercises = useMemo(() => {
        return exercises.filter((ex) => ex.name.toLowerCase().includes(search.toLowerCase()));
    }, [exercises, search]);

    const toggleExercise = (id: string) => {
        const next = new Set(selectedExerciseIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedExerciseIds(next);
    };

    const handleSubmit = () => {
        if (!canSubmit) return;
        onSubmit({ name: name.trim(), exerciseIds: Array.from(selectedExerciseIds) });
    };

    return (
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
                        <h2 className="text-lg font-bold mb-0.5">Nova Rotina</h2>
                        <p className="text-xs text-muted-foreground">Combine exercícios do seu arsenal</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex-shrink-0 flex items-center justify-center gap-1.5 ${
                            canSubmit
                                ? 'bg-primary text-white shadow-[0_0_15px_rgba(230,0,35,0.3)] hover:shadow-[0_0_25px_rgba(230,0,35,0.5)] active:scale-95'
                                : 'bg-white/5 text-white/20 cursor-not-allowed'
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Criando
                            </>
                        ) : (
                            'Criar'
                        )}
                    </button>
                </div>

                {/* Name Input */}
                <label className="block mb-4 flex-shrink-0">
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">
                        Nome da Rotina
                    </span>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Push Day PPL"
                        className="w-full bg-transparent border-b-2 border-white/10 focus:border-primary py-2 text-base font-medium outline-none placeholder:text-white/20 transition-colors"
                        autoFocus
                    />
                </label>

                {/* Search Exercises */}
                <div className="flex-shrink-0 mb-2">
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">
                        Exercícios ({selectedExerciseIds.size} selecionados)
                    </span>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar exercícios..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Exercise List */}
                <div className="flex-1 overflow-y-auto min-h-0 -mx-2 px-2 mb-4">
                    {filteredExercises.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8">Nenhum exercício encontrado.</p>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {filteredExercises.map((ex) => {
                                const isSelected = selectedExerciseIds.has(ex.id);
                                return (
                                    <button
                                        key={ex.id}
                                        onClick={() => toggleExercise(ex.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-colors text-left ${
                                            isSelected ? 'bg-primary/10 border-primary/20' : 'hover:bg-white/5 border-transparent'
                                        } border`}
                                    >
                                        <div>
                                            <p className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                {ex.name}
                                            </p>
                                            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mt-0.5">
                                                {ex.muscleGroup}
                                            </p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                                            isSelected ? 'bg-primary border-primary' : 'border-white/20'
                                        }`}>
                                            {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
}
