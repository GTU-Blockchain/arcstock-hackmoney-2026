"use client";

import { Button } from "@/components/ui/Button";
import { Sidebar } from "@/components/layout/Sidebar";
import { RulesList } from "@/components/treasury/RulesList";
import { AgentLogs } from "@/components/treasury/AgentLogs";
import { OracleSignals } from "@/components/treasury/OracleSignals";

export default function TreasuryRulesPage() {
    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Top Bar */}
                <header className="sticky top-0 z-10 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4">
                    <div className="flex items-center gap-6">
                        <h2 className="text-slate-900 dark:text-white text-lg font-bold">
                            Treasury Rules
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="secondary">
                            <span className="material-symbols-outlined text-sm mr-2">
                                history
                            </span>
                            History
                        </Button>
                        <Button>
                            <span className="material-symbols-outlined text-sm mr-2">
                                add
                            </span>
                            New Rule
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-tight mb-2">
                            Agentic Treasury Rules
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">
                            Configure autonomous logic for liquidity management, dividend
                            distribution, and buyback execution.
                        </p>
                    </div>

                    {/* Oracle Signals */}
                    <div className="mb-8">
                        <OracleSignals />
                    </div>

                    {/* Main Layout Grid */}
                    <div className="grid grid-cols-12 gap-8">
                        {/* Left Column: Rules */}
                        <div className="col-span-12 lg:col-span-7">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Active Rules
                                </h2>
                                <span className="text-sm text-slate-400">3 rules configured</span>
                            </div>
                            <RulesList />
                        </div>

                        {/* Right Column: Logs */}
                        <div className="col-span-12 lg:col-span-5">
                            <AgentLogs />
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-4">
                        <span className="material-symbols-outlined text-primary text-2xl">
                            info
                        </span>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                                How Agentic Rules Work
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                Rules are evaluated in real-time against on-chain oracle data.
                                When conditions are met, the agent proposes transactions that
                                require multi-sig approval before execution. All actions are
                                logged and auditable.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
