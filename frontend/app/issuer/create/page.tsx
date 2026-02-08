"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { IssuerHeader } from "@/components/layout/IssuerHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerCompany, getIssuerCompanyOrNull } from "@/lib/api";

export default function CreateCompanyPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const { data: company, isLoading } = useQuery({
    queryKey: ["issuerCompany", address],
    queryFn: () => getIssuerCompanyOrNull(address!),
    enabled: !!address,
  });

  useEffect(() => {
    if (!isLoading && isConnected && address && company) {
      router.replace("/issuer/dashboard");
    }
  }, [isLoading, isConnected, address, company, router]);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!address || !name.trim() || !symbol.trim()) return;

    setLoading(true);
    try {
      await registerCompany({
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        metadataUri: metadataUri.trim() || undefined,
        companyWallet: address,
      });
      router.push("/issuer/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // If wallet has a company, redirect to dashboard; show loading while checking
  if (isConnected && address && isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <IssuerHeader />
        <main className="max-w-xl mx-auto px-6 py-12 text-center">
          <p className="text-slate-400">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <IssuerHeader />

      <main className="max-w-xl mx-auto px-6 py-12">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">
                add_business
              </span>
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold">Create Company</h1>
              <p className="text-slate-400 text-sm">
                Fill in the details to register on-chain
              </p>
            </div>
          </div>

          {!isConnected ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">
                Connect your wallet to create a company
              </p>
              <p className="text-slate-500 text-sm">
                Your connected wallet address will be registered as the company wallet
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Company Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corporation"
                required
              />
              <Input
                label="Symbol (Ticker)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="ACME-EQ"
                required
              />
              <Input
                label="Metadata URI (optional)"
                value={metadataUri}
                onChange={(e) => setMetadataUri(e.target.value)}
                placeholder="https://..."
              />
              <div className="rounded-lg bg-slate-800/50 p-4 border border-slate-700">
                <p className="text-slate-500 text-xs mb-1">Company Wallet</p>
                <p className="text-white font-mono text-sm break-all">{address}</p>
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
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
                  disabled={loading || !name.trim() || !symbol.trim()}
                >
                  {loading ? "Registering..." : "Create Company"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
