import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { logWorkoutSet } from '@/lib/api';
import { useWorkoutStore } from '../store/useWorkoutStore';
import type { LoggedSet } from '../store/useWorkoutStore';

interface SetRowProps {
    exerciseId: string;
    setNumber: number;
}

export function SetRow({ exerciseId, setNumber }: SetRowProps) {
    const { sessionId, addLoggedSet } = useWorkoutStore();
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [setType, setSetType] = useState('WORKING');
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = async () => {
        if (!weight || !reps || !sessionId) return;
        
        try {
            setIsSaving(true);
            const data = {
                exerciseId,
                setType,
                weight: parseFloat(weight),
                reps: parseInt(reps, 10),
            };
            
            // Registra no Backend
            const savedSet = await logWorkoutSet(sessionId, data);
            
            // Registra na Store Client-side
            const loggedSetEntry: LoggedSet = {
                id: savedSet.id,
                exerciseId: savedSet.exerciseId,
                setType: savedSet.setType,
                weight: Number(savedSet.weight),
                reps: savedSet.reps,
                ...(savedSet.rpe !== null ? { rpe: savedSet.rpe } : {}),
            };
            addLoggedSet(loggedSetEntry);
            setIsSaved(true);
        } catch (error) {
            alert("Erro ao salvar série");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={`grid grid-cols-12 gap-2 items-center mb-2 p-2 rounded-lg transition-colors ${isSaved ? 'bg-primary/10 border border-primary/20' : 'bg-white/5'}`}>
            <div className="col-span-1 text-center font-bold text-muted-foreground">{setNumber}</div>
            
            <div className="col-span-4">
                <Select disabled={isSaved} value={setType} onValueChange={setSetType}>
                    <SelectTrigger className="h-8 text-xs bg-transparent border-white/10">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="WARMUP">Aquecimento</SelectItem>
                        <SelectItem value="WORKING">Padrão</SelectItem>
                        <SelectItem value="TOP_SET">Top Set</SelectItem>
                        <SelectItem value="BACK_OFF">Redução</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="col-span-2">
                <Input 
                    disabled={isSaved}
                    type="number" 
                    placeholder="kg" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="h-8 text-center bg-transparent border-white/10" 
                />
            </div>
            
            <div className="col-span-2">
                <Input 
                    disabled={isSaved}
                    type="number" 
                    placeholder="reps" 
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="h-8 text-center bg-transparent border-white/10" 
                />
            </div>
            
            <div className="col-span-3">
                <Button 
                    disabled={isSaved || isSaving || !weight || !reps} 
                    onClick={handleSave} 
                    size="sm" 
                    className={`w-full h-8 text-xs ${isSaved ? 'bg-green-600 text-white' : ''}`}
                >
                    {isSaved ? '✓' : 'Salvar'}
                </Button>
            </div>
        </div>
    );
}
