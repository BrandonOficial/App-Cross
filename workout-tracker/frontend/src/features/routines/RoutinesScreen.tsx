import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoutinesHeader } from './components/RoutinesHeader';
import { SegmentedTabs } from './components/SegmentedTabs';
import { QuickStartBanner } from './components/QuickStartBanner';
import { UserRoutinesSection } from './components/UserRoutinesSection';
import { SearchBar } from './components/SearchBar';
import { FilterChips } from './components/FilterChips';
import { ExerciseCard } from './components/ExerciseCard';
import { CreateExerciseModal } from './components/CreateExerciseModal';
import { CreateRoutineModal } from './components/CreateRoutineModal';
import { Plus } from 'lucide-react';
import { useWorkoutStore } from '@/features/workouts/store/useWorkoutStore';
import { fetchExercises, startWorkoutSession, createExercise, createRoutine } from '@/lib/api';
import type { Exercise } from '@/lib/api';

const TABS = ['Rotinas', 'Exercícios'];

export function RoutinesScreen() {
    const [activeTab, setActiveTab] = useState('Rotinas');
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('Todos');
    
    // Modal states
    const [showCreateExercise, setShowCreateExercise] = useState(false);
    const [showCreateRoutine, setShowCreateRoutine] = useState(false);
    
    const navigate = useNavigate();
    const startWorkout = useWorkoutStore((s) => s.startWorkout);
    const queryClient = useQueryClient();

    // Busca exercícios da API
    const { data: exercises = [], isLoading: isLoadingExercises, isError: isErrorExercises } = useQuery<Exercise[]>({
        queryKey: ['exercises'],
        queryFn: () => fetchExercises(),
        staleTime: 5 * 60 * 1000,
    });

    // Mutation para criar exercício
    const createExerciseMutation = useMutation({
        mutationFn: (data: { name: string; muscleGroup: string }) => createExercise(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
            setShowCreateExercise(false);
        },
    });

    // Mutation para criar rotina
    const createRoutineMutation = useMutation({
        mutationFn: (data: { name: string; exerciseIds: string[] }) => {
            const mappedExercises = data.exerciseIds.map((id, index) => ({ exerciseId: id, order: index + 1 }));
            return createRoutine({ name: data.name, exercises: mappedExercises });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] });
            setShowCreateRoutine(false);
        },
    });

    // Filtro local — "Todos" mostra tudo, senão filtra por muscleGroup
    const filtered = useMemo(() => {
        return exercises.filter((ex) => {
            const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
            const matchesFilter = activeFilter === 'Todos' || ex.muscleGroup.toLowerCase() === activeFilter.toLowerCase();
            return matchesSearch && matchesFilter;
        });
    }, [exercises, search, activeFilter]);

    const handleSelectExercise = async (exercise: Exercise) => {
        try {
            const session = await startWorkoutSession();
            const routine = {
                name: exercise.name,
                exercises: [{ id: `re-${exercise.id}`, exercise: { id: exercise.id, name: exercise.name } }],
            };
            startWorkout(session.id, routine);
            navigate('/app/workout/active');
        } catch {
            const localId = `local-${Date.now()}`;
            const routine = {
                name: exercise.name,
                exercises: [{ id: `re-${exercise.id}`, exercise: { id: exercise.id, name: exercise.name } }],
            };
            startWorkout(localId, routine);
            navigate('/app/workout/active');
        }
    };

    const handleFabClick = () => {
        if (activeTab === 'Rotinas') {
            setShowCreateRoutine(true);
        } else {
            setShowCreateExercise(true);
        }
    };

    return (
        <div className="flex flex-col relative animate-in">
            <RoutinesHeader />

            {/* Segmented Tabs */}
            <SegmentedTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

            {/* ═══ TAB: Rotinas ═══ */}
            {activeTab === 'Rotinas' && (
                <>
                    <QuickStartBanner />
                    <div className="mb-2">
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">
                            Minhas Rotinas
                        </p>
                    </div>
                    <div className="pb-24">
                        <UserRoutinesSection />
                    </div>
                </>
            )}

            {/* ═══ TAB: Exercícios ═══ */}
            {activeTab === 'Exercícios' && (
                <>
                    <SearchBar value={search} onChange={setSearch} />
                    <FilterChips
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        exercises={exercises}
                    />

                    <div className="flex flex-col gap-3 pb-24">
                        {isLoadingExercises ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-muted-foreground">Carregando exercícios...</p>
                            </div>
                        ) : isErrorExercises ? (
                            <div className="text-center py-16 text-muted-foreground">
                                <p className="text-lg font-bold mb-1">Erro ao carregar</p>
                                <p className="text-sm">Verifique se o backend está rodando em localhost:3000</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground">Nenhum exercício encontrado.</div>
                        ) : (
                            filtered.map((exercise) => (
                                <ExerciseCard
                                    key={exercise.id}
                                    exercise={exercise}
                                    onSelect={handleSelectExercise}
                                />
                            ))
                        )}
                    </div>
                </>
            )}

            {/* FAB — Dinâmico baseado na aba */}
            <button
                onClick={handleFabClick}
                className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_0_25px_rgba(230,0,35,0.5)] hover:shadow-[0_0_35px_rgba(230,0,35,0.7)] hover:scale-105 transition-all active:scale-95"
            >
                <Plus className="w-7 h-7" strokeWidth={3} />
            </button>

            {/* Modal de Criação de Exercício */}
            {showCreateExercise && (
                <CreateExerciseModal
                    onClose={() => setShowCreateExercise(false)}
                    onSubmit={(data) => createExerciseMutation.mutate(data)}
                    isLoading={createExerciseMutation.isPending}
                />
            )}

            {/* Modal de Criação de Rotina */}
            {showCreateRoutine && (
                <CreateRoutineModal
                    onClose={() => setShowCreateRoutine(false)}
                    onSubmit={(data) => createRoutineMutation.mutate(data)}
                    isLoading={createRoutineMutation.isPending}
                    exercises={exercises}
                />
            )}
        </div>
    );
}
