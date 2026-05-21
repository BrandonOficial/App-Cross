import { Button } from '@/components/ui/button';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useNavigate } from 'react-router-dom';

export function WorkoutHeader() {
    const { routine, finishWorkout } = useWorkoutStore();
    const navigate = useNavigate();

    const handleFinish = () => {
        // Utilizamos um `confirm` nativo temporariamente porque a ação de finalizar
        // é irreversível (limpa o Zustand store). Em um cenário de produção futuro,
        // substituiremos por um Modal Customizado para manter a consistência estética do PWA,
        // mas a simplicidade do `confirm` valida a funcionalidade mais rápido.
        if (confirm("Deseja realmente finalizar o treino?")) {
            finishWorkout();
            navigate('/app/dashboard');
        }
    };

    return (
        <header className="flex items-center justify-between mb-6 border-b border-border pb-4">
            <div>
                <p className="text-xs font-bold tracking-widest text-primary uppercase mb-1">Treino Ativo</p>
                <h1 className="text-2xl font-black tracking-tight">{routine?.name || "Treino Livre"}</h1>
            </div>
            <Button onClick={handleFinish} variant="destructive" className="font-bold rounded-full px-6">
                Finalizar
            </Button>
        </header>
    );
}
