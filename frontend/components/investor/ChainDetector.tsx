"use client";

interface ChainDetectorProps {
    chain: string;
    address: string;
}

export function ChainDetector({ chain, address }: ChainDetectorProps) {
    const truncatedAddress =
        address.length >= 14
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : address;

    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">link</span>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-primary/80">
                        Active Wallet
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Detected: {chain}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{truncatedAddress}</span>
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
        </div>
    );
}
