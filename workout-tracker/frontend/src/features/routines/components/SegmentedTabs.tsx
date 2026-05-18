interface SegmentedTabsProps {
    tabs: string[];
    activeTab: string;
    onChange: (tab: string) => void;
}

export function SegmentedTabs({ tabs, activeTab, onChange }: SegmentedTabsProps) {
    return (
        <div className="flex bg-white/[0.04] rounded-xl p-1 mb-5 border border-white/[0.06]">
            {tabs.map((tab) => {
                const isActive = tab === activeTab;
                return (
                    <button
                        key={tab}
                        onClick={() => onChange(tab)}
                        className={`flex-1 text-[11px] font-bold tracking-[0.15em] uppercase py-2.5 rounded-lg transition-all ${
                            isActive
                                ? 'bg-primary text-white shadow-[0_0_15px_rgba(230,0,35,0.3)]'
                                : 'text-muted-foreground hover:text-white/70'
                        }`}
                    >
                        {tab}
                    </button>
                );
            })}
        </div>
    );
}
