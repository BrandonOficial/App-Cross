import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-5 animate-in">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-2">Algo deu errado</h2>
                        <p className="text-sm text-muted-foreground max-w-[280px]">
                            Ocorreu um erro inesperado. Tente novamente ou recarregue a página.
                        </p>
                    </div>
                    {this.state.error && (
                        <pre className="text-[10px] text-red-400/60 bg-red-500/5 border border-red-500/10 rounded-xl p-3 max-w-full overflow-auto max-h-[80px]">
                            {this.state.error.message}
                        </pre>
                    )}
                    <button
                        onClick={this.handleRetry}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(230,0,35,0.3)] hover:shadow-[0_0_25px_rgba(230,0,35,0.5)] active:scale-[0.98] transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Tentar Novamente
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
