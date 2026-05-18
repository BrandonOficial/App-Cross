import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import type { WorkoutSession, WorkoutSet } from '@/lib/api';

interface SessionCardProps {
    session: WorkoutSession;
}

export function SessionCard({ session }: SessionCardProps) {
    const date = new Date(session.startTime).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    const durationMinutes = session.endTime 
        ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
        : 'Em andamento';

    const sets = session.sets ?? [];

    return (
        <Card className="glass-card mb-4 border-white/5">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{date}</span>
                    </div>
                    <span className="text-xs">{durationMinutes} min</span>
                </CardTitle>
                <h3 className="text-xl font-bold mt-1">
                    {session.routine ? session.routine.name : 'Treino Livre'}
                </h3>
            </CardHeader>
            <CardContent>
                <div className="mt-2 flex flex-col gap-3">
                    {/* Tabela Simplificada Notion-Style */}
                    {sets.slice(0, 3).map((set: WorkoutSet) => (
                        <div key={set.id} className="grid grid-cols-12 gap-2 text-sm border-b border-white/5 pb-1 last:border-0">
                            <div className="col-span-6 font-semibold truncate text-muted-foreground">
                                {set.exercise?.name ?? 'Exercício'}
                            </div>
                            <div className="col-span-3 text-center">
                                {set.weight} <span className="text-xs text-muted-foreground">kg</span>
                            </div>
                            <div className="col-span-3 text-right">
                                {set.reps} <span className="text-xs text-muted-foreground">reps</span>
                            </div>
                        </div>
                    ))}
                    {sets.length > 3 && (
                        <div className="text-xs text-center text-primary mt-1 font-semibold">
                            + {sets.length - 3} séries
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
