import { useEffect, useState } from 'react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { Flame, Heart } from 'lucide-react';

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
            <p className="text-5xl font-extrabold tracking-tighter text-primary leading-none mb-3" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {elapsed}
            </p>

            {/* Chips */}
            <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase bg-white/5 border border-white/10 rounded-full px-3 py-1 text-white/70">
                    <Flame className="w-3 h-3 text-orange-400" /> 382 KCAL
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase bg-white/5 border border-white/10 rounded-full px-3 py-1 text-white/70">
                    <Heart className="w-3 h-3 text-red-400" /> 148 BPM
                </span>
            </div>
        </div>
    );
}
