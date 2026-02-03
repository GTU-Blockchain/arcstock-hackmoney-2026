export function MarketDepth() {
    return (
        <div className="bg-white dark:bg-slate-900 p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Market Depth
            </h3>
            <div className="relative h-40 w-full flex items-end overflow-hidden">
                <div className="w-1/2 h-full flex items-end">
                    <div className="w-full bg-success/10 border-t border-success h-[60%] relative">
                        <div className="absolute right-2 bottom-2 text-[10px] text-success font-bold uppercase">
                            Bids
                        </div>
                    </div>
                </div>
                <div className="w-1/2 h-full flex items-end">
                    <div className="w-full bg-danger/10 border-t border-danger h-[80%] relative">
                        <div className="absolute left-2 bottom-2 text-[10px] text-danger font-bold uppercase">
                            Asks
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
