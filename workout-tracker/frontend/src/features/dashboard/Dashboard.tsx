import { DashboardHeader } from './components/DashboardHeader';
import { HeroBanner } from './components/HeroBanner';
import { WeeklyProgress } from './components/WeeklyProgress';
import { StatsOverview } from './components/StatsOverview';
import { LastSession } from './components/LastSession';
import { StreakRing } from './components/StreakRing';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '@/lib/api';
import type { DashboardSummary } from '@/lib/api';

export function Dashboard() {
    const navigate = useNavigate();

    const { data: summary } = useQuery<DashboardSummary>({
        queryKey: ['dashboard-summary'],
        queryFn: fetchDashboardSummary,
        staleTime: 60 * 1000,
    });

    return (
        <div className="flex flex-col gap-5 relative">
            {/* Fluid Glows */}
            <div className="fluid-glow fluid-glow--primary-tl" />
            <div className="fluid-glow fluid-glow--primary-br" />

            <DashboardHeader />
            <HeroBanner />
            <StreakRing current={summary?.currentStreak ?? 0} />
            <WeeklyProgress />
            <StatsOverview />
            <LastSession />

            {/* Floating Action Button */}
            <button
                onClick={() => navigate('/app/routines')}
                className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_0_25px_rgba(230,0,35,0.5)] hover:shadow-[0_0_35px_rgba(230,0,35,0.7)] hover:scale-105 transition-all active:scale-95"
            >
                <Plus className="w-7 h-7" strokeWidth={3} />
            </button>
        </div>
    );
}
