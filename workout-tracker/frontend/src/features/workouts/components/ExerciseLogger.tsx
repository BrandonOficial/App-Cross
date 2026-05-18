import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SetRow } from './SetRow';
import { Dumbbell } from 'lucide-react';

interface ExerciseLoggerProps {
    exerciseInfo: {
        id: string; // RoutineExercise ID or Exercise ID depending on join
        exercise: {
            id: string;
            name: string;
        }
    }
}

export function ExerciseLogger({ exerciseInfo }: ExerciseLoggerProps) {
    const exercise = exerciseInfo.exercise;
    
    // Para simplificar o MVP, renderizamos 4 linhas fixas de séries para o usuário preencher.
    const setsToRender = [1, 2, 3, 4];

    return (
        <Card className="glass-card mb-6 border-white/10 shadow-lg">
            <CardHeader className="pb-3 border-b border-white/5 mb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Dumbbell className="text-primary w-5 h-5" />
                    {exercise.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Headers da tabela */}
                <div className="grid grid-cols-12 gap-2 items-center mb-2 px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-4">Tipo</div>
                    <div className="col-span-2 text-center">kg</div>
                    <div className="col-span-2 text-center">Reps</div>
                    <div className="col-span-3 text-center">Ação</div>
                </div>

                {setsToRender.map((setNum) => (
                    <SetRow key={setNum} setNumber={setNum} exerciseId={exercise.id} />
                ))}
            </CardContent>
        </Card>
    );
}
