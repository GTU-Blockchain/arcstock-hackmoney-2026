"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { IssuerHeader } from "@/components/layout/IssuerHeader";
import { TreasuryStats } from "@/components/issuer/TreasuryStats";
import { PrimaryActions } from "@/components/issuer/PrimaryActions";
import { AgenticInsights } from "@/components/issuer/AgenticInsights";
import { EquityDistribution } from "@/components/issuer/EquityDistribution";
import { Badge } from "@/components/ui/Badge";
import { getIssuerCompanyOrNull } from "@/lib/api";
import { getTreasuryBalance } from "@/lib/api";

export default function IssuerDashboardPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const { data: company, isLoading } = useQuery({
    queryKey: ["issuerCompany", address],
    queryFn: () => getIssuerCompanyOrNull(address!),
    enabled: !!address,
  });

  const { data: treasuryData } = useQuery({
    queryKey: ["treasury", company?.id],
    queryFn: () => getTreasuryBalance(company!.id),
    enabled: !!company?.id,
  });

  // Company from API now includes treasuryBalance & totalSupply; fallback to treasury API
  const treasuryBalance = company?.treasuryBalance
    ? parseFloat(company.treasuryBalance) / 1e6
    : treasuryData?.balance
      ? parseFloat(treasuryData.balance) / 1e6
      : 0;
  const totalSupply = company?.totalSupply
    ? parseFloat(company.totalSupply) / 1e18
    : 0;

  useEffect(() => {
    if (!isLoading && isConnected && address && !company) {
      router.replace("/issuer/create");
    }
  }, [isLoading, isConnected, address, company, router]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-950">
        <IssuerHeader />
        <main className="max-w-7xl mx-auto px-6 py-12 text-center">
          <p className="text-slate-400">Connect your wallet</p>
        </main>
      </div>
    );
  }

  if (isLoading || !company) {
    return (
      <div className="min-h-screen bg-slate-950">
        <IssuerHeader />
        <main className="max-w-7xl mx-auto px-6 py-12 text-center">
          <p className="text-slate-400">Loading...</p>
        </main>
      </div>
    );
  }

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
              Manage your company&apos;s tokenized equity and treasury
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Company</p>
            <p className="text-white font-bold text-lg">{company.name}</p>
            <p className="text-slate-500 text-sm">{company.symbol}</p>
          </div>
        </div>

        {/* Treasury Stats */}
        <div className="mb-8">
          <TreasuryStats
            data={{
              balance: treasuryBalance,
              sharesIssued: Math.round(totalSupply),
              shareholders: 0,
              balanceChange: 0,
              shareholderChange: 0,
            }}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PrimaryActions />
            <EquityDistribution />
          </div>
          <div>
            <AgenticInsights />
          </div>
        </div>
      </main>
    </div>
  );
}
