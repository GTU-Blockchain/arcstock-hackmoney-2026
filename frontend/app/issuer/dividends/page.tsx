"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { IssuerHeader } from "@/components/layout/IssuerHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  getIssuerCompanyOrNull,
  getShareholders,
  distributeDividends,
} from "@/lib/api";

export default function IssuerDividendsPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: company, isLoading } = useQuery({
    queryKey: ["issuerCompany", address],
    queryFn: () => getIssuerCompanyOrNull(address!),
    enabled: !!address,
  });

  const { data: shareholders = [], isLoading: shareholdersLoading } =
    useQuery({
      queryKey: ["shareholders", company?.id, address],
      queryFn: () => getShareholders(company!.id, address!),
      enabled: !!company?.id && !!address,
    });

  useEffect(() => {
    if (!isLoading && isConnected && address && !company) {
      router.replace("/issuer/create");
    }
  }, [isLoading, isConnected, address, company, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!company || !address || !amount) {
      setError("Missing information");
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0 || isNaN(amountNum)) {
      setError("Enter a valid amount");
      return;
    }

    if (shareholders.length === 0) {
      setError("No shareholders found to distribute to");
      return;
    }

    setLoading(true);
    try {
      const result = await distributeDividends({
        companyId: company.id,
        amount,
        issuerAddress: address,
      });
      const total = result.distributions.reduce(
        (s, d) => s + parseFloat(d.amountFormatted),
        0
      );
      setSuccess(
        `${total.toFixed(2)} USDC distributed to ${result.distributions.length} shareholders.`
      );
      setAmount("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Dividend distribution failed"
      );
    } finally {
      setLoading(false);
    }
  };

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

  const treasuryBalance = company.treasuryBalance
    ? parseFloat(company.treasuryBalance) / 1e6
    : 0;
  return (
    <div className="min-h-screen bg-slate-950">
      <IssuerHeader />

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link
            href="/issuer/dashboard"
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-4"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/20">
              <span className="material-symbols-outlined text-primary text-2xl">
                payments
              </span>
            </div>
            <div>
              <h1 className="text-white text-3xl font-bold">
                Distribute Dividends
              </h1>
              <p className="text-slate-400 text-sm">
                Proportional dividend distribution to all shareholders
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="rounded-lg bg-slate-800/50 p-4 border border-slate-700 mb-6">
              <p className="text-slate-500 text-xs mb-1">Company</p>
              <p className="text-white font-bold">{company.name}</p>
              <p className="text-slate-400 text-sm">{company.symbol}</p>
              <p className="text-emerald-400 text-sm mt-2 font-medium">
                Available balance: {treasuryBalance.toLocaleString()} USDC
              </p>
            </div>

            <h3 className="text-white font-semibold mb-4">
              Shareholders ({shareholders.length})
            </h3>
            {shareholdersLoading ? (
              <p className="text-slate-400 text-sm">Loading...</p>
            ) : shareholders.length === 0 ? (
              <p className="text-slate-400 text-sm p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                No shareholders yet. After investors acquire shares, you can
                distribute dividends.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-700 max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">
                        Address
                      </th>
                      <th className="px-4 py-3 text-right text-slate-400 font-medium">
                        Shares
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shareholders.map((s) => (
                      <tr
                        key={s.address}
                        className="border-t border-slate-800 hover:bg-slate-800/30"
                      >
                        <td className="px-4 py-2 text-slate-300 font-mono text-xs">
                          {s.address.slice(0, 10)}...{s.address.slice(-8)}
                        </td>
                        <td className="px-4 py-2 text-right text-white font-medium">
                          {s.balanceFormatted} {company.symbol}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                label="Total Amount to Distribute (USDC)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min={0}
                step="0.01"
              />
              <p className="text-slate-500 text-xs">
                Amount will be distributed to all shareholders proportionally.
              </p>

              {amount &&
                parseFloat(amount) > 0 &&
                shareholders.length > 0 && (
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-xs font-medium mb-2">
                      Preview (by share ratio):
                    </p>
                    <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                      {(() => {
                        const total = shareholders.reduce(
                          (s, sh) => s + parseFloat(sh.balance),
                          0
                        );
                        const amountNum = parseFloat(amount);
                        return shareholders.map((s) => {
                          const pct =
                            total > 0
                              ? parseFloat(s.balance) / total
                              : 0;
                          const amt = amountNum * pct;
                          return (
                            <div
                              key={s.address}
                              className="flex justify-between text-slate-300"
                            >
                              <span className="font-mono text-xs truncate max-w-[140px]">
                                {s.address.slice(0, 8)}...{s.address.slice(-6)}
                              </span>
                              <span className="text-emerald-400 font-medium">
                                {amt.toFixed(2)} USDC
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

              {error && (
                <p className="text-red-400 text-sm font-medium p-3 rounded-lg bg-red-500/10">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-emerald-400 text-sm font-medium p-3 rounded-lg bg-emerald-500/10">
                  {success}
                </p>
              )}

              <div className="flex gap-4">
                <Link href="/issuer/dashboard" className="flex-1">
                  <Button type="button" variant="secondary" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    loading ||
                    !amount ||
                    shareholders.length === 0 ||
                    parseFloat(amount) <= 0
                  }
                  isLoading={loading}
                >
                  {loading ? "Distributing..." : "Distribute Dividends"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
