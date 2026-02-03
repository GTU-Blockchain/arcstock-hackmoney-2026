import { InvestorHeader } from "@/components/layout/InvestorHeader";
import { PortfolioStats } from "@/components/investor/PortfolioStats";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const holdings = [
    {
        id: "1",
        company: "Tesla Inc.",
        ticker: "TSLA-EQ",
        shares: 150,
        avgPrice: 138.50,
        currentPrice: 142.68,
        value: 21402,
        change: 3.02,
    },
    {
        id: "2",
        company: "SpaceX",
        ticker: "SPACEX-EQ",
        shares: 50,
        avgPrice: 95.00,
        currentPrice: 102.40,
        value: 5120,
        change: 7.79,
    },
    {
        id: "3",
        company: "Stripe",
        ticker: "STRIPE-EQ",
        shares: 200,
        avgPrice: 45.20,
        currentPrice: 48.90,
        value: 9780,
        change: 8.19,
    },
];

export default function PortfolioPage() {
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.shares * h.avgPrice, 0);
    const totalGain = totalValue - totalCost;
    const totalGainPct = ((totalValue - totalCost) / totalCost) * 100;

    return (
        <div className="min-h-screen bg-slate-950">
            <InvestorHeader />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-white text-3xl font-bold mb-2">Portfolio</h1>
                    <p className="text-slate-400">
                        Manage your equity holdings across all chains
                    </p>
                </div>

                {/* Portfolio Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                            Total Value
                        </p>
                        <p className="text-white text-3xl font-bold">
                            ${totalValue.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                            Total Gain/Loss
                        </p>
                        <p className={`text-3xl font-bold ${totalGain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {totalGain >= 0 ? "+" : ""}${totalGain.toLocaleString()}
                        </p>
                        <p className={`text-sm ${totalGain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {totalGainPct >= 0 ? "+" : ""}{totalGainPct.toFixed(2)}%
                        </p>
                    </div>
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                            Holdings
                        </p>
                        <p className="text-white text-3xl font-bold">{holdings.length}</p>
                    </div>
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                            Dividends Received
                        </p>
                        <p className="text-white text-3xl font-bold">$842</p>
                    </div>
                </div>

                {/* Holdings Table */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-white text-xl font-bold">Your Holdings</h2>
                        <Button variant="secondary" size="sm">
                            <span className="material-symbols-outlined text-sm mr-2">download</span>
                            Export
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">
                                        Company
                                    </th>
                                    <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">
                                        Shares
                                    </th>
                                    <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">
                                        Avg. Price
                                    </th>
                                    <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">
                                        Current Price
                                    </th>
                                    <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">
                                        Value
                                    </th>
                                    <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">
                                        Change
                                    </th>
                                    <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {holdings.map((holding) => (
                                    <tr
                                        key={holding.id}
                                        className="border-b border-slate-800/50 hover:bg-slate-800/30"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-white font-medium">{holding.company}</p>
                                                <p className="text-slate-400 text-sm">{holding.ticker}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-white">
                                            {holding.shares}
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-400">
                                            ${holding.avgPrice.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-white font-medium">
                                            ${holding.currentPrice.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-white font-bold">
                                            ${holding.value.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Badge variant={holding.change >= 0 ? "success" : "danger"}>
                                                {holding.change >= 0 ? "+" : ""}{holding.change.toFixed(2)}%
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm">Buy</Button>
                                                <Button variant="ghost" size="sm">Sell</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
