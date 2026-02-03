import { InvestorHeader } from "@/components/layout/InvestorHeader";
import { CompanyTable } from "@/components/investor/CompanyTable";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export default function MarketplacePage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <InvestorHeader />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-white text-3xl font-bold mb-2">Marketplace</h1>
                    <p className="text-slate-400">
                        Discover and invest in tokenized equity from verified companies
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-8">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <Input
                                placeholder="Search companies..."
                                icon="search"
                            />
                        </div>
                        <div className="w-48">
                            <Select
                                options={[
                                    { value: "all", label: "All Sectors" },
                                    { value: "technology", label: "Technology" },
                                    { value: "energy", label: "Energy" },
                                    { value: "finance", label: "Finance" },
                                    { value: "healthcare", label: "Healthcare" },
                                ]}
                            />
                        </div>
                        <div className="w-48">
                            <Select
                                options={[
                                    { value: "all", label: "All Status" },
                                    { value: "open", label: "Open" },
                                    { value: "paused", label: "Paused" },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Companies", value: "24" },
                        { label: "Open for Investment", value: "18" },
                        { label: "Total Market Cap", value: "$2.4B" },
                        { label: "24h Volume", value: "$12.5M" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-slate-900 rounded-xl border border-slate-800 p-4"
                        >
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                                {stat.label}
                            </p>
                            <p className="text-white text-2xl font-bold">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Companies List */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <CompanyTable />
                </div>
            </main>
        </div>
    );
}
