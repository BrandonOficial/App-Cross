import { useWorkoutStore } from '../store/useWorkoutStore';
import { useState, useRef } from 'react';
import { Pencil } from 'lucide-react';

interface SetTableRowProps {
    exerciseId: string;
    setIndex: number;
    isActive: boolean;
}

const SET_TYPES = [
    { value: 'WARMUP',   label: 'A', full: 'Aquecimento', color: 'text-amber-400 border-amber-400/30 bg-amber-400/10' },
    { value: 'FEEDER',   label: 'P', full: 'Preparação',  color: 'text-sky-400 border-sky-400/30 bg-sky-400/10' },
    { value: 'TOP_SET',  label: 'T', full: 'Top Set',     color: 'text-primary border-primary/30 bg-primary/10' },
    { value: 'BACK_OFF', label: 'R', full: 'Redução',     color: 'text-violet-400 border-violet-400/30 bg-violet-400/10' },
    { value: 'STANDARD', label: 'P', full: 'Padrão',      color: 'text-white/60 border-white/10 bg-white/5' },
];

function getTypeConfig(setType: string) {
    return SET_TYPES.find((t) => t.value === setType) ?? SET_TYPES[4];
}

export function SetTableRow({ exerciseId, setIndex, isActive }: SetTableRowProps) {
    const sets             = useWorkoutStore((s) => s.exerciseSets[exerciseId] ?? []);
    const updateSetEntry   = useWorkoutStore((s) => s.updateSetEntry);
    const startEditingSet  = useWorkoutStore((s) => s.startEditingSet);
    const confirmEditSet   = useWorkoutStore((s) => s.confirmEditSet);

    const entry = sets[setIndex];

    const [showTypePicker, setShowTypePicker]   = useState(false);
    const [isInlineEditing, setIsInlineEditing] = useState(false);
    const weightRef = useRef<HTMLInputElement>(null);
    const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    if (!entry) return null;

    const typeConfig = getTypeConfig(entry.setType);

    // ── Entrar em modo de edição inline ──
    const enterInlineEditing = () => {
        // Para séries salvas: cria snapshot no store para manter loggedSets sincronizado
        if (entry.isSaved) startEditingSet(exerciseId, setIndex);
        setIsInlineEditing(true);
        // Foca e seleciona o campo de peso após o re-render.
        // select() garante que digitar substitui o valor (corrige bug de concatenação)
        setTimeout(() => {
            weightRef.current?.focus();
            weightRef.current?.select();
        }, 50);
    };

    // ── Confirmar edição ao sair do foco do container ──
    const commitInlineEdit = () => {
        if (entry.isSaved) {
            // Sincroniza loggedSets com os novos valores editados
            confirmEditSet(exerciseId, setIndex);
        }
        setIsInlineEditing(false);
        setShowTypePicker(false);
    };

    // Delay de 150ms permite navegar entre inputs da mesma linha sem fechar a edição
    const handleContainerBlur  = () => { blurTimer.current = setTimeout(commitInlineEdit, 150); };
    const handleContainerFocus = () => { if (blurTimer.current) clearTimeout(blurTimer.current); };

    // ── Type Picker reutilizável ──
    // preventBlur=true: onMouseDown impede que o blur do container dispare ao clicar no picker
    const TypePicker = ({ preventBlur = false }: { preventBlur?: boolean }) => (
        <div className="flex flex-wrap items-center gap-1.5 pb-2 pt-1 animate-in">
            {SET_TYPES.map((type) => (
                <button
                    key={type.value}
                    onMouseDown={preventBlur ? (e) => e.preventDefault() : undefined}
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
    );

    // ════════════════════════════════════════════════════════════════
    // ── Modo Edição Inline (séries salvas ou futuras ao toque) ──
    // ════════════════════════════════════════════════════════════════
    if (!isActive && isInlineEditing) {
        const isSavedEdit = entry.isSaved;
        const borderColor = isSavedEdit ? 'border-amber-400/30 bg-amber-400/5' : 'border-primary/20 bg-primary/5';
        const inputBorder = isSavedEdit ? 'border-amber-400/40 focus:border-amber-400' : 'border-primary/30 focus:border-primary';
        const numColor    = isSavedEdit ? 'text-amber-400' : 'text-primary';

        return (
            <div
                className="relative"
                onBlur={handleContainerBlur}
                onFocus={handleContainerFocus}
            >
                <div className={`grid grid-cols-12 gap-2 items-center py-3 rounded-lg border ${borderColor} px-1 -mx-1`}>
                    {/* Número */}
                    <div className={`col-span-1 text-xl font-bold ${numColor}`}>{entry.setNumber}</div>

                    {/* Tipo */}
                    <div className="col-span-3 min-w-0">
                        <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setShowTypePicker(!showTypePicker)}
                            className={`text-[10px] font-bold tracking-wider uppercase border rounded-full px-2 py-1 transition-all active:scale-95 leading-none ${typeConfig.color}`}
                        >
                            {typeConfig.full}
                        </button>
                    </div>

                    {/* KG */}
                    <div className="col-span-4 flex justify-center min-w-0">
                        <input
                            ref={weightRef}
                            type="number"
                            inputMode="decimal"
                            value={entry.weight}
                            onChange={(e) => updateSetEntry(exerciseId, setIndex, 'weight', e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="—"
                            style={{ fontSize: '1.25rem' }}
                            className={`w-full max-w-[64px] h-12 text-center font-bold bg-transparent border-b-2 ${inputBorder} outline-none text-white placeholder:text-muted-foreground/40 transition-colors`}
                        />
                    </div>

                    {/* Reps */}
                    <div className="col-span-4 flex justify-center min-w-0">
                        <input
                            type="number"
                            inputMode="numeric"
                            value={entry.reps}
                            onChange={(e) => updateSetEntry(exerciseId, setIndex, 'reps', e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="—"
                            style={{ fontSize: '1.25rem' }}
                            className={`w-full max-w-[64px] h-12 text-center font-bold bg-transparent border-b-2 ${inputBorder} outline-none text-white placeholder:text-muted-foreground/40 transition-colors`}
                        />
                    </div>
                </div>

                {showTypePicker && <TypePicker preventBlur />}

                {/* Dica visual — só para séries salvas */}
                {isSavedEdit && (
                    <p className="text-[10px] text-amber-400/40 text-center pb-1 pt-0.5 tracking-wide">
                        Toque fora para salvar
                    </p>
                )}
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════════
    // ── Série Salva (estática — toque para editar inline) ──
    // ════════════════════════════════════════════════════════════════
    if (entry.isSaved) {
        return (
            <button
                onClick={enterInlineEditing}
                className="w-full text-left group"
                title="Toque para editar esta série"
            >
                <div className="grid grid-cols-12 gap-2 items-center py-3 opacity-50 group-hover:opacity-70 transition-opacity">
                    <div className="col-span-1 text-lg font-bold text-muted-foreground">{entry.setNumber}</div>
                    <div className="col-span-3 min-w-0">
                        <span className={`text-[10px] font-bold tracking-wider uppercase border rounded-full px-2 py-1 leading-none ${typeConfig.color}`}>
                            {typeConfig.full}
                        </span>
                    </div>
                    <div className="col-span-4 text-center text-lg font-bold text-muted-foreground">{entry.weight}</div>
                    <div className="col-span-3 text-center text-lg font-bold text-muted-foreground">{entry.reps}</div>
                    <div className="col-span-1 flex justify-end">
                        <Pencil className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors" />
                    </div>
                </div>
            </button>
        );
    }

    // ════════════════════════════════════════════════════════════════
    // ── Linha Ativa (input direto, sem modo de edição separado) ──
    // ════════════════════════════════════════════════════════════════
    if (isActive) {
        return (
            <div className="relative">
                <div className="grid grid-cols-12 gap-2 items-center py-3">
                    <div className="col-span-1 text-xl font-bold text-primary">{entry.setNumber}</div>
                    <div className="col-span-3 min-w-0">
                        <button
                            onClick={() => setShowTypePicker(!showTypePicker)}
                            className={`text-[10px] font-bold tracking-wider uppercase border rounded-full px-2 py-1 transition-all active:scale-95 leading-none ${typeConfig.color}`}
                        >
                            {typeConfig.full}
                        </button>
                    </div>
                    <div className="col-span-4 flex justify-center min-w-0">
                        <input
                            type="number"
                            inputMode="decimal"
                            value={entry.weight}
                            onChange={(e) => updateSetEntry(exerciseId, setIndex, 'weight', e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="—"
                            style={{ fontSize: '1.25rem' }}
                            className="w-full max-w-[64px] h-12 text-center font-bold bg-transparent border-b-2 border-white/10 focus:border-primary outline-none text-white placeholder:text-muted-foreground/40 transition-colors"
                        />
                    </div>
                    <div className="col-span-4 flex justify-center min-w-0">
                        <input
                            type="number"
                            inputMode="numeric"
                            value={entry.reps}
                            onChange={(e) => updateSetEntry(exerciseId, setIndex, 'reps', e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="—"
                            style={{ fontSize: '1.25rem' }}
                            className="w-full max-w-[64px] h-12 text-center font-bold bg-transparent border-b-2 border-white/10 focus:border-primary outline-none text-white placeholder:text-muted-foreground/40 transition-colors"
                        />
                    </div>
                </div>

                {showTypePicker && <TypePicker />}
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════════
    // ── Linha Futura (toque para pré-preencher inline) ──
    // ════════════════════════════════════════════════════════════════
    return (
        <button
            onClick={enterInlineEditing}
            className="w-full text-left group"
            title="Toque para pré-preencher esta série"
        >
            <div className="grid grid-cols-12 gap-2 items-center py-3 opacity-40 group-hover:opacity-60 transition-opacity">
                <div className="col-span-1 text-lg font-bold text-muted-foreground">{entry.setNumber}</div>
                <div className="col-span-3 min-w-0">
                    <span className={`text-[10px] font-bold tracking-wider uppercase border rounded-full px-2 py-1 leading-none ${typeConfig.color}`}>
                        {typeConfig.full}
                    </span>
                </div>
                <div className="col-span-4 flex justify-center min-w-0">
                    <div className="w-full max-w-[64px] h-12 flex items-center justify-center text-lg text-muted-foreground/40 border-b border-white/5">
                        {entry.weight || '—'}
                    </div>
                </div>
                <div className="col-span-3 flex justify-center min-w-0">
                    <div className="w-full max-w-[64px] h-12 flex items-center justify-center text-lg text-muted-foreground/40 border-b border-white/5">
                        {entry.reps || '—'}
                    </div>
                </div>
                <div className="col-span-1 flex justify-end">
                    <Pencil className="w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-colors" />
                </div>
            </div>
        </button>
    );
}
