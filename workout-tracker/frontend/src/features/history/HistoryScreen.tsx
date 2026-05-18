import { useQuery } from '@tanstack/react-query';
import { HistoryHeader } from './components/HistoryHeader';
import { VolumeChart } from './components/VolumeChart';
import { WorkoutSessionCard } from './components/WorkoutSessionCard';
import { fetchSessionsHistory } from '@/lib/api';
import type { WorkoutSession } from '@/lib/api';

/**
 * Detecta PRs comparando cada set da sessão com os maiores pesos
 * das sessões anteriores (cronologicamente).
 */
function countPRsInSession(
    session: WorkoutSession,
    allSessions: WorkoutSession[],
): number {
    // Encontra sessões que ocorreram ANTES desta sessão
    const sessionDate = new Date(session.startTime).getTime();
    const previousSessions = allSessions.filter(
        (s) => new Date(s.startTime).getTime() < sessionDate
    );

    // Monta um map de exerciseId → maior peso anterior
    const bestWeightBefore = new Map<string, number>();
    for (const prev of previousSessions) {
        for (const set of prev.sets ?? []) {
            const w = Number(set.weight);
            const current = bestWeightBefore.get(set.exerciseId) ?? 0;
            if (w > current) bestWeightBefore.set(set.exerciseId, w);
        }
    }

    // Conta sets da sessão atual que superam o melhor peso anterior
    let prs = 0;
    const exerciseChecked = new Set<string>();
    for (const set of session.sets ?? []) {
        if (exerciseChecked.has(set.exerciseId)) continue;
        const w = Number(set.weight);
        const best = bestWeightBefore.get(set.exerciseId) ?? 0;
        if (w > best && w > 0) {
            prs++;
            exerciseChecked.add(set.exerciseId);
        }
    }
    return prs;
}

function formatSessionForCard(session: WorkoutSession, allSessions: WorkoutSession[]) {
    const startDate = new Date(session.startTime);
    const now = new Date();
    const isToday = startDate.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = startDate.toDateString() === yesterday.toDateString();

    const time = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let dateLabel: string;
    if (isToday) {
        dateLabel = `Hoje, ${time}`;
    } else if (isYesterday) {
        dateLabel = `Ontem, ${time}`;
    } else {
        dateLabel = `${startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}, ${time}`;
    }

    // Calcula duração
    let duration = 'Em andamento';
    if (session.endTime) {
        const diffMs = new Date(session.endTime).getTime() - startDate.getTime();
        const mins = Math.round(diffMs / 60000);
        duration = `${mins} min`;
    }

    // Calcula volume total
    const totalVolume = (session.sets ?? []).reduce((sum, set) => {
        return sum + (Number(set.weight) * set.reps);
    }, 0);
    const volumeLabel = totalVolume >= 1000
        ? `${(totalVolume / 1000).toFixed(1)}k kg`
        : `${totalVolume.toLocaleString('pt-BR')} kg`;

    // Nome do treino
    const name = session.routine?.name ?? 'Treino Livre';

    // Extrai grupos musculares únicos das séries
    const muscleGroups = [...new Set(
        (session.sets ?? [])
            .map(s => s.exercise?.muscleGroup)
            .filter(Boolean) as string[]
    )];

    // Conta PRs
    const records = countPRsInSession(session, allSessions);

    return {
        id: session.id,
        dateLabel,
        name,
        duration,
        volume: volumeLabel,
        records,
        tags: muscleGroups.length > 0 ? muscleGroups : ['Geral'],
        hasBackground: false,
    };
}

export function HistoryScreen() {
    const { data: sessions = [], isLoading, isError } = useQuery<WorkoutSession[]>({
        queryKey: ['history-sessions'],
        queryFn: () => fetchSessionsHistory(),
        staleTime: 30 * 1000, // 30s cache
    });

    return (
        <div className="flex flex-col pb-24 animate-in">
            <HistoryHeader />
            <VolumeChart sessions={sessions} />

            {/* Session Feed */}
            <div className="flex flex-col">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground">Carregando histórico...</p>
                    </div>
                ) : isError ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="text-lg font-bold mb-1">Erro ao carregar</p>
                        <p className="text-sm">Verifique se o backend está rodando.</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="text-lg font-bold mb-1">Nenhum treino ainda</p>
                        <p className="text-sm">Vá para Explore e inicie seu primeiro treino!</p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <WorkoutSessionCard key={session.id} session={formatSessionForCard(session, sessions)} />
                    ))
                )}
            </div>
        </div>
    );
}
