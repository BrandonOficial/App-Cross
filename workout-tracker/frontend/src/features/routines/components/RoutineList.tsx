import { RoutineCard } from './RoutineCard';
import type { Routine } from '@/lib/api';

interface RoutineListProps {
    routines: Routine[];
}

export function RoutineList({ routines }: RoutineListProps) {
    if (routines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-muted-foreground mb-4">Você ainda não possui rotinas criadas.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {routines.map((routine) => (
                <RoutineCard key={routine.id} routine={routine} />
            ))}
        </div>
    );
}
