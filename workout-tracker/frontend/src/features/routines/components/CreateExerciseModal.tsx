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
                className="relative z-10 w-full max-w-[430px] bg-[#1a1a1a] rounded-t-3xl border-t border-white/10 animate-in flex flex-col"
                style={{ maxHeight: '85dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header — handle + título + botão de criar */}
                <div className="flex-shrink-0 px-6 pt-5 pb-4">
                    {/* Handle */}
                    <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

                    {/* Linha: título à esquerda, botão à direita */}
                    <div className="flex items-center justify-between pr-10">
                        <div>
                            <h2 className="text-lg font-bold mb-0.5">Novo Exercício</h2>
                            <p className="text-xs text-muted-foreground">Adicione ao seu arsenal</p>
                        </div>

                        {/* Botão CRIAR sempre visível no header */}
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex-shrink-0 flex items-center gap-1.5 ${
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

                    {/* Botão fechar (X) */}
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Corpo scrollável */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-20">
                    {/* Nome */}
                    <label className="block mb-5">
                        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
                            Nome do Exercício
                        </span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Ex: Rosca Bíceps Concentrada"
                            className="w-full bg-transparent border-b-2 border-white/10 focus:border-primary py-2.5 text-base font-medium outline-none placeholder:text-white/20 transition-colors"
                            autoFocus
                        />
                    </label>

                    {/* Grupo Muscular */}
                    <div>
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
                </div>
            </div>
        </div>
    );
}
