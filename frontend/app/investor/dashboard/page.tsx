"use client";

import { useState } from "react";
import { InvestorHeader } from "@/components/layout/InvestorHeader";
import { PortfolioStats } from "@/components/investor/PortfolioStats";
import { CompanyTable } from "@/components/investor/CompanyTable";
import { InvestmentModal } from "@/components/investor/InvestmentModal";
import { Company } from "@/types";

export default function InvestorDashboardPage() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInvest = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <InvestorHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-white text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-slate-400">
            Overview of your investment portfolio and market opportunities
          </p>
        </div>

        {/* Portfolio Stats */}
        <div className="mb-8">
          <PortfolioStats />
        </div>

        {/* Available Companies */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-white text-xl font-bold">Available Companies</h2>
            <p className="text-slate-400 text-sm mt-1">
              Browse verified companies and invest using USDC
            </p>
          </div>
          <CompanyTable onInvest={handleInvest} />
        </div>
      </main>

      <InvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        company={selectedCompany}
      />
    </div>
  );
}
