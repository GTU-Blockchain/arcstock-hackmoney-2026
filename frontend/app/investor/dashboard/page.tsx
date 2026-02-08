"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { InvestorHeader } from "@/components/layout/InvestorHeader";
import { PortfolioStats } from "@/components/investor/PortfolioStats";
import { GatewayBalanceCard } from "@/components/investor/GatewayBalanceCard";
import { CompanyTable } from "@/components/investor/CompanyTable";
import { InvestmentModal } from "@/components/investor/InvestmentModal";
import { Company } from "@/types";
import {
  getCompanies,
  getInvestorPortfolio,
  mapApiCompanyToCompany,
} from "@/lib/api";

export default function InvestorDashboardPage() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { address, isConnected } = useAccount();

  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ["portfolio", address],
    queryFn: () => getInvestorPortfolio(address!),
    enabled: !!address,
  });

  const mappedCompanies = companies.map(mapApiCompanyToCompany);

  // Calculate portfolio value from holdings (shares × sharePrice)
  const sharesOwned = portfolio.reduce(
    (sum, p) => sum + parseFloat(p.balance) / 1e18,
    0
  );
  const portfolioValue = portfolio.reduce((sum, p) => {
    const company = mappedCompanies.find((c) => c.id === String(p.companyId));
    if (!company) return sum;
    const shares = parseFloat(p.balance) / 1e18;
    return sum + shares * company.sharePrice;
  }, 0);

  const portfolioStats = {
    totalInvested: portfolioValue,
    sharesOwned,
    dividendsReceived: 0,
    companiesCount: portfolio.length,
    monthlyGrowth: 0,
    yieldPercentage: 0,
  };

  const handleInvest = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <InvestorHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-white text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-slate-400">
            Overview of your investment portfolio and market opportunities
          </p>
        </div>

        {isConnected && (
          <div className="mb-8 space-y-6">
            <GatewayBalanceCard />
            <PortfolioStats data={portfolioStats} />
          </div>
        )}

        {isConnected && portfolio.length > 0 && (
          <div className="mb-8 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-white text-xl font-bold">My Holdings</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Your equity positions across companies
                </p>
              </div>
              <Link
                href="/investor/portfolio"
                className="text-primary text-sm font-medium hover:underline"
              >
                View Portfolio →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/50">
                    <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase">
                      Company
                    </th>
                    <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase">
                      Shares
                    </th>
                    <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase">
                      Symbol
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((p) => (
                    <tr
                      key={p.companyId}
                      className="border-t border-slate-800 hover:bg-slate-800/30"
                    >
                      <td className="px-6 py-4 text-white font-medium">
                        {p.companyName}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {(parseFloat(p.balance) / 1e18).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{p.symbol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-white text-xl font-bold">Available Companies</h2>
              <p className="text-slate-400 text-sm mt-1">
                Browse verified companies and invest using USDC
              </p>
            </div>
            <Link
              href="/investor/marketplace"
              className="text-primary text-sm font-medium hover:underline"
            >
              View Marketplace →
            </Link>
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
