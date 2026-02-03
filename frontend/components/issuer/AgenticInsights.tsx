interface Insight {
    type: "demand" | "treasury" | "buyback";
    title: string;
    description: string;
    timestamp: string;
}

interface AgenticInsightsProps {
    insights?: Insight[];
}

const defaultInsights: Insight[] = [
    {
        type: "demand",
        title: "Demand High: Consider Issuance",
        description:
            "Secondary market volume is up 22%. Optimal pricing window detected.",
        timestamp: "2m ago",
    },
    {
        type: "treasury",
        title: "Surplus Balance: Dividend Recommended",
        description:
            "Treasury cash exceeds operational buffer by $4.2M. Recommend $1.20/share distribution.",
        timestamp: "15m ago",
    },
    {
        type: "buyback",
        title: "Price Dip: Strategic Buyback",
        description:
            "Equity trading 5% below NAV. Repurchasing 50k shares would be EPS accretive.",
        timestamp: "1h ago",
    },
];

const insightColors = {
    demand: "text-primary",
    treasury: "text-emerald-400",
    buyback: "text-rose-400",
};

const insightLabels = {
    demand: "Market Demand",
    treasury: "Treasury Optimization",
    buyback: "Buyback Opportunity",
};

export function AgenticInsights({ insights = defaultInsights }: AgenticInsightsProps) {
    return (
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-8xl">smart_toy</span>
            </div>

            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-lg font-bold">Agentic Insights</h2>
            </div>

            {/* Insights */}
            <div className="flex flex-col gap-4">
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-primary/50 transition-colors cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span
                                className={`text-xs font-bold uppercase tracking-widest ${insightColors[insight.type]}`}
                            >
                                {insightLabels[insight.type]}
                            </span>
                            <span className="text-[10px] text-white/40">
                                {insight.timestamp}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-white/90">{insight.title}</p>
                        <p className="text-xs text-white/50 mt-1">{insight.description}</p>
                        <div
                            className={`mt-3 flex items-center gap-1 ${insightColors[insight.type]} text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity`}
                        >
                            Take Action{" "}
                            <span className="material-symbols-outlined text-xs">
                                arrow_forward
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* View Logs Button */}
            <button className="w-full mt-6 py-2 text-xs font-bold text-white/60 hover:text-white border border-white/20 rounded-lg transition-colors">
                View Autonomous Logs
            </button>
        </div>
    );
}
