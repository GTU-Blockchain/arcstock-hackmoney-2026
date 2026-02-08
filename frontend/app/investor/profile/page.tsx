"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { InvestorHeader } from "@/components/layout/InvestorHeader";
import { GatewayBalanceCard } from "@/components/investor/GatewayBalanceCard";
import { PortfolioStats } from "@/components/investor/PortfolioStats";
import { Button } from "@/components/ui/Button";
import {
  getCompanies,
  getInvestorPortfolio,
  mapApiCompanyToCompany,
} from "@/lib/api";

const CHAIN_NAMES: Record<number, string> = {
  11155111: "Sepolia",
  43113: "Avalanche Fuji",
  84532: "Base Sepolia",
  5042002: "Arc Testnet",
};

export default function ProfilePage() {
  const [copied, setCopied] = useState(false);
  const { address, isConnected, chainId } = useAccount();

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
  const portfolioValue = portfolio.reduce((sum, p) => {
    const company = mappedCompanies.find((c) => c.id === String(p.companyId));
    if (!company) return sum;
    const shares = parseFloat(p.balance) / 1e18;
    return sum + shares * company.sharePrice;
  }, 0);
  const sharesOwned = portfolio.reduce(
    (sum, p) => sum + parseFloat(p.balance) / 1e18,
    0
  );

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <InvestorHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-white text-3xl font-bold mb-2">Profile</h1>
          <p className="text-slate-400">
            Your account and investment overview
          </p>
        </div>

        {!isConnected ? (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-500 mb-4 block">
              person
            </span>
            <p className="text-slate-400 mb-4">Connect your wallet to view your profile</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Account info */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-white text-xl font-bold">Account</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Your wallet address and network
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                    Wallet Address
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-white font-mono text-sm bg-slate-800 px-3 py-2 rounded-lg">
                      {address}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="shrink-0"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {copied ? "check" : "content_copy"}
                      </span>
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                    Connected Network
                  </p>
                  <p className="text-white font-medium">
                    {chainId ? CHAIN_NAMES[chainId] ?? `Chain ${chainId}` : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* USDC & Portfolio summary */}
            <GatewayBalanceCard />

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-white text-xl font-bold">Portfolio Summary</h2>
                <Link href="/investor/portfolio">
                  <Button variant="ghost" size="sm">
                    View Portfolio →
                  </Button>
                </Link>
              </div>
              <div className="p-6">
                <PortfolioStats
                  data={{
                    totalInvested: portfolioValue,
                    sharesOwned,
                    dividendsReceived: 0,
                    companiesCount: portfolio.length,
                    monthlyGrowth: 0,
                    yieldPercentage: 0,
                  }}
                />
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h2 className="text-white text-xl font-bold mb-4">Quick Links</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/investor/dashboard">
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <span className="material-symbols-outlined text-2xl text-primary">
                      dashboard
                    </span>
                    <div>
                      <p className="text-white font-medium">Dashboard</p>
                      <p className="text-slate-400 text-sm">Overview & invest</p>
                    </div>
                  </div>
                </Link>
                <Link href="/investor/marketplace">
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <span className="material-symbols-outlined text-2xl text-primary">
                      storefront
                    </span>
                    <div>
                      <p className="text-white font-medium">Marketplace</p>
                      <p className="text-slate-400 text-sm">Browse companies</p>
                    </div>
                  </div>
                </Link>
                <Link href="/investor/portfolio">
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <span className="material-symbols-outlined text-2xl text-primary">
                      account_balance
                    </span>
                    <div>
                      <p className="text-white font-medium">Portfolio</p>
                      <p className="text-slate-400 text-sm">Your holdings</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
