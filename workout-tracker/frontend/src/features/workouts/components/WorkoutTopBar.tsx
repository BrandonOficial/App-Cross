import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { AddExerciseModal } from './AddExerciseModal';

export function WorkoutTopBar() {
    const { routine, finishWorkout } = useWorkoutStore();
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);

    const handleClose = () => {
        if (confirm('Deseja sair do treino? Suas séries salvas não serão perdidas.')) {
            finishWorkout();
            navigate('/app/dashboard');
        }
    };

    return (
        <>
            <div className="flex items-center justify-between py-3">
                <button onClick={handleClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors">
                    <X className="w-5 h-5 text-white" />
                </button>

                <h1 className="text-sm font-extrabold tracking-[0.08em] uppercase text-center flex-1 truncate px-2">
                    {routine?.name || 'Treino Livre'}
                </h1>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
                >
                    <Plus className="w-5 h-5 text-primary" />
                </button>
            </div>

            {showAddModal && (
                <AddExerciseModal onClose={() => setShowAddModal(false)} />
            )}
        </>
    );
}
