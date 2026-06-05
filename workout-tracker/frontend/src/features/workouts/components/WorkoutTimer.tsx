import { useEffect, useState } from 'react';
import { useWorkoutStore } from '../store/useWorkoutStore';

export function WorkoutTimer() {
    const startTime = useWorkoutStore((s) => s.startTime);
    const [elapsed, setElapsed] = useState('00:00');

    useEffect(() => {
        if (!startTime) return;

        const interval = setInterval(() => {
            const diff = Date.now() - startTime;
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setElapsed(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    return (
        <div className="flex flex-col items-center py-4">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-1">Tempo de Treino</p>
            <p className="text-5xl font-extrabold tracking-tighter text-primary leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {elapsed}
            </p>
        </div>
    );
}
