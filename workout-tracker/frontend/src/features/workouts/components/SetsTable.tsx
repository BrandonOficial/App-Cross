import { useEffect } from 'react';
import { SetTableRow } from './SetTableRow';
import { Plus } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';

interface SetsTableProps {
    exerciseId: string;
}

export function SetsTable({ exerciseId }: SetsTableProps) {
    const sets = useWorkoutStore((s) => s.exerciseSets[exerciseId] ?? []);
    const activeRow = useWorkoutStore((s) => s.activeRowMap[exerciseId] ?? 0);
    const initSetsForExercise = useWorkoutStore((s) => s.initSetsForExercise);
    const addSetRow = useWorkoutStore((s) => s.addSetRow);

    // Por que inicializamos 3 linhas vazias (Empty States) no mount do componente?
    // Para reduzir o atrito (friction) de uso. O usuário médio costuma fazer 3 séries por exercício.
    // Assim, não o forçamos a clicar "Adicionar Série" repetidas vezes.
    useEffect(() => {
        initSetsForExercise(exerciseId, 3);
    }, [exerciseId, initSetsForExercise]);

    return (
        <div className="mb-6">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 items-center py-2 border-b border-white/10 mb-1">
                <div className="col-span-1 text-[10px] font-bold tracking-wider uppercase text-muted-foreground">Série</div>
                <div className="col-span-3 text-[10px] font-bold tracking-wider uppercase text-muted-foreground">Tipo</div>
                <div className="col-span-4 text-center text-[10px] font-bold tracking-wider uppercase text-muted-foreground">KG</div>
                <div className="col-span-4 text-center text-[10px] font-bold tracking-wider uppercase text-muted-foreground">Reps</div>
            </div>

            {/* Set Rows */}
            {sets.map((_, i) => (
                <SetTableRow
                    key={i}
                    exerciseId={exerciseId}
                    setIndex={i}
                    isActive={i === activeRow}
                />
            ))}

            {/* + ADD SET */}
            <button
                onClick={() => addSetRow(exerciseId)}
                className="w-full mt-3 py-3 text-sm font-bold tracking-wider uppercase text-muted-foreground bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-center gap-1"
            >
                <Plus className="w-4 h-4" /> Adicionar Série
            </button>
        </div>
    );
}
