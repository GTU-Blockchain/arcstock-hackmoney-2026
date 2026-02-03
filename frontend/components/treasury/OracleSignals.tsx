import { StatCard } from "@/components/ui/StatCard";

interface OracleData {
    demand: string;
    demandChange: number;
    liquidity: string;
    liquidityChange: number;
    nav: string;
    navVsMarket: string;
}

interface OracleSignalsProps {
    data?: OracleData;
}

const defaultData: OracleData = {
    demand: "High",
    demandChange: 22,
    liquidity: "Normal",
    liquidityChange: -5,
    nav: "$145.20",
    navVsMarket: "-1.7%",
};

export function OracleSignals({ data = defaultData }: OracleSignalsProps) {
    return (
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">sensors</span>
                Oracle Signals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-[10px] uppercase text-white/50 font-bold tracking-widest mb-1">
                        Demand Signal
                    </p>
                    <p className="text-lg font-bold text-emerald-400">{data.demand}</p>
                    <p className="text-xs text-white/40">
                        +{data.demandChange}% vs avg
                    </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-[10px] uppercase text-white/50 font-bold tracking-widest mb-1">
                        Liquidity Level
                    </p>
                    <p className="text-lg font-bold text-amber-400">{data.liquidity}</p>
                    <p className="text-xs text-white/40">
                        {data.liquidityChange}% 24h change
                    </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-[10px] uppercase text-white/50 font-bold tracking-widest mb-1">
                        NAV Estimate
                    </p>
                    <p className="text-lg font-bold text-white">{data.nav}</p>
                    <p className="text-xs text-white/40">{data.navVsMarket} vs market</p>
                </div>
            </div>
        </div>
    );
}
