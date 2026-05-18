import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MobileLayout } from './components/layout/MobileLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { RoutinesScreen } from './features/routines/RoutinesScreen';
import { ActiveWorkoutScreen } from './features/workouts/ActiveWorkoutScreen';
import { HistoryScreen } from './features/history/HistoryScreen';
import { SessionDetailScreen } from './features/history/SessionDetailScreen';
import { ProfileScreen } from './features/profile/ProfileScreen';
import { LoginScreen } from './features/auth/LoginScreen';
import { RegisterScreen } from './features/auth/RegisterScreen';
import { useAuthStore } from './features/auth/store/useAuthStore';

const queryClient = new QueryClient();

// Guard for protected routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Guard to prevent logged in users from seeing login/register
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
        <div className="bg-background min-h-screen text-foreground antialiased font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<PublicOnlyRoute><LoginScreen /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><RegisterScreen /></PublicOnlyRoute>} />

            {/* Active Workout Route (No bottom nav) */}
            <Route path="/app/workout/active" element={
              <ProtectedRoute>
                <ActiveWorkoutScreen />
              </ProtectedRoute>
            } />

            {/* Protected App Routes with Bottom Navigation */}
            <Route path="/app" element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="routines" element={<RoutinesScreen />} />
              <Route path="history" element={<HistoryScreen />} />
              <Route path="history/:sessionId" element={<SessionDetailScreen />} />
              <Route path="profile" element={<ProfileScreen />} />
            </Route>
          </Routes>
        </div>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
