export function PriceChart() {
    const timeframes = ["1H", "4H", "1D", "1W", "ALL"];

    return (
        <div className="bg-white dark:bg-slate-900 p-6 relative overflow-hidden">
            {/* Timeframe Selector */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {timeframes.map((tf, index) => (
                        <button
                            key={tf}
                            className={`px-3 py-1 text-xs font-${index === 0 ? "bold" : "medium"} rounded ${index === 0
                                    ? "bg-white dark:bg-slate-700 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-sm">show_chart</span>
                    </button>
                    <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-sm">settings</span>
                    </button>
                </div>
            </div>

            {/* Chart Bars */}
            <div className="w-full h-64 flex items-end justify-between gap-1 mt-4">
                {[60, 40, 55, 70, 85, 75, 90, 80, 95].map((height, index) => (
                    <div
                        key={index}
                        className={`flex-1 rounded-t ${index < 4
                                ? "bg-slate-100 dark:bg-slate-800"
                                : "bg-primary/20 border-t-2 border-primary"
                            }`}
                        style={{ height: `${height}%` }}
                    />
                ))}
            </div>

            {/* Trend Line Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <svg
                    className="w-full h-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 800 400"
                >
                    <path
                        className="text-primary"
                        d="M0,350 Q100,320 200,340 T400,280 T600,310 T800,200"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                </svg>
            </div>
        </div>
    );
}
