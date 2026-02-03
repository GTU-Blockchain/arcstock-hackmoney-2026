"use client";

import { Button } from "@/components/ui/Button";
import { TreasuryStats } from "@/components/issuer/TreasuryStats";
import { PrimaryActions } from "@/components/issuer/PrimaryActions";
import { AgenticInsights } from "@/components/issuer/AgenticInsights";
import { EquityDistribution } from "@/components/issuer/EquityDistribution";
import { InstitutionalTools } from "@/components/issuer/InstitutionalTools";
import { Sidebar } from "@/components/layout/Sidebar";

// Mock data
const treasuryData = {
    balance: 42850000,
    sharesIssued: 10000000,
    shareholders: 1240,
    balanceChange: 2.4,
    shareholderChange: 0.8,
};

export default function IssuerDashboardPage() {
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
                            Issuer Dashboard
                        </h2>
                        <div className="relative w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                                search
                            </span>
                            <input
                                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Search holders, txs..."
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="secondary">Distribute Dividends</Button>
                        <Button>Issue New Shares</Button>
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-500">
                                person
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-tight mb-2">
                            Corporate Overview
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">
                            Manage equity issuance and treasury operations in real-time.
                        </p>
                    </div>

                    {/* Main Layout Grid */}
                    <div className="grid grid-cols-12 gap-8">
                        {/* Left/Main Column */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                            {/* Stats Row */}
                            <TreasuryStats data={treasuryData} />

                            {/* Primary Actions */}
                            <PrimaryActions />

                            {/* Equity Distribution */}
                            <EquityDistribution />
                        </div>

                        {/* Right Column: Agentic Insights Sidebar */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                            <AgenticInsights />
                            <InstitutionalTools />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
