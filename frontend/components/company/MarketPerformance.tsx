interface MarketPerformanceProps {
    volume24h: number;
    currentPrice: number;
    marketCap: number;
}

export function MarketPerformance({
    volume24h,
    currentPrice,
    marketCap,
}: MarketPerformanceProps) {
    const formatMarketCap = (value: number) => {
        if (value >= 1000000000) {
            return `$${(value / 1000000000).toFixed(2)} Billion`;
        }
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(2)} Million`;
        }
        return `$${value.toLocaleString()}`;
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                Market Performance
            </h3>
            <div className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">24h Volume</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                        ${volume24h.toLocaleString()} USDC
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Current Share Price</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                        ${currentPrice.toFixed(2)} USDC
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Market Cap</span>
                    <span className="font-bold text-primary">{formatMarketCap(marketCap)}</span>
                </div>
                <div className="h-[2px] bg-slate-100 dark:bg-slate-800 w-full" />
                <button className="w-full text-xs font-bold text-slate-500 uppercase tracking-widest text-center hover:text-primary transition-colors">
                    Trading Analytics →
                </button>
            </div>
        </div>
    );
}
