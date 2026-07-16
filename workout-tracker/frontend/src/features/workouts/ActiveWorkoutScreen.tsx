import { useState } from 'react';
import { useWorkoutStore } from './store/useWorkoutStore';
import { WorkoutTopBar } from './components/WorkoutTopBar';
import { WorkoutTimer } from './components/WorkoutTimer';
import { ExerciseHeader } from './components/ExerciseHeader';
import { SetsTable } from './components/SetsTable';
import { PerformanceCards } from './components/PerformanceCards';
import { UpNext } from './components/UpNext';
import { WorkoutBottomBar } from './components/WorkoutBottomBar';
import { AddExerciseModal } from './components/AddExerciseModal';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export function ActiveWorkoutScreen() {
    const { isActive, routine, currentExerciseIndex } = useWorkoutStore();
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);

    // Por que validamos o estado ativo aqui e não no roteador (React Router)?
    // Porque o roteador cuida da autenticação (rotas públicas vs privadas), mas o conceito de "Treino Ativo"
    // é estritamente volátil e vive no Zustand. Evitar que o usuário caia num estado "quebrado" ao recarregar a aba 
    // ou acessar diretamente a URL previne crashes nos componentes filhos que esperam um `routine` não nulo.
    if (!isActive || !routine) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
                <h2 className="text-2xl font-bold">Nenhum treino ativo</h2>
                <p className="text-muted-foreground">Vá para a aba Rotinas e inicie um treino.</p>
                <Button onClick={() => navigate('/app/routines')} variant="outline">
                    Ver Rotinas
                </Button>
            </div>
        );
    }

    const exercises = routine.exercises ?? [];
    const currentExercise = exercises[currentExerciseIndex];
    const exerciseId = currentExercise?.exercise?.id ?? currentExercise?.exerciseId ?? '';

    // Por que existe um Empty State se toda rotina requer exercícios para ser criada?
    // Porque o App suporta a funcionalidade de "Treino Livre (Free Style)".
    // O usuário pode decidir no vestiário iniciar um treino em branco e ir adicionando os exercícios sob demanda.
    if (exercises.length === 0) {
        return (
            <div className="flex flex-col pb-[120px] animate-in relative" style={{ minHeight: '100dvh' }}>
                {/* Fluid Glows */}
                <div className="fluid-glow fluid-glow--primary-tl" />
                <div className="fluid-glow fluid-glow--primary-br" />

                <WorkoutTopBar onAddExercise={() => setShowAddModal(true)} />
                <WorkoutTimer />

                <div className="flex flex-col items-center justify-center py-16 gap-5">
                    <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                        <Plus className="w-10 h-10 text-primary" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold mb-1">Adicione exercícios</h3>
                        <p className="text-sm text-muted-foreground max-w-[250px]">
                            Toque no botão abaixo ou no <span className="text-primary font-bold">+</span> no topo para buscar exercícios.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 rounded-full bg-primary text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(230,0,35,0.4)] hover:shadow-[0_0_30px_rgba(230,0,35,0.6)] active:scale-[0.98] transition-all"
                    >
                        Buscar Exercícios
                    </button>
                </div>

                <WorkoutBottomBar />
                {showAddModal && <AddExerciseModal onClose={() => setShowAddModal(false)} />}
            </div>
        );
    }

    return (
        <div className="flex flex-col pb-[120px] animate-in relative" style={{ minHeight: '100dvh' }}>
            {/* Fluid Glows */}
            <div className="fluid-glow fluid-glow--primary-tl" />
            <div className="fluid-glow fluid-glow--primary-br" />
            <WorkoutTopBar onAddExercise={() => setShowAddModal(true)} />
            <WorkoutTimer />
            <ExerciseHeader />
            <SetsTable exerciseId={exerciseId} />
            <PerformanceCards exerciseId={exerciseId} />
            <UpNext />
            <WorkoutBottomBar hidden={showAddModal} />
            {showAddModal && <AddExerciseModal onClose={() => setShowAddModal(false)} />}
        </div>
    );
}
