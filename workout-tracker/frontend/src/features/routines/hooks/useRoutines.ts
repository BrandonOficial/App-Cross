// src/features/routines/hooks/useRoutines.ts
import { useQuery } from '@tanstack/react-query';
import { fetchRoutines } from '@/lib/api';

export function useRoutines() {
    return useQuery({
        queryKey: ['routines'],
        queryFn: () => fetchRoutines(),
    });
}
