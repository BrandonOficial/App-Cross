import { Timer, Dumbbell, Flame, TrendingUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkoutSummaryModalProps {
    sessionId: string;
    duration: string;
    totalVolume: number;
    totalSets: number;
    exerciseCount: number;
    onClose: () => void;
}

export function WorkoutSummaryModal({
    sessionId,
    duration,
    totalVolume,
    totalSets,
    exerciseCount,
    onClose,
}: WorkoutSummaryModalProps) {
    const navigate = useNavigate();

    const volumeLabel = totalVolume >= 1000
        ? `${(totalVolume / 1000).toFixed(1)}k`
        : totalVolume.toLocaleString('pt-BR');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative z-10 w-full max-w-[380px] bg-[#1a1a1a] rounded-3xl border border-white/10 p-6 animate-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(230,0,35,0.3)]">
                        <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-black tracking-tight">Treino Finalizado!</h2>
                    <p className="text-xs text-muted-foreground mt-1">Bom trabalho, atleta. 💪</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="glass-card p-4 text-center">
                        <Timer className="w-4 h-4 text-sky-400 mx-auto mb-1.5" />
                        <p className="text-lg font-extrabold tracking-tighter">{duration}</p>
                        <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-0.5">Duração</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <Dumbbell className="w-4 h-4 text-primary mx-auto mb-1.5" />
                        <p className="text-lg font-extrabold tracking-tighter">{volumeLabel} kg</p>
                        <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-0.5">Volume</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1.5" />
                        <p className="text-lg font-extrabold tracking-tighter">{totalSets}</p>
                        <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-0.5">Séries</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1.5" />
                        <p className="text-lg font-extrabold tracking-tighter">{exerciseCount}</p>
                        <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-0.5">Exercícios</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => navigate(`/app/history/${sessionId}`)}
                        className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(230,0,35,0.4)] hover:shadow-[0_0_30px_rgba(230,0,35,0.6)] active:scale-[0.98] transition-all"
                    >
                        Ver Detalhes
                    </button>
                    <button
                        onClick={() => { onClose(); navigate('/app/history'); }}
                        className="w-full py-3 rounded-xl border border-white/10 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:bg-white/5 transition-colors"
                    >
                        Ver Histórico
                    </button>
                </div>
            </div>
        </div>
    );
}
