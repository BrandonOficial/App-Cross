import { Dumbbell, Target } from 'lucide-react';

export function PerformanceCards() {
    return (
        // Utilizamos um grid rígido de 2 colunas para manter a simetria visual no mobile,
        // garantindo que as métricas cruciais de performance fiquem sempre lado a lado sem exigir scroll.
        <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Previous Performance */}
            <div className="glass-card p-4 flex flex-col gap-2">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">
                    Performance Anterior
                </p>
                {/* 
                  Estes valores (95 KG e RPE) estão hardcoded temporariamente. 
                  Optamos por validar a usabilidade (UX) e o contraste do design primeiro 
                  antes de acoplar a query pesada que busca o histórico do usuário no backend.
                */}
                <p className="text-2xl font-extrabold tracking-tight">
                    95 KG <span className="text-base font-bold text-muted-foreground">x 6</span>
                </p>
            </div>

            {/* RPE Target */}
            <div className="glass-card p-4 flex flex-col gap-2">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">
                    RPE Alvo
                </p>
                <p className="text-2xl font-extrabold tracking-tight">
                    9.0
                </p>
            </div>
        </div>
    );
}
