import { useExerciseProgress } from '../hooks/useHistory';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

export function AnalyticsChart() {
    // Para simplificar o MVP, vamos fixar o exerciseId do banco que criamos no seed.
    // Num app real, colocaríamos um Select aqui para o usuário escolher o exercício.
    const TEST_EXERCISE_ID = '67aab80a-d0fa-42a4-b46a-1e69997570cb';
    
    const { data: progressData, isLoading } = useExerciseProgress(TEST_EXERCISE_ID);

    return (
        <div className="mt-4">
            <h3 className="text-lg font-bold mb-4">Progresso: Supino Reto (Top Set)</h3>
            
            <Card className="glass-card p-4 border-white/5 h-[300px] flex items-center justify-center">
                {isLoading ? (
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                ) : !progressData || progressData.length === 0 ? (
                    <p className="text-muted-foreground">Sem dados suficientes.</p>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={progressData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                stroke="#767676" 
                                fontSize={10} 
                                tickMargin={10}
                                tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis 
                                stroke="#767676" 
                                fontSize={10} 
                                tickMargin={10}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#131313', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#E60023', fontWeight: 'bold' }}
                                formatter={(value: any) => [`${value} kg`, 'Max Weight']}
                                labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="maxWeight" 
                                stroke="#E60023" 
                                strokeWidth={3} 
                                dot={{ fill: '#E60023', r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </Card>
        </div>
    );
}
