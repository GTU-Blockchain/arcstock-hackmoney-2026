"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { PortfolioStats } from "@/components/investor/PortfolioStats";
import { CompanyTable } from "@/components/investor/CompanyTable";
import { InvestmentModal } from "@/components/investor/InvestmentModal";
import { Company } from "@/types";

// Mock data
const portfolioData = {
    totalInvested: 1240000,
    sharesOwned: 45200,
    dividendsReceived: 12450,
    companiesCount: 8,
    monthlyGrowth: 12.5,
    yieldPercentage: 4.2,
};

const mockCompanies: Company[] = [
    {
        id: "1",
        name: "Global Tech Corp",
        ticker: "GTC-EQ",
        sector: "technology",
        status: "open",
        sharePrice: 150.0,
        totalSupply: 10000000,
        treasuryBalance: 42000000,
        marketCap: 1500000000,
        isVerified: true,
        createdAt: new Date(),
    },
    {
        id: "2",
        name: "Renewable Energy Ltd",
        ticker: "REL-EQ",
        sector: "energy",
        status: "open",
        sharePrice: 85.5,
        totalSupply: 5000000,
        treasuryBalance: 18000000,
        marketCap: 427500000,
        isVerified: true,
        createdAt: new Date(),
    },
    {
        id: "3",
        name: "Urban Logistics S.A.",
        ticker: "ULS-EQ",
        sector: "logistics",
        status: "open",
        sharePrice: 210.0,
        totalSupply: 3000000,
        treasuryBalance: 25000000,
        marketCap: 630000000,
        isVerified: true,
        createdAt: new Date(),
    },
    {
        id: "4",
        name: "Fintech Pioneers",
        ticker: "FTP-EQ",
        sector: "finance",
        status: "open",
        sharePrice: 45.0,
        totalSupply: 20000000,
        treasuryBalance: 12000000,
        marketCap: 900000000,
        isVerified: true,
        createdAt: new Date(),
    },
];

export default function DashboardPage() {
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleInvest = (company: Company) => {
        setSelectedCompany(company);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header variant="app" />

            <main className="max-w-[1024px] mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="flex flex-wrap justify-between gap-3 mb-8">
                    <div className="flex flex-col gap-3">
                        <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                            Investor Dashboard
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                            Manage your chain-abstracted equity portfolio and real-world
                            assets.
                        </p>
                    </div>
                </div>

                {/* Portfolio Stats */}
                <div className="mb-8">
                    <PortfolioStats data={portfolioData} />
                </div>

                {/* Available Opportunities */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                            Available Investment Opportunities
                        </h2>
                        <Link
                            href="/market"
                            className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
                        >
                            View all{" "}
                            <span className="material-symbols-outlined text-sm">
                                arrow_forward
                            </span>
                        </Link>
                    </div>

                    <CompanyTable companies={mockCompanies} onInvest={handleInvest} />
                </div>
            </main>

            {/* Investment Modal */}
            <InvestmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                company={selectedCompany}
            />
        </div>
    );
}
