import { OrderBookEntry } from "@/types";

interface OrderBookProps {
    asks?: OrderBookEntry[];
    bids?: OrderBookEntry[];
    currentPrice?: number;
}

const defaultAsks: OrderBookEntry[] = [
    { price: 142.92, size: 452.1, total: 64600 },
    { price: 142.88, size: 120.0, total: 17100 },
    { price: 142.75, size: 1024.0, total: 146100 },
];

const defaultBids: OrderBookEntry[] = [
    { price: 142.62, size: 340.5, total: 48500 },
    { price: 142.55, size: 890.0, total: 126800 },
    { price: 142.48, size: 210.0, total: 29900 },
];

export function OrderBook({
    asks = defaultAsks,
    bids = defaultBids,
    currentPrice = 142.68,
}: OrderBookProps) {
    const maxTotal = Math.max(
        ...asks.map((a) => a.total),
        ...bids.map((b) => b.total)
    );

    return (
        <div className="flex-1 p-4 flex flex-col border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Order Book
            </h3>

            {/* Header */}
            <div className="flex justify-between text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-tighter">
                <span>Price (USDC)</span>
                <span>Size (EQ)</span>
                <span>Total</span>
            </div>

            {/* Asks (Sells) */}
            <div className="flex flex-col-reverse mb-3">
                {asks.map((ask, index) => (
                    <div
                        key={index}
                        className="order-book-row flex justify-between py-1 text-[12px] relative group cursor-pointer"
                    >
                        <div
                            className="absolute right-0 inset-y-0 bg-danger/5"
                            style={{ width: `${(ask.total / maxTotal) * 100}%` }}
                        />
                        <span className="text-danger z-10">{ask.price.toFixed(2)}</span>
                        <span className="z-10">{ask.size.toFixed(1)}</span>
                        <span className="z-10 text-slate-400">
                            {(ask.total / 1000).toFixed(1)}k
                        </span>
                    </div>
                ))}
            </div>

            {/* Current Price */}
            <div className="bg-slate-50 dark:bg-slate-800/50 py-3 px-2 flex items-center justify-between rounded mb-3 border border-slate-100 dark:border-slate-700">
                <span className="text-lg font-bold text-success">
                    ${currentPrice.toFixed(2)}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    Real-time
                </div>
            </div>

            {/* Bids (Buys) */}
            <div className="flex flex-col">
                {bids.map((bid, index) => (
                    <div
                        key={index}
                        className="order-book-row flex justify-between py-1 text-[12px] relative group cursor-pointer"
                    >
                        <div
                            className="absolute right-0 inset-y-0 bg-success/5"
                            style={{ width: `${(bid.total / maxTotal) * 100}%` }}
                        />
                        <span className="text-success z-10">{bid.price.toFixed(2)}</span>
                        <span className="z-10">{bid.size.toFixed(1)}</span>
                        <span className="z-10 text-slate-400">
                            {(bid.total / 1000).toFixed(1)}k
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
