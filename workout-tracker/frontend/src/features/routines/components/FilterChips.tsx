import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import type { Exercise } from '@/lib/api';

interface FilterChipsProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    exercises?: Exercise[];
}

export function FilterChips({ activeFilter, onFilterChange, exercises = [] }: FilterChipsProps) {
    // Gera chips dinâmicos a partir dos muscleGroups reais do banco
    const filters = useMemo(() => {
        const groups = [...new Set(exercises.map((ex) => ex.muscleGroup).filter(Boolean))];
        groups.sort((a, b) => a.localeCompare(b, 'pt-BR'));
        return ['Todos', ...groups];
    }, [exercises]);

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {filters.map((filter) => (
                <button
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-200",
                        activeFilter === filter
                            ? "bg-primary text-white shadow-[0_0_12px_rgba(230,0,35,0.3)]"
                            : "bg-white/[0.06] text-white/50 border border-white/[0.06] hover:bg-white/[0.1]"
                    )}
                >
                    {filter}
                </button>
            ))}
        </div>
    );
}
