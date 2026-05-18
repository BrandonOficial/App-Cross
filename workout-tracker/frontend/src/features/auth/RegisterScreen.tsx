import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '@/lib/api';
import { useAuthStore } from './store/useAuthStore';

export function RegisterScreen() {
    const [name, setName] = useState('');
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
            const data = await register({ name, email, password });
            setAuth(data.accessToken, data.user, data.refreshToken);
            navigate('/app/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao criar conta. Tente outro e-mail.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
            
            <div className="w-full max-w-sm z-10 animate-in">
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-2xl font-black tracking-wider text-white uppercase text-center mb-2">
                        Crie seu Arsenal
                    </h1>
                    <p className="text-sm text-muted-foreground text-center">
                        Junte-se à Velocity e eleve seu treino.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <label className="block">
                            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2 block ml-1">
                                Nome
                            </span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Como você quer ser chamado?"
                                className="w-full bg-white/5 border border-white/10 focus:border-primary focus:bg-white/[0.08] rounded-xl py-3.5 px-4 text-base font-medium outline-none placeholder:text-white/20 transition-all"
                                required
                            />
                        </label>

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
                                placeholder="No mínimo 6 caracteres"
                                className="w-full bg-white/5 border border-white/10 focus:border-primary focus:bg-white/[0.08] rounded-xl py-3.5 px-4 text-base font-medium outline-none placeholder:text-white/20 transition-all"
                                required
                                minLength={6}
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !name || !email || !password}
                        className={`mt-4 w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center ${
                            isLoading || !name || !email || !password
                                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                : 'bg-primary text-white shadow-[0_0_20px_rgba(230,0,35,0.4)] hover:shadow-[0_0_30px_rgba(230,0,35,0.6)] active:scale-[0.98]'
                        }`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            'Começar a Treinar'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-8">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                        Entrar
                    </Link>
                </p>
            </div>
        </div>
    );
}
