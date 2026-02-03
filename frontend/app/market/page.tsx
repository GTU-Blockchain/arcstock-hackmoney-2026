import { Header } from "@/components/layout/Header";
import { PriceChart } from "@/components/market/PriceChart";
import { OrderBook } from "@/components/market/OrderBook";
import { TradeHistory } from "@/components/market/TradeHistory";
import { MarketDepth } from "@/components/market/MarketDepth";
import { OrderPanel } from "@/components/market/OrderPanel";
import { Badge } from "@/components/ui/Badge";

export default function MarketPage() {
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
            <Header variant="app" />

            {/* Ticker Bar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3">
                <div className="max-w-[1600px] mx-auto flex flex-wrap items-center gap-6">
                    {/* Pair */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">
                                corporate_fare
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                                    TSLA-EQ
                                </h1>
                                <Badge variant="success" size="sm">
                                    Active
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-400">Tesla Inc. • RWA Equity</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-8 ml-auto">
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 tracking-wider">
                                Last Price
                            </p>
                            <p className="text-lg font-black text-success">$142.68</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 tracking-wider">
                                24h Change
                            </p>
                            <p className="text-lg font-bold text-success">+2.56%</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 tracking-wider">
                                24h Volume
                            </p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                $1.2M
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 tracking-wider">
                                Market Cap
                            </p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                $2.4B
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4">
                <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
                    {/* Left: Order Book + Depth */}
                    <div className="col-span-12 lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <OrderBook />
                        <MarketDepth />
                    </div>

                    {/* Center: Chart + Trade History */}
                    <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
                        {/* Chart */}
                        <div className="flex-[3] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <PriceChart />
                        </div>
                        {/* Trade History */}
                        <div className="flex-[2] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <TradeHistory />
                        </div>
                    </div>

                    {/* Right: Order Panel */}
                    <div className="col-span-12 lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <OrderPanel />
                    </div>
                </div>
            </main>
        </div>
    );
}
