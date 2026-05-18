import { SessionCard } from './SessionCard';
import { useSessionsHistory } from '../hooks/useHistory';
import type { WorkoutSession } from '@/lib/api';

export function SessionsFeed() {
    const { data: sessions, isLoading, isError } = useSessionsHistory();

    if (isLoading) return <div className="text-center py-10 animate-pulse">Carregando feed...</div>;
    if (isError) return <div className="text-destructive py-10 text-center">Erro ao carregar histórico.</div>;
    if (!sessions || sessions.length === 0) return <div className="text-muted-foreground text-center py-10">Nenhum treino registrado.</div>;

    return (
        <div className="flex flex-col gap-2 mt-4">
            {sessions.map((session: WorkoutSession) => (
                <SessionCard key={session.id} session={session} />
            ))}
        </div>
    );
}
