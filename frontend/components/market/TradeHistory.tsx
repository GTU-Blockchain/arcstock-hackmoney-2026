import { Trade } from "@/types";

interface TradeHistoryProps {
    trades?: Trade[];
}

const defaultTrades: Trade[] = [
    { id: "1", price: 142.68, size: 24.5, side: "buy", timestamp: new Date() },
    {
        id: "2",
        price: 142.65,
        size: 112.0,
        side: "sell",
        timestamp: new Date(Date.now() - 15000),
    },
    {
        id: "3",
        price: 142.66,
        size: 15.2,
        side: "buy",
        timestamp: new Date(Date.now() - 68000),
    },
    {
        id: "4",
        price: 142.67,
        size: 50.0,
        side: "buy",
        timestamp: new Date(Date.now() - 85000),
    },
];

export function TradeHistory({ trades = defaultTrades }: TradeHistoryProps) {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-4 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Trade History
            </h3>
            <table className="w-full text-[11px]">
                <thead>
                    <tr className="text-slate-400 text-left">
                        <th className="pb-2 font-medium">Price</th>
                        <th className="pb-2 font-medium">Size</th>
                        <th className="pb-2 font-medium text-right">Time</th>
                    </tr>
                </thead>
                <tbody className="text-slate-600 dark:text-slate-400">
                    {trades.map((trade) => (
                        <tr
                            key={trade.id}
                            className="border-b border-slate-50 dark:border-slate-800/50"
                        >
                            <td
                                className={`py-1 ${trade.side === "buy" ? "text-success" : "text-danger"
                                    }`}
                            >
                                {trade.price.toFixed(2)}
                            </td>
                            <td className="py-1">{trade.size.toFixed(1)}</td>
                            <td className="py-1 text-right">{formatTime(trade.timestamp)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
