import Link from "next/link";

export function EquityDistribution() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Equity Distribution
                </h3>
                <Link
                    href="/issuer/cap-table"
                    className="text-primary text-sm font-semibold hover:underline"
                >
                    View Cap Table
                </Link>
            </div>
            <div className="h-48 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent" />
                <div className="z-10 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
                        pie_chart
                    </span>
                    <p className="text-slate-400 text-sm">
                        Interactive Cap Table Map Visualization
                    </p>
                </div>
            </div>
        </div>
    );
}
