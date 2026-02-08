"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { parseUnits, maxUint256 } from "viem";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { IssuerHeader } from "@/components/layout/IssuerHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getIssuerCompanyOrNull, getBackendAddress } from "@/lib/api";
import { mintShares } from "@/lib/api";

const erc20Abi = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

type IssueMode = "pool" | "specific";

export default function IssuerIssuePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeFromUrl = searchParams.get("mode") as IssueMode | null;
  const [mode, setMode] = useState<IssueMode>(modeFromUrl === "pool" || modeFromUrl === "specific" ? modeFromUrl : "pool");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: company, isLoading } = useQuery({
    queryKey: ["issuerCompany", address],
    queryFn: () => getIssuerCompanyOrNull(address!),
    enabled: !!address,
  });

  const { data: backendAddress } = useQuery({
    queryKey: ["backendAddress"],
    queryFn: getBackendAddress,
    enabled: !!company,
  });

  const backendWallet = backendAddress?.backendWallet as `0x${string}` | undefined;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: company?.equityToken as `0x${string}` | undefined,
    abi: erc20Abi,
    functionName: "allowance",
    args:
      company?.companyWallet && company?.equityToken && backendWallet
        ? [company.companyWallet as `0x${string}`, backendWallet]
        : undefined,
  });

  const { data: companyBalance } = useReadContract({
    address: company?.equityToken as `0x${string}` | undefined,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: company?.companyWallet ? [company.companyWallet as `0x${string}`] : undefined,
  });

  const { writeContract: approveRegistry, data: approveHash } =
    useWriteContract();
  const { isLoading: isApprovePending } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  useEffect(() => {
    if (approveHash) refetchAllowance();
  }, [approveHash, refetchAllowance]);

  useEffect(() => {
    if (modeFromUrl === "pool" || modeFromUrl === "specific") setMode(modeFromUrl);
  }, [modeFromUrl]);

  // Show approve section when pool mode and backend loaded; allow pre-approval (before minting)
  const showApproveSection = mode === "pool" && company && backendWallet;
  const needsMoreApproval =
    showApproveSection &&
    (allowance === undefined ||
      companyBalance === undefined ||
      allowance < companyBalance);

  useEffect(() => {
    if (!isLoading && isConnected && address && !company) {
      router.replace("/issuer/create");
    }
  }, [isLoading, isConnected, address, company, router]);

  const handleMint = async (e: React.FormEvent) => {
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

    const to =
      mode === "pool" ? company.companyWallet : recipientAddress;
    if (mode === "specific" && !recipientAddress) {
      setError("Recipient address required");
      return;
    }

    setLoading(true);
    try {
      const result = await mintShares({
        companyId: company.id,
        to,
        amount,
        issuerAddress: address,
      });
        setSuccess(
          mode === "pool"
            ? `Pool updated! Tx: ${result.txHash.slice(0, 10)}... Now approve the backend for sales.`
            : `Success! Tx: ${result.txHash.slice(0, 10)}...`
        );
      if (mode === "pool") {
        setAmount("");
      } else {
        setRecipientAddress("");
        setAmount("");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Share issuance failed";
      setError(msg);
      console.error("Mint error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    if (!company?.equityToken || !backendWallet || !amount || parseFloat(amount) <= 0) return;
    const amountWei = parseUnits(amount, 18);
    approveRegistry({
      address: company.equityToken as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [backendWallet, amountWei],
    });
  };

  const handleApproveMax = () => {
    if (!company?.equityToken || !backendWallet) return;
    approveRegistry({
      address: company.equityToken as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [backendWallet, maxUint256],
    });
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
            <div className="p-3 rounded-xl bg-primary/20">
              <span className="material-symbols-outlined text-primary text-2xl">
                add_box
              </span>
            </div>
            <div>
              <h1 className="text-white text-3xl font-bold">
                Issue New Shares
              </h1>
              <p className="text-slate-400 text-sm">
                Add shares to company pool or issue to a specific address
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Mode selector */}
          <div className="flex gap-2 p-1 rounded-lg bg-slate-800/50 border border-slate-700">
            <button
              type="button"
              onClick={() => setMode("pool")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === "pool"
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Add to Company Pool
            </button>
            <button
              type="button"
              onClick={() => setMode("specific")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === "specific"
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Issue to Specific Address
            </button>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            {mode === "pool" ? (
              <p className="text-slate-400 text-sm mb-6">
                Shares are minted to the company wallet. When investors buy,
                they are transferred from this pool. Approve the backend for
                sales so investors can purchase.
              </p>
            ) : (
              <p className="text-slate-400 text-sm mb-6">
                Shares are minted directly to the specified address (employee,
                advisor, etc.).
              </p>
            )}

            <form onSubmit={handleMint} className="space-y-6">
              <div className="rounded-lg bg-slate-800/50 p-4 border border-slate-700">
                <p className="text-slate-500 text-xs mb-1">Company</p>
                <p className="text-white font-bold">{company.name}</p>
                <p className="text-slate-400 text-sm">
                  {company.symbol} • Recipient:{" "}
                  {mode === "pool"
                    ? company.companyWallet.slice(0, 10) + "..."
                    : "Specific address"}
                </p>
              </div>

              {mode === "specific" && (
                <Input
                  label="Recipient Address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                />
              )}

              <Input
                label="Share Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min={0}
                step="any"
              />

              {error && (
                <p className="text-red-400 text-sm font-medium p-3 rounded-lg bg-red-500/10">
                  {error}
                </p>
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
                  disabled={loading}
                  isLoading={loading}
                >
                  {loading ? "Processing..." : "Mint Shares"}
                </Button>
              </div>
            </form>

            {/* Approve Backend - issuer must approve so backend can transfer pool shares to investors */}
            {showApproveSection && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-slate-400 text-sm mb-2">
                  Allow the settlement backend to transfer company shares for sales.
                  {needsMoreApproval && (
                    <span className="block mt-1 text-amber-500 text-xs">
                      Approval required for investors to buy.
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleApprove}
                    disabled={
                      isApprovePending ||
                      !amount ||
                      parseFloat(amount) <= 0
                    }
                  >
                    {isApprovePending
                      ? "Approving..."
                      : "Approve Amount"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleApproveMax}
                    disabled={isApprovePending}
                  >
                    {isApprovePending ? "..." : "Approve Unlimited"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
