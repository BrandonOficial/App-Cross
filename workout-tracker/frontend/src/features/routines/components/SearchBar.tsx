import { Search } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
            <input
                type="text"
                placeholder="Search exercises..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm font-medium text-white placeholder:text-muted-foreground/40 outline-none focus:border-primary/40 transition-colors"
            />
        </div>
    );
}
