import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Trophy, Dumbbell, TrendingUp, LogOut, Save, Ruler, Weight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, logout as apiLogout, fetchDashboardSummary } from '@/lib/api';
import type { DashboardSummary, UserProfile } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useSettingsStore } from '@/features/workouts/store/useSettingsStore';
import { Timer } from 'lucide-react';

export function ProfileScreen() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const authUser = useAuthStore((s) => s.user);
    const clearAuth = useAuthStore((s) => s.clearAuth);

    // Preferências de treino
    const restTimerDuration = useSettingsStore((s) => s.restTimerDuration);
    const setRestTimerDuration = useSettingsStore((s) => s.setRestTimerDuration);

    const REST_TIMER_PRESETS = [
        { label: '30s', value: 30 },
        { label: '45s', value: 45 },
        { label: '1min', value: 60 },
        { label: '1:30', value: 90 },
        { label: '2min', value: 120 },
        { label: '3min', value: 180 },
    ];

    // Dados do perfil via API
    const { data: profile } = useQuery<UserProfile>({
        queryKey: ['user-profile'],
        queryFn: getProfile,
        staleTime: 60 * 1000,
    });

    // Dados de resumo
    const { data: summary } = useQuery<DashboardSummary>({
        queryKey: ['dashboard-summary'],
        queryFn: () => fetchDashboardSummary(),
        staleTime: 60 * 1000,
    });

    const totalSessions = summary?.totalSessions ?? 0;
    const weeklyVolume = summary?.weeklyVolume ?? 0;
    const streak = summary?.currentStreak ?? 0;

    // ── Edição de perfil ──
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editHeight, setEditHeight] = useState('');
    const [editWeight, setEditWeight] = useState('');

    const startEditing = () => {
        setEditName(profile?.name ?? authUser?.name ?? '');
        setEditHeight(profile?.height?.toString() ?? '');
        setEditWeight(profile?.weight?.toString() ?? '');
        setIsEditing(true);
    };

    const updateMutation = useMutation({
        mutationFn: () => updateProfile({
            name: editName || undefined,
            height: editHeight ? parseInt(editHeight, 10) : undefined,
            weight: editWeight ? parseFloat(editWeight) : undefined,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            setIsEditing(false);
        },
    });

    // ── Logout ──
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await apiLogout();
        } catch {
            // Se falhar no backend, ainda faz logout local
        }
        clearAuth();
        navigate('/login');
    };

    // Dados dinâmicos
    const displayName = profile?.name ?? authUser?.name ?? 'Atleta';
    const displayEmail = profile?.email ?? authUser?.email ?? '';
    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        : '';

    return (
        <div className="flex flex-col gap-5 animate-in pb-24">
            {/* Header */}
            <div className="pt-2">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-1">Minha Conta</p>
                <h1 className="text-3xl font-black tracking-tight">Perfil</h1>
            </div>

            {/* Avatar & Name */}
            <div className="glass-card p-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(230,0,35,0.2)]">
                    <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold truncate">{displayName}</h2>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{displayEmail}</span>
                    </div>
                    {memberSince && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Membro desde {memberSince}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3">
                <div className="glass-card p-4 text-center">
                    <Dumbbell className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-extrabold tracking-tighter">{totalSessions}</p>
                    <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-1">Treinos</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <Trophy className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-extrabold tracking-tighter">{streak}</p>
                    <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-1">Streak</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-extrabold tracking-tighter">
                        {weeklyVolume >= 1000 ? `${(weeklyVolume / 1000).toFixed(1)}k` : weeklyVolume}
                    </p>
                    <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-1">KG / Sem</p>
                </div>
            </div>

            {/* Biometrics / Edit Section */}
            {!isEditing ? (
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2 px-1">Dados Pessoais</p>
                    <button onClick={startEditing} className="glass-card p-4 flex items-center gap-3 hover:bg-white/[0.10] transition-colors">
                        <div className="text-muted-foreground"><User className="w-5 h-5" /></div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-bold">Nome</p>
                            <p className="text-xs text-muted-foreground">{displayName}</p>
                        </div>
                    </button>
                    <button onClick={startEditing} className="glass-card p-4 flex items-center gap-3 hover:bg-white/[0.10] transition-colors">
                        <div className="text-muted-foreground"><Ruler className="w-5 h-5" /></div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-bold">Altura</p>
                            <p className="text-xs text-muted-foreground">{profile?.height ? `${profile.height} cm` : 'Não informado'}</p>
                        </div>
                    </button>
                    <button onClick={startEditing} className="glass-card p-4 flex items-center gap-3 hover:bg-white/[0.10] transition-colors">
                        <div className="text-muted-foreground"><Weight className="w-5 h-5" /></div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-bold">Peso</p>
                            <p className="text-xs text-muted-foreground">{profile?.weight ? `${profile.weight} kg` : 'Não informado'}</p>
                        </div>
                    </button>
                </div>
            ) : (
                <div className="glass-card p-5 flex flex-col gap-4">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-1">Editar Dados</p>

                    <label className="block">
                        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">Nome</span>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-white/10 focus:border-primary py-2 text-sm font-medium outline-none transition-colors"
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">Altura (cm)</span>
                            <input
                                type="number"
                                value={editHeight}
                                onChange={(e) => setEditHeight(e.target.value)}
                                placeholder="175"
                                className="w-full bg-transparent border-b-2 border-white/10 focus:border-primary py-2 text-sm font-medium outline-none transition-colors"
                            />
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5 block">Peso (kg)</span>
                            <input
                                type="number"
                                step="0.1"
                                value={editWeight}
                                onChange={(e) => setEditWeight(e.target.value)}
                                placeholder="80.5"
                                className="w-full bg-transparent border-b-2 border-white/10 focus:border-primary py-2 text-sm font-medium outline-none transition-colors"
                            />
                        </label>
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => updateMutation.mutate()}
                            disabled={updateMutation.isPending}
                            className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(230,0,35,0.3)] hover:shadow-[0_0_25px_rgba(230,0,35,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {updateMutation.isPending ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Salvar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Preferências de Treino */}
            <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2 px-1">Preferências de Treino</p>
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <Timer className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Timer de Descanso</p>
                            <p className="text-xs text-muted-foreground">Tempo automático após salvar uma série</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {REST_TIMER_PRESETS.map((preset) => (
                            <button
                                key={preset.value}
                                onClick={() => setRestTimerDuration(preset.value)}
                                className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                    restTimerDuration === preset.value
                                        ? 'bg-primary text-white shadow-[0_0_12px_rgba(230,0,35,0.3)]'
                                        : 'bg-white/[0.06] text-white/50 border border-white/[0.06] hover:bg-white/[0.1]'
                                }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="glass-card p-4 flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors mt-2"
            >
                {isLoggingOut ? (
                    <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <LogOut className="w-5 h-5" />
                )}
                <span className="font-bold text-sm">Sair da Conta</span>
            </button>

            {/* Version */}
            <p className="text-center text-[10px] text-muted-foreground/40 font-medium mt-2">
                Velocity v0.1.0 • Build MVP
            </p>
        </div>
    );
}
