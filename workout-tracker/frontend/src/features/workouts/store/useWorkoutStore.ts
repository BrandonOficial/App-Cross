// src/features/workouts/store/useWorkoutStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Por que temos interfaces locais aqui separadas do DTO do backend?
// Para garantir resiliência offline (Offline-First). O Zustand precisa conseguir operar
// independente da rede, então moldamos os dados para a necessidade imediata da UI.
export interface ActiveExercise {
    id: string;
    exerciseId?: string;
    exercise: {
        id: string;
        name: string;
    };
}

export interface ActiveRoutine {
    name: string;
    exercises: ActiveExercise[];
}

export interface LoggedSet {
    id: string;
    exerciseId: string;
    setType: string;
    weight: number;
    reps: number;
    rpe?: number;
}

export interface SetEntry {
    setNumber: number;
    setType: string;
    weight: string;
    reps: string;
    isSaved: boolean;
}

interface WorkoutState {
    isActive: boolean;
    sessionId: string | null;
    routine: ActiveRoutine | null;
    loggedSets: LoggedSet[];
    startTime: number | null;
    currentExerciseIndex: number;

    // Por que normalizamos o estado das séries em um Record (Dictionary) em vez de aninhar dentro da routine?
    // Normalização evita re-renders desnecessários. Se as séries fossem aninhadas,
    // qualquer input faria o objeto `routine` inteiro ser recriado, causando lag no teclado do celular.
    exerciseSets: Record<string, SetEntry[]>;
    
    // Controla qual linha (set) está ativa para receber input { [exerciseId]: rowNumber }
    activeRowMap: Record<string, number>;

    // Armazenamos o timestamp absoluto final do descanso em vez de um "contador regressivo" (timeLeft).
    // Por que? Porque o JS na web sofre throttle (é pausado) quando o usuário minimiza o navegador no celular.
    // Usando timestamp absoluto, a conta do tempo restante sempre estará correta quando o app voltar a ficar ativo.
    restTimerEnd: number | null;

    // Ações
    startWorkout: (sessionId: string, routine: ActiveRoutine) => void;
    addLoggedSet: (set: LoggedSet) => void;
    addExercise: (exercise: ActiveExercise) => void;
    removeExercise: (exerciseId: string) => void;
    setCurrentExerciseIndex: (index: number) => void;
    nextExercise: () => void;
    prevExercise: () => void;
    finishWorkout: () => void;

    // Ações de Sets
    initSetsForExercise: (exerciseId: string, count?: number) => void;
    updateSetEntry: (exerciseId: string, setIndex: number, field: 'weight' | 'reps' | 'setType', value: string) => void;
    saveCurrentSet: (exerciseId: string) => void;
    addSetRow: (exerciseId: string) => void;

    // Edição de séries já salvas / futuras
    // editingRowMap  → qual setIndex está em edição para cada exercício (null = nenhum)
    // editingSnapshot → cópia do SetEntry ANTES da edição, para poder cancelar sem perder dados
    editingRowMap: Record<string, number | null>;
    editingSnapshot: Record<string, SetEntry | null>;
    startEditingSet: (exerciseId: string, setIndex: number) => void;
    cancelEditingSet: (exerciseId: string) => void;
    confirmEditSet: (exerciseId: string, setIndex: number) => void;

    // Rest Timer
    startRestTimer: (seconds: number) => void;
    clearRestTimer: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set, get) => ({
            isActive: false,
            sessionId: null,
            routine: null,
            loggedSets: [],
            startTime: null,
            currentExerciseIndex: 0,
            exerciseSets: {},
            activeRowMap: {},
            restTimerEnd: null,
            editingRowMap: {},
            editingSnapshot: {},

            startWorkout: (sessionId, routine) => set({
                isActive: true,
                sessionId,
                routine,
                loggedSets: [],
                startTime: Date.now(),
                currentExerciseIndex: 0,
                exerciseSets: {},
                activeRowMap: {},
                restTimerEnd: null,
                editingRowMap: {},
                editingSnapshot: {},
            }),

            addLoggedSet: (loggedSet) => set((state) => ({
                loggedSets: [...state.loggedSets, loggedSet]
            })),

            addExercise: (exercise) => {
                const state = get();
                if (!state.routine) return;
                const newExercises = [...state.routine.exercises, exercise];
                set({
                    routine: { ...state.routine, exercises: newExercises },
                });
            },

            removeExercise: (exerciseId) => {
                const state = get();
                if (!state.routine) return;
                const filtered = state.routine.exercises.filter(
                    (e) => (e.exercise?.id ?? e.exerciseId) !== exerciseId
                );
                set({
                    routine: { ...state.routine, exercises: filtered },
                    currentExerciseIndex: Math.min(state.currentExerciseIndex, Math.max(filtered.length - 1, 0)),
                });
            },

            setCurrentExerciseIndex: (index) => set({ currentExerciseIndex: index }),

            nextExercise: () => {
                const state = get();
                const total = state.routine?.exercises?.length ?? 0;
                if (state.currentExerciseIndex < total - 1) {
                    set({ currentExerciseIndex: state.currentExerciseIndex + 1 });
                }
            },

            prevExercise: () => {
                const state = get();
                if (state.currentExerciseIndex > 0) {
                    set({ currentExerciseIndex: state.currentExerciseIndex - 1 });
                }
            },

            finishWorkout: () => set({
                isActive: false,
                sessionId: null,
                routine: null,
                loggedSets: [],
                startTime: null,
                currentExerciseIndex: 0,
                exerciseSets: {},
                activeRowMap: {},
                restTimerEnd: null,
                editingRowMap: {},
                editingSnapshot: {},
            }),

            // Inicializa as linhas de set para um exercício
            initSetsForExercise: (exerciseId, count = 1) => {
                const state = get();
                if (state.exerciseSets[exerciseId]) return; // Já inicializado

                const sets: SetEntry[] = Array.from({ length: count }, (_, i) => ({
                    setNumber: i + 1,
                    setType: i === 0 ? 'WARMUP' : 'TOP_SET',
                    weight: '',
                    reps: '',
                    isSaved: false,
                }));

                set({
                    exerciseSets: { ...state.exerciseSets, [exerciseId]: sets },
                    activeRowMap: { ...state.activeRowMap, [exerciseId]: 0 },
                });
            },

            // Atualiza um campo de uma linha específica
            updateSetEntry: (exerciseId, setIndex, field, value) => {
                const state = get();
                const sets = [...(state.exerciseSets[exerciseId] ?? [])];
                if (!sets[setIndex]) return;

                sets[setIndex] = { ...sets[setIndex], [field]: value };
                set({ exerciseSets: { ...state.exerciseSets, [exerciseId]: sets } });
            },

            // Salva a série ativa e avança para a próxima
            saveCurrentSet: (exerciseId) => {
                const state = get();
                const sets = [...(state.exerciseSets[exerciseId] ?? [])];
                const activeIndex = state.activeRowMap[exerciseId] ?? 0;
                const currentSet = sets[activeIndex];

                if (!currentSet || !currentSet.weight || !currentSet.reps) return;

                // Marca como salva
                sets[activeIndex] = { ...currentSet, isSaved: true };

                // Registra no log
                const logEntry: LoggedSet = {
                    id: `local-${Date.now()}`,
                    exerciseId,
                    setType: currentSet.setType,
                    weight: parseFloat(currentSet.weight),
                    reps: parseInt(currentSet.reps, 10),
                };

                // Avança a linha ativa
                const nextActive = activeIndex + 1;

                set({
                    exerciseSets: { ...state.exerciseSets, [exerciseId]: sets },
                    activeRowMap: { ...state.activeRowMap, [exerciseId]: nextActive },
                    loggedSets: [...state.loggedSets, logEntry],
                });
            },

            // Adiciona uma nova linha de set
            addSetRow: (exerciseId) => {
                const state = get();
                const sets = [...(state.exerciseSets[exerciseId] ?? [])];
                sets.push({
                    setNumber: sets.length + 1,
                    setType: 'TOP_SET',
                    weight: '',
                    reps: '',
                    isSaved: false,
                });
                set({ exerciseSets: { ...state.exerciseSets, [exerciseId]: sets } });
            },

            // ── Edição de série salva ou futura ──
            // Por que guardamos um snapshot antes de editar?
            // Para que o Cancel possa restaurar os dados originais sem queries ao backend.
            startEditingSet: (exerciseId, setIndex) => {
                const state = get();
                const sets = state.exerciseSets[exerciseId] ?? [];
                const original = sets[setIndex] ? { ...sets[setIndex] } : null;
                set({
                    editingRowMap: { ...state.editingRowMap, [exerciseId]: setIndex },
                    editingSnapshot: { ...state.editingSnapshot, [exerciseId]: original },
                });
            },

            cancelEditingSet: (exerciseId) => {
                const state = get();
                const snapshot = state.editingSnapshot[exerciseId];
                const editingIndex = state.editingRowMap[exerciseId];

                if (snapshot !== null && snapshot !== undefined && editingIndex !== null && editingIndex !== undefined) {
                    const sets = [...(state.exerciseSets[exerciseId] ?? [])];
                    sets[editingIndex] = snapshot;
                    set({
                        exerciseSets: { ...state.exerciseSets, [exerciseId]: sets },
                        editingRowMap: { ...state.editingRowMap, [exerciseId]: null },
                        editingSnapshot: { ...state.editingSnapshot, [exerciseId]: null },
                    });
                } else {
                    set({
                        editingRowMap: { ...state.editingRowMap, [exerciseId]: null },
                        editingSnapshot: { ...state.editingSnapshot, [exerciseId]: null },
                    });
                }
            },

            confirmEditSet: (exerciseId, setIndex) => {
                const state = get();
                const sets = [...(state.exerciseSets[exerciseId] ?? [])];
                if (!sets[setIndex]) return;

                const updatedSet = { ...sets[setIndex], isSaved: true };
                sets[setIndex] = updatedSet;

                // Sincroniza loggedSets: atualiza a entrada correspondente pelo índice relativo
                // entre séries salvas do mesmo exercício, para que o volume do resumo fique correto.
                const savedIndexAmongSaved = sets
                    .slice(0, setIndex + 1)
                    .filter((s) => s.isSaved).length - 1;

                const loggedForExercise = state.loggedSets
                    .map((ls, i) => ({ ls, i }))
                    .filter(({ ls }) => ls.exerciseId === exerciseId);

                const targetLog = loggedForExercise[savedIndexAmongSaved];

                let newLoggedSets = state.loggedSets;
                if (targetLog) {
                    newLoggedSets = state.loggedSets.map((ls, i) =>
                        i === targetLog.i
                            ? {
                                  ...ls,
                                  weight: parseFloat(updatedSet.weight) || ls.weight,
                                  reps: parseInt(updatedSet.reps, 10) || ls.reps,
                                  setType: updatedSet.setType,
                              }
                            : ls
                    );
                }

                set({
                    exerciseSets: { ...state.exerciseSets, [exerciseId]: sets },
                    loggedSets: newLoggedSets,
                    editingRowMap: { ...state.editingRowMap, [exerciseId]: null },
                    editingSnapshot: { ...state.editingSnapshot, [exerciseId]: null },
                });
            },

            // Rest Timer
            startRestTimer: (seconds) => {
                set({ restTimerEnd: Date.now() + seconds * 1000 });
            },

            clearRestTimer: () => {
                set({ restTimerEnd: null });
            },
        }),
        {
            name: 'workout-storage',
        }
    )
);
