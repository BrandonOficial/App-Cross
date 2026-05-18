import { useWorkoutStore } from '../store/useWorkoutStore';
import { useState } from 'react';

interface SetTableRowProps {
    exerciseId: string;
    setIndex: number;
    isActive: boolean;
}

const SET_TYPES = [
    { value: 'WARMUP', label: 'A', full: 'Aquecimento', color: 'text-amber-400 border-amber-400/30 bg-amber-400/10' },
    { value: 'FEEDER', label: 'P', full: 'Preparação', color: 'text-sky-400 border-sky-400/30 bg-sky-400/10' },
    { value: 'TOP_SET', label: 'T', full: 'Top Set', color: 'text-primary border-primary/30 bg-primary/10' },
    { value: 'BACK_OFF', label: 'R', full: 'Redução', color: 'text-violet-400 border-violet-400/30 bg-violet-400/10' },
    { value: 'STANDARD', label: 'P', full: 'Padrão', color: 'text-white/60 border-white/10 bg-white/5' },
];

function getTypeConfig(setType: string) {
    return SET_TYPES.find((t) => t.value === setType) ?? SET_TYPES[4];
}

export function SetTableRow({ exerciseId, setIndex, isActive }: SetTableRowProps) {
    const sets = useWorkoutStore((s) => s.exerciseSets[exerciseId] ?? []);
    const updateSetEntry = useWorkoutStore((s) => s.updateSetEntry);
    const entry = sets[setIndex];
    const [showTypePicker, setShowTypePicker] = useState(false);

    if (!entry) return null;

    const typeConfig = getTypeConfig(entry.setType);

    // ── Série já salva ──
    if (entry.isSaved) {
        return (
            <div className="grid grid-cols-12 gap-3 items-center py-3 opacity-50">
                <div className="col-span-1 text-lg font-bold text-muted-foreground">{entry.setNumber}</div>
                <div className="col-span-3">
                    <span className={`text-[10px] font-bold tracking-wider uppercase border rounded-full px-2.5 py-1 ${typeConfig.color}`}>
                        {typeConfig.full}
                    </span>
                </div>
                <div className="col-span-4 text-center text-lg font-bold text-muted-foreground">{entry.weight}</div>
                <div className="col-span-4 text-center text-lg font-bold text-muted-foreground">{entry.reps}</div>
            </div>
        );
    }

    // ── Linha ativa ──
    if (isActive) {
        return (
            <div className="relative">
                <div className="grid grid-cols-12 gap-3 items-center py-3">
                    <div className="col-span-1 text-xl font-bold text-primary">{entry.setNumber}</div>
                    <div className="col-span-3">
                        <button
                            onClick={() => setShowTypePicker(!showTypePicker)}
                            className={`text-[10px] font-bold tracking-wider uppercase border rounded-full px-2.5 py-1 transition-all active:scale-95 ${typeConfig.color}`}
                        >
                            {typeConfig.full}
                        </button>
                    </div>
                    <div className="col-span-4 flex justify-center">
                        <input
                            type="number"
                            value={entry.weight}
                            onChange={(e) => updateSetEntry(exerciseId, setIndex, 'weight', e.target.value)}
                            placeholder="—"
                            className="w-16 h-12 text-center text-xl font-bold bg-transparent border-b-2 border-white/10 focus:border-primary outline-none text-white placeholder:text-muted-foreground/40 transition-colors"
                        />
                    </div>
                    <div className="col-span-4 flex justify-center">
                        <input
                            type="number"
                            value={entry.reps}
                            onChange={(e) => updateSetEntry(exerciseId, setIndex, 'reps', e.target.value)}
                            placeholder="—"
                            className="w-16 h-12 text-center text-xl font-bold bg-transparent border-b-2 border-white/10 focus:border-primary outline-none text-white placeholder:text-muted-foreground/40 transition-colors"
                        />
                    </div>
                </div>

                {/* Pill Type Picker */}
                {showTypePicker && (
                    <div className="flex items-center gap-1.5 pb-3 pt-1 animate-in">
                        {SET_TYPES.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => {
                                    updateSetEntry(exerciseId, setIndex, 'setType', type.value);
                                    setShowTypePicker(false);
                                }}
                                className={`text-[9px] font-bold tracking-wider uppercase rounded-full px-3 py-1.5 border transition-all active:scale-95 ${
                                    entry.setType === type.value
                                        ? type.color + ' shadow-sm'
                                        : 'text-white/30 border-white/5 bg-white/[0.03] hover:bg-white/[0.06]'
                                }`}
                            >
                                {type.full}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ── Linha futura ──
    return (
        <div className="grid grid-cols-12 gap-3 items-center py-3 opacity-40">
            <div className="col-span-1 text-lg font-bold text-muted-foreground">{entry.setNumber}</div>
            <div className="col-span-3">
                <span className={`text-[10px] font-bold tracking-wider uppercase border rounded-full px-2.5 py-1 ${typeConfig.color}`}>
                    {typeConfig.full}
                </span>
            </div>
            <div className="col-span-4 flex justify-center">
                <div className="w-16 h-12 flex items-center justify-center text-lg text-muted-foreground/40 border-b border-white/5">—</div>
            </div>
            <div className="col-span-4 flex justify-center">
                <div className="w-16 h-12 flex items-center justify-center text-lg text-muted-foreground/40 border-b border-white/5">—</div>
            </div>
        </div>
    );
}
