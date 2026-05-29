import { ChevronRight } from 'lucide-react';
// Mapeia imagens para exercícios conhecidos
const EXERCISE_IMAGES: Record<string, string> = {
    'supino': '/exercise-bench.png',
    'bench': '/exercise-bench.png',
    'pull': '/exercise-pullup.png',
    'barra': '/exercise-pullup.png',
    'squat': '/exercise-squat.png',
    'agachamento': '/exercise-squat.png',
    'leg': '/exercise-squat.png',
};

function getExerciseImage(name: string): string {
    const lowerName = name.toLowerCase();
    
    // Por que usamos um iterador manual com 'includes'?
    // Porque o nome dos exercícios vem do banco e pode variar na escrita (ex: "Supino Inclinado", "Supino Reto").
    // O 'includes' garante o match pelo radical da palavra, evitando a necessidade de um relacionamento 
    // complexo 1-1 entre o banco e as imagens neste momento do projeto.
    for (const [key, img] of Object.entries(EXERCISE_IMAGES)) {
        if (lowerName.includes(key)) return img;
    }
    return '/exercise-bench.png'; // fallback seguro para manter o grid preenchido
}

interface ExerciseCardProps {
    exercise: {
        id: string;
        name: string;
        muscleGroup?: string;
        type?: string;
    };
    onSelect?: (exercise: ExerciseCardProps['exercise']) => void;
}

export function ExerciseCard({ exercise, onSelect }: ExerciseCardProps) {
    const image = getExerciseImage(exercise.name);
    const category = exercise.muscleGroup || 'Geral';
    const type = exercise.type || 'Compound';

    return (
        <button
            onClick={() => onSelect?.(exercise)}
            className="w-full glass-card overflow-hidden flex items-center gap-0 group hover:bg-white/[0.07] transition-all active:scale-[0.98]"
        >
            {/* Exercise Image */}
            <div className="w-24 h-24 flex-shrink-0 overflow-hidden relative">
                <img
                    src={image}
                    alt={exercise.name}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 px-4 py-3 text-left">
                <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-primary mb-1">
                    {category} • {type}
                </p>
                <h3 className="text-base font-bold leading-tight">
                    {exercise.name}
                </h3>
            </div>

            {/* Chevron */}
            <ChevronRight className="w-5 h-5 text-muted-foreground/40 mr-4 flex-shrink-0 group-hover:text-white/60 transition-colors" />
        </button>
    );
}
