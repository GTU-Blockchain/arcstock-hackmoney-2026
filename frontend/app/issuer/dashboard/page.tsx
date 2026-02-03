import { IssuerHeader } from "@/components/layout/IssuerHeader";
import { TreasuryStats } from "@/components/issuer/TreasuryStats";
import { PrimaryActions } from "@/components/issuer/PrimaryActions";
import { AgenticInsights } from "@/components/issuer/AgenticInsights";
import { EquityDistribution } from "@/components/issuer/EquityDistribution";
import { Badge } from "@/components/ui/Badge";

export default function IssuerDashboardPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <IssuerHeader />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-white text-3xl font-bold">Issuer Dashboard</h1>
                            <Badge variant="success">Verified</Badge>
                        </div>
                        <p className="text-slate-400">
                            Manage your company's tokenized equity and treasury
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-sm">Company</p>
                        <p className="text-white font-bold text-lg">Acme Corporation</p>
                        <p className="text-slate-500 text-sm">ACME-EQ</p>
                    </div>
                </div>

                {/* Treasury Stats */}
                <div className="mb-8">
                    <TreasuryStats />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Actions & Equity */}
                    <div className="lg:col-span-2 space-y-8">
                        <PrimaryActions />
                        <EquityDistribution />
                    </div>

                    {/* Right Column - Insights */}
                    <div>
                        <AgenticInsights />
                    </div>
                </div>
            </main>
        </div>
    );
}
