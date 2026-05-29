import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { finishWorkoutSession, logWorkoutSet } from '@/lib/api';
import { WorkoutSummaryModal } from './WorkoutSummaryModal';

export function WorkoutBottomBar() {
    const [showSummary, setShowSummary] = useState(false);
    const [summaryData, setSummaryData] = useState<{
        sessionId: string;
        duration: string;
        totalVolume: number;
        totalSets: number;
        exerciseCount: number;
    } | null>(null);

    const {
        sessionId,
        finishWorkout,
        saveCurrentSet,
        startRestTimer,
        restTimerEnd,
        clearRestTimer,
        routine,
        currentExerciseIndex,
        exerciseSets,
        activeRowMap,
    } = useWorkoutStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const exercises = routine?.exercises ?? [];
    const currentExercise = exercises[currentExerciseIndex];
    const exerciseId = currentExercise?.exercise?.id ?? currentExercise?.exerciseId ?? '';

    // ── Rest Timer Countdown ──
    const [restRemaining, setRestRemaining] = useState<number | null>(null);

    useEffect(() => {
        if (!restTimerEnd) {
            setRestRemaining(null);
            return;
        }

        const interval = setInterval(() => {
            const diff = restTimerEnd - Date.now();
            if (diff <= 0) {
                // ── Feedback Sonoro (Web Audio API) ──
                try {
                    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();

                    oscillator.type = 'sine';
                    oscillator.frequency.value = 880; // Frequência do bipe em Hz (Nota A5, clara e limpa)

                    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime); // Volume confortável
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5); // Fade out de 0.5 segundos

                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);

                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.5);
                } catch (e) {
                    console.warn('Falha ao reproduzir áudio do timer:', e);
                }

                // ── Feedback Tátil (Vibration API) ──
                try {
                    if ('vibrate' in navigator) {
                        // Vibração dupla: 200ms ativa, 100ms pausa, 200ms ativa
                        navigator.vibrate([200, 100, 200]);
                    }
                } catch (e) {
                    console.warn('Falha ao vibrar dispositivo:', e);
                }

                clearRestTimer();
                setRestRemaining(null);
            } else {
                setRestRemaining(Math.ceil(diff / 1000));
            }
        }, 200);

        return () => clearInterval(interval);
    }, [restTimerEnd, clearRestTimer]);

    // PR feedback state
    const [showPR, setShowPR] = useState(false);

    const handleLogSet = async () => {
        // Pega os dados da série ativa antes de salvar
        const sets = exerciseSets[exerciseId] ?? [];
        const activeIndex = activeRowMap[exerciseId] ?? 0;
        const currentSet = sets[activeIndex];

        if (!currentSet || !currentSet.weight || !currentSet.reps) return;

        // Salvamos localmente primeiro (Optimistic UI). Por quê?
        // Para garantir que a interface não congele aguardando o banco de dados.
        saveCurrentSet(exerciseId);

        // Persistência "Fire and Forget" em background. 
        // Academias costumam ter sinal 4G ruim, então não podemos bloquear o fluxo de treino se a requisição oscilar.
        if (sessionId && !sessionId.startsWith('local-')) {
            try {
                const result = await logWorkoutSet(sessionId, {
                    exerciseId,
                    setType: currentSet.setType,
                    weight: parseFloat(currentSet.weight),
                    reps: parseInt(currentSet.reps, 10),
                });

                // PR feedback
                if (result && typeof result === 'object' && 'isPR' in result && (result as { isPR: boolean }).isPR) {
                    setShowPR(true);
                    setTimeout(() => setShowPR(false), 3000);
                }
            } catch {
                console.warn('Falha ao salvar série na API — salva localmente.');
            }
        }

        // Inicia o Rest Timer automaticamente após salvar a série.
        // A lógica de negócio dita que o descanso padrão é 45s para manter a intensidade do treino.
        startRestTimer(45);
    };

    const handleRestTimer = () => {
        if (restTimerEnd) {
            clearRestTimer();
        } else {
            startRestTimer(45);
        }
    };

    const handleFinish = async () => {
        if (!confirm('Finalizar treino? Suas séries logadas foram salvas.')) return;

        // Calcula stats antes de limpar o estado
        const startMs = useWorkoutStore.getState().startTime ?? Date.now();
        const durationMs = Date.now() - startMs;
        const mins = Math.floor(durationMs / 60000);
        const secs = Math.floor((durationMs % 60000) / 1000);
        const durationStr = `${mins}:${String(secs).padStart(2, '0')}`;

        const allSets = useWorkoutStore.getState().loggedSets;
        const volume = allSets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
        const uniqueExercises = new Set(allSets.map(s => s.exerciseId)).size;

        // Tenta finalizar no backend
        if (sessionId && !sessionId.startsWith('local-')) {
            try {
                await finishWorkoutSession(sessionId);
            } catch {
                console.warn('Falha ao finalizar sessão na API.');
            }
        }

        setSummaryData({
            sessionId: sessionId ?? '',
            duration: durationStr,
            totalVolume: volume,
            totalSets: allSets.length,
            exerciseCount: uniqueExercises,
        });
        setShowSummary(true);

        finishWorkout();

        // Por que invalidamos as queries globais aqui?
        // Porque ao finalizar um treino, os dados locais do frontend como "Volume Semanal", 
        // "Ofensiva (Streak)" e "Histórico de Treinos" ficam obsoletos em relação ao banco.
        // O `invalidateQueries` do React Query é uma abordagem arquitetural reativa que força 
        // a aplicação a buscar dados frescos silenciosamente assim que o usuário navegar para a Home.
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        queryClient.invalidateQueries({ queryKey: ['history-sessions'] });
        queryClient.invalidateQueries({ queryKey: ['latest-session'] });
    };

    const formatRestTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    return (
        <>
            {/* PR Toast */}
            {showPR && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-in px-6 py-3 rounded-full bg-yellow-500/20 border border-yellow-400/30 backdrop-blur-xl shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                    <p className="text-sm font-black tracking-wider text-yellow-300 flex items-center gap-2">
                        🏆 NOVO RECORDE PESSOAL!
                    </p>
                </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5">
                <div className="max-w-[430px] mx-auto px-5 pt-3 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                        {/* Rest Timer */}
                        <button
                            onClick={handleRestTimer}
                            className={`flex items-center gap-2 border rounded-full px-4 py-2.5 transition-colors flex-shrink-0 ${
                                restRemaining
                                    ? 'bg-primary/10 border-primary/30 text-primary'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                            }`}
                        >
                            <Timer className="w-4 h-4" />
                            <span className="text-[10px] font-bold tracking-wider uppercase">
                                {restRemaining ? formatRestTime(restRemaining) : 'Pausa (0:45)'}
                            </span>
                        </button>

                        {/* LOG SET Button */}
                        <button
                            onClick={handleLogSet}
                            className="flex-1 bg-primary hover:bg-primary/90 text-white font-extrabold text-sm tracking-wider uppercase py-3 rounded-full shadow-[0_0_25px_rgba(230,0,35,0.4)] hover:shadow-[0_0_35px_rgba(230,0,35,0.6)] transition-all active:scale-95"
                        >
                            SALVAR SÉRIE
                        </button>
                    </div>

                    {/* Finish Workout */}
                    <button
                        onClick={handleFinish}
                        className="w-full text-center text-[11px] font-bold tracking-[0.15em] uppercase text-muted-foreground py-2 hover:text-white transition-colors"
                    >
                        Finalizar Treino
                    </button>
                </div>
            </div>

            {/* Summary Modal */}
            {showSummary && summaryData && (
                <WorkoutSummaryModal
                    {...summaryData}
                    onClose={() => {
                        setShowSummary(false);
                        setSummaryData(null);
                        navigate('/app/dashboard');
                    }}
                />
            )}
        </>
    );
}
