import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { login } from '@/lib/api';
import { useAuthStore } from './store/useAuthStore';

export function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await login({ email, password });
            setAuth(data.accessToken, data.user, data.refreshToken);
            navigate('/app/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao fazer login. Verifique suas credenciais.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
            
            <div className="w-full max-w-sm z-10 animate-in">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(230,0,35,0.15)]">
                        <Dumbbell className="w-8 h-8 text-primary" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 uppercase">
                        Velocity
                    </h1>
                    <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase mt-2">
                        Workout Tracker
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-5">
                        <label className="block">
                            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2 block ml-1">
                                E-mail
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="atleta@velocity.com"
                                className="w-full bg-white/5 border border-white/10 focus:border-primary focus:bg-white/[0.08] rounded-xl py-3.5 px-4 text-base font-medium outline-none placeholder:text-white/20 transition-all"
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2 block ml-1">
                                Senha
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 focus:border-primary focus:bg-white/[0.08] rounded-xl py-3.5 px-4 text-base font-medium outline-none placeholder:text-white/20 transition-all"
                                required
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !email || !password}
                        className={`mt-2 w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center ${
                            isLoading || !email || !password
                                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                : 'bg-primary text-white shadow-[0_0_20px_rgba(230,0,35,0.4)] hover:shadow-[0_0_30px_rgba(230,0,35,0.6)] active:scale-[0.98]'
                        }`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-8">
                    Ainda não tem conta?{' '}
                    <Link to="/register" className="text-primary font-bold hover:underline">
                        Cadastre-se
                    </Link>
                </p>
            </div>
        </div>
    );
}
