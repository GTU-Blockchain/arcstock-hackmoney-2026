"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompanyHeader } from "@/components/company/CompanyHeader";
import { CompanyStats } from "@/components/company/CompanyStats";
import { ActivityFeed } from "@/components/company/ActivityFeed";
import { ComplianceDetails } from "@/components/company/ComplianceDetails";
import { MarketPerformance } from "@/components/company/MarketPerformance";
import { InvestmentModal } from "@/components/investor/InvestmentModal";
import { Tabs } from "@/components/ui/Tabs";
import { Company, Activity } from "@/types";

// Mock data - in real app would come from API based on [id]
const mockCompany: Company = {
    id: "1",
    name: "Tesla Inc.",
    ticker: "TSLA-RWET",
    sector: "technology",
    status: "open",
    sharePrice: 243.12,
    totalSupply: 10000000,
    treasuryBalance: 42000000,
    marketCap: 2430000000,
    isVerified: true,
    legalHash: "0x7f8d...3a92",
    createdAt: new Date(),
};

const mockActivities: Activity[] = [
    {
        id: "1",
        type: "investment",
        title: "Institutional Investment Round",
        description: "Vanguard Real Assets Fund acquired 50,000 TSLA-RWET shares.",
        amount: 12500000,
        txHash: "0x9a2c...e1f",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
        id: "2",
        type: "dividend",
        title: "Quarterly Dividends Distributed",
        description:
            "Dividends distributed to all eligible TSLA-RWET token holders ($0.12 per share).",
        amount: -1200000,
        txHash: "0x3b8d...4f2",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
        id: "3",
        type: "buyback",
        title: "Share Buyback Executed",
        description:
            "Company treasury purchased 5,000 TSLA-RWET from open market for burning.",
        shares: 5000,
        txHash: "0x1f5a...8e4",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    },
    {
        id: "4",
        type: "legal_update",
        title: "Legal Metadata Hash Updated",
        description:
            "Updated annual compliance report and corporate registry hash.",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    },
];

const tabs = [
    { id: "overview", label: "Overview" },
    { id: "activity", label: "Activity Feed" },
    { id: "governance", label: "Governance" },
    { id: "financials", label: "Financials" },
];

export default function CompanyDetailPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("activity");

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            <Header variant="app" />

            <main className="flex-1 max-w-[1024px] mx-auto px-4 sm:px-10 py-5 w-full">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap items-center gap-2 py-4">
                    <Link
                        href="/dashboard"
                        className="text-slate-400 text-sm font-medium leading-normal hover:text-primary"
                    >
                        Companies
                    </Link>
                    <span className="material-symbols-outlined text-slate-400 text-xs">
                        chevron_right
                    </span>
                    <span className="text-slate-400 text-sm font-medium">Automotive</span>
                    <span className="material-symbols-outlined text-slate-400 text-xs">
                        chevron_right
                    </span>
                    <span className="text-slate-900 dark:text-white text-sm font-bold">
                        {mockCompany.name} (Tokenized)
                    </span>
                </div>

                {/* Company Header */}
                <CompanyHeader
                    company={mockCompany}
                    onInvest={() => setIsModalOpen(true)}
                />

                {/* Stats */}
                <div className="py-8">
                    <CompanyStats company={mockCompany} />
                </div>

                {/* Tabs */}
                <div className="pb-6">
                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                {/* Tab Content */}
                {activeTab === "activity" && <ActivityFeed activities={mockActivities} />}

                {activeTab === "overview" && (
                    <div className="text-slate-500 dark:text-slate-400 p-8 text-center">
                        Overview content coming soon...
                    </div>
                )}

                {activeTab === "governance" && (
                    <div className="text-slate-500 dark:text-slate-400 p-8 text-center">
                        Governance content coming soon...
                    </div>
                )}

                {activeTab === "financials" && (
                    <div className="text-slate-500 dark:text-slate-400 p-8 text-center">
                        Financials content coming soon...
                    </div>
                )}

                {/* Additional Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 mb-10">
                    <MarketPerformance
                        volume24h={842500}
                        currentPrice={mockCompany.sharePrice}
                        marketCap={mockCompany.marketCap}
                    />
                    <ComplianceDetails />
                </div>
            </main>

            <Footer />

            {/* Investment Modal */}
            <InvestmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                company={mockCompany}
            />
        </div>
    );
}
