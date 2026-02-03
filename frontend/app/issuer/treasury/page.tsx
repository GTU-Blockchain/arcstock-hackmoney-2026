import { IssuerHeader } from "@/components/layout/IssuerHeader";
import { RulesList } from "@/components/treasury/RulesList";
import { AgentLogs } from "@/components/treasury/AgentLogs";
import { OracleSignals } from "@/components/treasury/OracleSignals";
import { Button } from "@/components/ui/Button";

export default function IssuerTreasuryPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <IssuerHeader />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-white text-3xl font-bold mb-2">Treasury Management</h1>
                        <p className="text-slate-400">
                            Configure agentic rules for automated treasury operations
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary">
                            <span className="material-symbols-outlined text-sm mr-2">history</span>
                            History
                        </Button>
                        <Button>
                            <span className="material-symbols-outlined text-sm mr-2">add</span>
                            New Rule
                        </Button>
                    </div>
                </div>

                {/* Oracle Signals */}
                <div className="mb-8">
                    <OracleSignals />
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Rules List */}
                    <div className="lg:col-span-7">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-white text-xl font-bold">Active Rules</h2>
                            <span className="text-slate-400 text-sm">3 rules configured</span>
                        </div>
                        <RulesList />
                    </div>

                    {/* Agent Logs */}
                    <div className="lg:col-span-5">
                        <AgentLogs />
                    </div>
                </div>

                {/* Info Banner */}
                <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary text-2xl">info</span>
                    <div>
                        <h4 className="font-bold text-white mb-1">How Agentic Rules Work</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Rules are evaluated in real-time against on-chain oracle data. When conditions
                            are met, the agent proposes transactions that require multi-sig approval before
                            execution. All actions are logged and auditable.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
