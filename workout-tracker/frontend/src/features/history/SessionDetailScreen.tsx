import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSessionDetail } from '@/lib/api';
import { ArrowLeft, Dumbbell, Clock, Weight, Flame, Trophy } from 'lucide-react';
import type { LatestSession } from '@/lib/api';
import { ExerciseProgressChart } from './components/ExerciseProgressChart';
import { OneRepMaxChart } from './components/OneRepMaxChart';

export function SessionDetailScreen() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();

    const { data: session, isLoading, isError } = useQuery<LatestSession>({
        queryKey: ['session', sessionId],
        queryFn: () => fetchSessionDetail(sessionId!),
        enabled: !!sessionId,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Carregando detalhes...</p>
            </div>
        );
    }

    if (isError || !session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
                <h2 className="text-2xl font-bold">Sessão não encontrada</h2>
                <button onClick={() => navigate('/app/history')} className="text-primary font-bold">
                    Voltar ao Histórico
                </button>
            </div>
        );
    }

    const startDate = new Date(session.startTime);
    const dateStr = startDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    const timeStr = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const volumeLabel = session.totalVolume >= 1000
        ? `${(session.totalVolume / 1000).toFixed(1)}k`
        : session.totalVolume;

    const durationLabel = session.durationMinutes ? `${session.durationMinutes} min` : 'Em andamento';
    
    // Agrupa sets por exercício, preservando o ID para o gráfico
    const exerciseGroups = session.sets.reduce((acc, set) => {
        const exId = set.exerciseId;
        const exName = set.exercise?.name || 'Desconhecido';
        if (!acc[exId]) acc[exId] = { name: exName, sets: [] };
        acc[exId].sets.push(set);
        return acc;
    }, {} as Record<string, { name: string; sets: typeof session.sets }>);

    // Encontra o maior peso por exercício nesta sessão para marcar PR badge
    const maxWeightPerExercise = new Map<string, number>();
    for (const set of session.sets) {
        const w = Number(set.weight);
        const current = maxWeightPerExercise.get(set.exerciseId) ?? 0;
        if (w > current) maxWeightPerExercise.set(set.exerciseId, w);
    }

    return (
        <div className="flex flex-col pb-24 animate-in">
            {/* Header com voltar */}
            <header className="flex items-center gap-4 pt-2 pb-6">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-1">
                        {dateStr}
                    </p>
                    <h1 className="text-2xl font-black tracking-tight">{session.routine?.name || 'Treino Livre'}</h1>
                </div>
            </header>

            {/* Metrics Overview */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="glass-card p-4 text-center">
                    <Clock className="w-5 h-5 text-sky-400 mx-auto mb-2" />
                    <p className="text-xl font-extrabold tracking-tighter">{durationLabel}</p>
                    <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-1">Duração</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <Weight className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xl font-extrabold tracking-tighter">{volumeLabel}</p>
                    <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-1">KG Total</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                    <p className="text-xl font-extrabold tracking-tighter">{Math.round(session.totalVolume * 0.05)}</p>
                    <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-1">Calorias</p>
                </div>
            </div>

            {/* Lista de Exercícios Executados */}
            <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1">Performance por Exercício</h3>
                
                {Object.entries(exerciseGroups).map(([exId, { name: exName, sets }]) => (
                    <div key={exId} className="flex flex-col gap-3">
                        <div className="glass-card overflow-hidden">
                            <div className="bg-white/5 p-4 flex items-center gap-3 border-b border-white/5">
                                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                                    <Dumbbell className="w-4 h-4 text-primary" />
                                </div>
                                <h4 className="font-bold text-sm">{exName}</h4>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-12 gap-2 mb-2 px-1">
                                    <div className="col-span-2 text-[10px] font-bold tracking-wider uppercase text-muted-foreground">Série</div>
                                    <div className="col-span-4 text-[10px] font-bold tracking-wider uppercase text-muted-foreground">Tipo</div>
                                    <div className="col-span-3 text-center text-[10px] font-bold tracking-wider uppercase text-muted-foreground">KG</div>
                                    <div className="col-span-3 text-center text-[10px] font-bold tracking-wider uppercase text-muted-foreground">Reps</div>
                                </div>
                                {sets.map((set, i) => {
                                    const isTopSet = set.setType === 'TOP_SET';
                                    return (
                                        <div key={set.id} className="grid grid-cols-12 gap-2 items-center py-2 px-1 border-b border-white/5 last:border-0">
                                            <div className="col-span-2 text-sm font-bold text-muted-foreground">{i + 1}</div>
                                            <div className="col-span-4">
                                                <span className={`text-[9px] font-bold tracking-wider uppercase border rounded-full px-2 py-0.5 ${isTopSet ? 'text-primary border-primary/30 bg-primary/10' : 'text-white/50 border-white/10'}`}>
                                                    {set.setType === 'WARMUP' ? 'Aquecimento' : set.setType === 'TOP_SET' ? 'Top Set' : set.setType === 'BACK_OFF' ? 'Redução' : 'Padrão'}
                                                </span>
                                            </div>
                                            <div className={`col-span-3 text-center text-sm font-bold ${isTopSet ? 'text-white' : 'text-muted-foreground'}`}>{set.weight}</div>
                                            <div className={`col-span-3 text-center text-sm font-bold flex items-center justify-center gap-1 ${isTopSet ? 'text-white' : 'text-muted-foreground'}`}>
                                                {set.reps}
                                                {Number(set.weight) === maxWeightPerExercise.get(set.exerciseId) && Number(set.weight) > 0 && (
                                                    <Trophy className="w-3 h-3 text-yellow-400" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Gráfico de Progressão */}
                        <ExerciseProgressChart exerciseId={exId} exerciseName={exName} />
                    </div>
                ))}
            </div>
        </div>
    );
}
