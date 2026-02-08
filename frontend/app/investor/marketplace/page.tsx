"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { InvestorHeader } from "@/components/layout/InvestorHeader";
import { GatewayBalanceCard } from "@/components/investor/GatewayBalanceCard";
import { CompanyTable } from "@/components/investor/CompanyTable";
import { InvestmentModal } from "@/components/investor/InvestmentModal";
import { Button } from "@/components/ui/Button";
import { Company } from "@/types";
import {
  getCompanies,
  mapApiCompanyToCompany,
} from "@/lib/api";

export default function MarketplacePage() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isConnected } = useAccount();

  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const mappedCompanies = companies.map(mapApiCompanyToCompany);
  const openCompanies = mappedCompanies.filter((c) => c.status === "open");
  const totalMarketCap = mappedCompanies.reduce((sum, c) => sum + c.marketCap, 0);

  const handleInvest = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <InvestorHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-white text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-slate-400">
            Discover and invest in tokenized equity from verified companies
          </p>
        </div>

        {isConnected && (
          <div className="mb-8">
            <GatewayBalanceCard />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
              Total Companies
            </p>
            <p className="text-white text-2xl font-bold">{mappedCompanies.length}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
              Open for Investment
            </p>
            <p className="text-white text-2xl font-bold">{openCompanies.length}</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
              Total Market Cap
            </p>
            <p className="text-white text-2xl font-bold">
              ${totalMarketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center">
            <Link href="/investor/dashboard">
              <Button variant="secondary" size="sm">
                <span className="material-symbols-outlined text-sm mr-2">dashboard</span>
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-white text-xl font-bold">Available Companies</h2>
            <p className="text-slate-400 text-sm mt-1">
              Browse verified companies and invest using USDC
            </p>
          </div>
          {companiesLoading ? (
            <div className="p-12 text-center text-slate-400">
              Loading...
            </div>
          ) : mappedCompanies.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No companies listed yet
            </div>
          ) : (
            <CompanyTable companies={mappedCompanies} onInvest={handleInvest} />
          )}
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
