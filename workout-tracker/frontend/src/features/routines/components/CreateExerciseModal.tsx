import { useState } from 'react';
import { X } from 'lucide-react';

const MUSCLE_GROUPS = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Cardio'];

interface CreateExerciseModalProps {
    onClose: () => void;
    onSubmit: (data: { name: string; muscleGroup: string }) => void;
    isLoading: boolean;
}

export function CreateExerciseModal({ onClose, onSubmit, isLoading }: CreateExerciseModalProps) {
    const [name, setName] = useState('');
    const [muscleGroup, setMuscleGroup] = useState('');

    const canSubmit = name.trim().length >= 2 && muscleGroup.length > 0 && !isLoading;

    const handleSubmit = () => {
        if (!canSubmit) return;
        onSubmit({ name: name.trim(), muscleGroup });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Bottom Sheet */}
            <div
                className="relative z-10 w-full max-w-[430px] bg-[#1a1a1a] rounded-t-3xl border-t border-white/10 p-6 pb-8 animate-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle */}
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Title */}
                <h2 className="text-xl font-bold mb-1">Novo Exercício</h2>
                <p className="text-xs text-muted-foreground mb-6">
                    Adicione um exercício personalizado ao seu arsenal.
                </p>

                {/* Name Input */}
                <label className="block mb-4">
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
                        Nome do Exercício
                    </span>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Rosca Bíceps Concentrada"
                        className="w-full bg-transparent border-b-2 border-white/10 focus:border-primary py-2.5 text-base font-medium outline-none placeholder:text-white/20 transition-colors"
                        autoFocus
                    />
                </label>

                {/* Muscle Group Selector */}
                <div className="mb-6">
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-3 block">
                        Grupo Muscular
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {MUSCLE_GROUPS.map((group) => (
                            <button
                                key={group}
                                onClick={() => setMuscleGroup(group)}
                                className={`px-4 py-2 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all ${
                                    muscleGroup === group
                                        ? 'bg-primary text-white shadow-[0_0_12px_rgba(230,0,35,0.3)]'
                                        : 'bg-white/[0.06] text-white/50 border border-white/[0.06] hover:bg-white/[0.1]'
                                }`}
                            >
                                {group}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                        canSubmit
                            ? 'bg-primary text-white shadow-[0_0_20px_rgba(230,0,35,0.4)] hover:shadow-[0_0_30px_rgba(230,0,35,0.6)] active:scale-[0.98]'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Criando...
                        </span>
                    ) : (
                        'Adicionar Exercício'
                    )}
                </button>
            </div>
        </div>
    );
}
