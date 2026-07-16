import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    // Duração do timer de descanso em segundos
    restTimerDuration: number;
    setRestTimerDuration: (seconds: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            restTimerDuration: 45,
            setRestTimerDuration: (seconds) => set({ restTimerDuration: seconds }),
        }),
        {
            name: 'velocity-settings',
        }
    )
);
