"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { IssuerHeader } from "@/components/layout/IssuerHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getIssuerCompanyOrNull } from "@/lib/api";
import { executeBuyback } from "@/lib/api";

export default function IssuerBuybackPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [shareholderAddress, setShareholderAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: company, isLoading } = useQuery({
    queryKey: ["issuerCompany", address],
    queryFn: () => getIssuerCompanyOrNull(address!),
    enabled: !!address,
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
    if (!company || !address || !shareholderAddress || !amount) return;

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const result = await executeBuyback({
        companyId: company.id,
        from: shareholderAddress,
        amount: amount,
        issuerAddress: address,
      });
      setSuccess(`Success! Tx: ${result.txHash.slice(0, 10)}...`);
      setShareholderAddress("");
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Buyback failed");
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

  return (
    <div className="min-h-screen bg-slate-950">
      <IssuerHeader />

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link
            href="/issuer/dashboard"
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-4"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-rose-500/20">
              <span className="material-symbols-outlined text-rose-500 text-2xl">
                cancel
              </span>
            </div>
            <div>
              <h1 className="text-white text-3xl font-bold">
                Cancel Shares (Buyback)
              </h1>
              <p className="text-slate-400 text-sm">
                Share buyback - cancel equity tokens
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
            <p className="text-rose-400 text-sm">
              This action cannot be undone. The selected shareholder&apos;s
              shares will be burned (supply reduced). Use only for
              board-approved buyback programs.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg bg-slate-800/50 p-4 border border-slate-700">
              <p className="text-slate-500 text-xs mb-1">Company</p>
              <p className="text-white font-bold">{company.name}</p>
              <p className="text-slate-400 text-sm">{company.symbol}</p>
            </div>

            <Input
              label="Shareholder Address"
              value={shareholderAddress}
              onChange={(e) => setShareholderAddress(e.target.value)}
              placeholder="0x..."
              required
            />

            <Input
              label="Shares to Cancel"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
            />

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            {success && (
              <p className="text-emerald-400 text-sm">{success}</p>
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
                disabled={loading || !shareholderAddress || !amount}
              >
                {loading ? "Processing..." : "Cancel Shares"}
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h4 className="text-white font-semibold mb-2">Note</h4>
          <p className="text-slate-400 text-sm">
            Backend (authorized minter) executes the on-chain transaction. This
            page only creates the request; no wallet signature required.
          </p>
        </div>
      </main>
    </div>
  );
}
