import { Card } from '@/components/ui/card';

export function ProgressChartPlaceholder() {
    return (
        <div className="mt-2">
            <h2 className="text-xl font-bold mb-4">Progresso de Cargas</h2>
            <Card className="glass-card h-48 flex items-center justify-center border-white/5">
                <p className="text-muted-foreground text-sm font-medium">Gráfico Recharts será renderizado aqui</p>
            </Card>
        </div>
    );
}
