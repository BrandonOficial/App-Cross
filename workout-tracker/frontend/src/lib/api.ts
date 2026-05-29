// src/lib/api.ts
import { useAuthStore } from '../features/auth/store/useAuthStore';

const BASE_URL = 'http://localhost:3000/api';

// ─── Tipos compartilhados ───

export interface Exercise {
    id: string;
    name: string;
    muscleGroup: string;
    createdAt: string;
}

export interface RoutineExercise {
    id: string;
    routineId: string;
    exerciseId: string;
    order: number;
    exercise: Exercise;
}

export interface Routine {
    id: string;
    userId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    exercises: RoutineExercise[];
}

export interface WorkoutSet {
    id: string;
    sessionId: string;
    exerciseId: string;
    setType: string;
    weight: number;
    reps: number;
    rpe: number | null;
    completedAt: string;
    exercise?: Exercise;
}

export interface WorkoutSession {
    id: string;
    userId: string;
    routineId: string | null;
    startTime: string;
    endTime: string | null;
    routine?: Routine | null;
    sets?: WorkoutSet[];
}

export interface ExerciseProgressPoint {
    date: string;
    maxWeight: number;
}

// ─── Helper para requisições ───

let isRefreshing = false;
let refreshPromise: Promise<AuthResponse | null> | null = null;

async function tryRefreshToken(): Promise<AuthResponse | null> {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) return null;

    try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) return null;

        const data: AuthResponse = await res.json();

        // Atualiza o store com os novos tokens
        useAuthStore.getState().setAuth(data.accessToken, data.user, data.refreshToken);
        return data;
    } catch {
        return null;
    }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const token = useAuthStore.getState().token;

    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options?.headers,
        },
    });

    if (!response.ok) {
        // Por que capturamos o erro 401 (Unauthorized) aqui de forma global?
        // Para centralizar a lógica de Refresh Token (Sliding Session).
        // Assim, nenhuma requisição do frontend precisa saber como lidar com token expirado.
        if (response.status === 401) {
            // Por que usamos um semáforo (isRefreshing) e uma Promise (refreshPromise)?
            // Para resolver a condição de corrida (Race Condition). Se a tela carregar 5 gráficos
            // simultâneos e o token tiver expirado, todas as 5 requisições dariam 401 ao mesmo tempo.
            // O semáforo garante que faremos apenas 1 requisição de refresh, e as outras 4 aguardarão.
            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = tryRefreshToken();
            }

            const refreshResult = await refreshPromise;
            isRefreshing = false;
            refreshPromise = null;

            if (refreshResult) {
                // Como o refresh foi bem sucedido, nós aplicamos um "Retry" transparente da requisição original.
                // O usuário nunca percebe que o token expirou no meio do uso.
                const retryResponse = await fetch(url, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${refreshResult.accessToken}`,
                        ...options?.headers,
                    },
                });

                if (retryResponse.ok) {
                    return retryResponse.json();
                }
            }

            // Por que fazemos o logout compulsório se o refresh falhou?
            // Porque significa que a sessão expirou completamente por inatividade (ou token revogado no backend).
            // Limpar a store do Zustand (clearAuth) força a árvore de rotas (ProtectedRoutes) a jogar o usuário para a tela de Login.
            useAuthStore.getState().clearAuth();
        }

        const errorBody = await response.text();
        throw new Error(`API Error ${response.status}: ${errorBody}`);
    }

    if (response.status === 204) {
        return {} as T;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
}

// ─── Auth ───

export interface AuthResponse {
    user: { id: string; email: string; name: string };
    accessToken: string;
    refreshToken: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    height: number | null;
    weight: number | null;
    createdAt: string;
}

export function login(data: { email: string; password: string }): Promise<AuthResponse> {
    return request<AuthResponse>(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function register(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    return request<AuthResponse>(`${BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function getProfile(): Promise<UserProfile> {
    return request<UserProfile>(`${BASE_URL}/users/me`);
}

export function updateProfile(data: { name?: string; height?: number; weight?: number }): Promise<UserProfile> {
    return request<UserProfile>(`${BASE_URL}/users/me`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export function logout(): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`${BASE_URL}/auth/logout`, {
        method: 'POST',
    });
}

// ─── Exercises ───

export function fetchExercises(filters?: { muscleGroup?: string; search?: string }): Promise<Exercise[]> {
    const params = new URLSearchParams();
    if (filters?.muscleGroup) params.set('muscleGroup', filters.muscleGroup);
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Exercise[]>(`${BASE_URL}/exercises${query}`);
}

export function createExercise(data: { name: string; muscleGroup: string }): Promise<Exercise> {
    return request<Exercise>(`${BASE_URL}/exercises`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function deleteExercise(id: string): Promise<void> {
    return request<void>(`${BASE_URL}/exercises/${id}`, {
        method: 'DELETE',
    });
}

// ─── Routines ───

export function fetchRoutines(): Promise<Routine[]> {
    return request<Routine[]>(`${BASE_URL}/routines`);
}

export function createRoutine(data: {
    name: string;
    exercises: { exerciseId: string; order: number }[];
}): Promise<Routine> {
    return request<Routine>(`${BASE_URL}/routines`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function updateRoutine(id: string, data: {
    name?: string;
    exercises?: { exerciseId: string; order: number }[];
}): Promise<Routine> {
    return request<Routine>(`${BASE_URL}/routines/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export function deleteRoutine(id: string): Promise<void> {
    return request<void>(`${BASE_URL}/routines/${id}`, {
        method: 'DELETE',
    });
}

// ─── Workouts ───

export function startWorkoutSession(routineId?: string): Promise<WorkoutSession> {
    return request<WorkoutSession>(`${BASE_URL}/workouts/sessions`, {
        method: 'POST',
        body: JSON.stringify({ routineId }),
    });
}

export function logWorkoutSet(sessionId: string, data: {
    exerciseId: string;
    setType: string;
    weight: number;
    reps: number;
    rpe?: number;
}): Promise<WorkoutSet> {
    return request<WorkoutSet>(`${BASE_URL}/workouts/sessions/${sessionId}/sets`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function finishWorkoutSession(sessionId: string): Promise<WorkoutSession> {
    return request<WorkoutSession>(`${BASE_URL}/workouts/sessions/${sessionId}/finish`, {
        method: 'PUT',
    });
}

// ─── History ───

export function fetchSessionsHistory(): Promise<WorkoutSession[]> {
    return request<WorkoutSession[]>(`${BASE_URL}/history/sessions`);
}

export function fetchExerciseProgress(exerciseId: string): Promise<ExerciseProgressPoint[]> {
    return request<ExerciseProgressPoint[]>(`${BASE_URL}/history/exercises/${exerciseId}/progress`);
}

export function fetchSessionDetail(sessionId: string): Promise<LatestSession> {
    return request<LatestSession>(`${BASE_URL}/workouts/sessions/${sessionId}`);
}

// ─── Dashboard Summary ───

export interface DashboardSummary {
    totalSessions: number;
    weeklyVolume: number;
    dailyVolumes: Record<string, number>;
    currentStreak: number;
    estimatedCalories: number;
}

export interface LatestSession extends WorkoutSession {
    totalVolume: number;
    durationMinutes: number | null;
}

export function fetchDashboardSummary(): Promise<DashboardSummary> {
    return request<DashboardSummary>(`${BASE_URL}/workouts/summary`);
}

export function fetchLatestSession(): Promise<LatestSession | null> {
    return request<LatestSession | null>(`${BASE_URL}/workouts/sessions/latest`);
}
