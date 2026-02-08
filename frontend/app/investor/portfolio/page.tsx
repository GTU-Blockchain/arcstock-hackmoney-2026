"use client";

import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { InvestorHeader } from "@/components/layout/InvestorHeader";
import { PortfolioStats } from "@/components/investor/PortfolioStats";
import { GatewayBalanceCard } from "@/components/investor/GatewayBalanceCard";
import { Button } from "@/components/ui/Button";
import {
  getCompanies,
  getInvestorPortfolio,
  mapApiCompanyToCompany,
} from "@/lib/api";

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ["portfolio", address],
    queryFn: () => getInvestorPortfolio(address!),
    enabled: !!address,
  });

  const mappedCompanies = companies.map(mapApiCompanyToCompany);

  const holdings = portfolio.map((p) => {
    const company = mappedCompanies.find((c) => c.id === String(p.companyId));
    const shares = parseFloat(p.balance) / 1e18;
    const sharePrice = company?.sharePrice ?? 0;
    const value = shares * sharePrice;
    return {
      companyId: p.companyId,
      company: p.companyName,
      ticker: p.symbol,
      shares,
      sharePrice,
      value,
    };
  });

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const portfolioStats = {
    totalInvested: totalValue,
    sharesOwned: holdings.reduce((sum, h) => sum + h.shares, 0),
    dividendsReceived: 0,
    companiesCount: holdings.length,
    monthlyGrowth: 0,
    yieldPercentage: 0,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <InvestorHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-white text-3xl font-bold mb-2">Portfolio</h1>
          <p className="text-slate-400">
            Manage your equity holdings across all chains
          </p>
        </div>

        {isConnected && (
          <div className="mb-8 space-y-6">
            <GatewayBalanceCard />
            <PortfolioStats data={portfolioStats} />
          </div>
        )}

        {isConnected && portfolio.length > 0 && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-white text-xl font-bold">Your Holdings</h2>
              <Link href="/investor/marketplace">
                <Button variant="secondary" size="sm">
                  <span className="material-symbols-outlined text-sm mr-2">storefront</span>
                  Marketplace
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">
                      Company
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">
                      Shares
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">
                      Price (USDC)
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => (
                    <tr
                      key={holding.companyId}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{holding.company}</p>
                          <p className="text-slate-400 text-sm">{holding.ticker}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-white">
                        {holding.shares.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400">
                        ${holding.sharePrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-white font-bold">
                        ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isConnected && portfolio.length === 0 && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
            <p className="text-slate-400 mb-4">No holdings yet</p>
            <Link href="/investor/marketplace">
              <Button>
                <span className="material-symbols-outlined text-sm mr-2">storefront</span>
                Browse Marketplace
              </Button>
            </Link>
          </div>
        )}

        {!isConnected && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
            <p className="text-slate-400">Connect your wallet to view your portfolio</p>
          </div>
        )}
      </main>
    </div>
  );
}
