import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

export function QuickStartAction() {
    return (
        <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full h-16 rounded-2xl text-lg font-bold shadow-[0_0_20px_rgba(230,0,35,0.4)] hover:shadow-[0_0_30px_rgba(230,0,35,0.6)] transition-all">
                <Play className="w-6 h-6 mr-2 fill-current" />
                Iniciar Treino Livre
            </Button>
        </div>
    );
}
