"use client";

import { AgentLog } from "@/types";

interface AgentLogsProps {
    logs?: AgentLog[];
}

const defaultLogs: AgentLog[] = [
    {
        id: "1",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        ruleId: "1",
        ruleName: "High Demand Auto-Issuance",
        status: "success",
        message: "Detected 5.2% premium. Initiated 10,000 share issuance proposal.",
        txHash: "0x8f2d...e91a",
    },
    {
        id: "2",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        ruleId: "2",
        ruleName: "Surplus Dividend Distribution",
        status: "pending",
        message: "Treasury at $12.4M. Awaiting governance approval for dividend.",
    },
    {
        id: "3",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        ruleId: "3",
        ruleName: "Strategic Buyback Execution",
        status: "failed",
        message: "Buyback condition met but insufficient liquidity in AMM pool.",
    },
    {
        id: "4",
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        ruleId: "2",
        ruleName: "Surplus Dividend Distribution",
        status: "success",
        message: "Distributed $1.20 per share to 1,240 holders.",
        txHash: "0xa1c4...f32b",
    },
];

const statusStyles = {
    success: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    failed: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
};

export function AgentLogs({ logs = defaultLogs }: AgentLogsProps) {
    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60 * 60 * 1000) {
            return `${Math.floor(diff / (60 * 1000))}m ago`;
        } else if (diff < 24 * 60 * 60 * 1000) {
            return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
        } else {
            return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`;
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">
                        terminal
                    </span>
                    Agent Execution Logs
                </h3>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-slate-400">Live</span>
                </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                    <div
                        key={log.id}
                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusStyles[log.status]}`}>
                                        {log.status}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {formatTime(log.timestamp)}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                                    {log.ruleName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {log.message}
                                </p>
                                {log.txHash && (
                                    <a
                                        href="#"
                                        className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                                    >
                                        <span className="material-symbols-outlined text-xs">
                                            launch
                                        </span>
                                        View TX: {log.txHash}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full p-4 text-sm font-bold text-primary bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-t border-slate-100 dark:border-slate-800">
                View All Logs
            </button>
        </div>
    );
}
