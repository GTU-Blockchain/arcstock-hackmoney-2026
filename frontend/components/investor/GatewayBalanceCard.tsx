"use client";

import { useAccount, useReadContract } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getBalances } from "@/lib/api";
import { CHAIN_TO_DOMAIN, CHAIN_USDC, GATEWAY_WALLET } from "@/lib/wagmi";

const CHAIN_NAMES: Record<number, string> = {
  11155111: "Sepolia",
  43113: "Avalanche Fuji",
  84532: "Base Sepolia",
  5042002: "Arc Testnet",
};

export function GatewayBalanceCard() {
  const { address, chainId } = useAccount();
  const sourceDomain = chainId ? CHAIN_TO_DOMAIN[chainId] : undefined;
  const chainName = chainId ? CHAIN_NAMES[chainId] ?? `Chain ${chainId}` : "—";

  const { data: balancesData } = useQuery({
    queryKey: ["balances", address],
    queryFn: () => getBalances(address!),
    enabled: !!address,
  });

  const usdcAddress = chainId ? CHAIN_USDC[chainId] : undefined;
  const { data: directBalance } = useReadContract({
    address: usdcAddress,
    chainId,
    abi: [
      {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ] as const,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: gatewayOnChainBalance } = useReadContract({
    address: GATEWAY_WALLET,
    chainId,
    abi: [
      {
        inputs: [
          { name: "token", type: "address" },
          { name: "depositor", type: "address" },
        ],
        name: "totalBalance",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ] as const,
    functionName: "totalBalance",
    args: usdcAddress && address ? [usdcAddress, address] : undefined,
  });

  const gatewayApiBalance = sourceDomain
    ? parseFloat(
        balancesData?.balances?.find((b) => b.domain === sourceDomain)?.balance ?? "0"
      )
    : 0;
  const gatewayOnChain = gatewayOnChainBalance ? Number(gatewayOnChainBalance) / 1e6 : 0;
  const pendingForDomain = (balancesData?.pendingDeposits ?? [])
    .filter((d) => d.domain === sourceDomain)
    .reduce((sum, d) => {
      const amt = parseFloat(d.amount);
      return sum + (amt > 1e6 ? amt / 1e6 : amt);
    }, 0);
  const gatewayBalance = Math.max(gatewayApiBalance, gatewayOnChain, pendingForDomain);
  const walletBalance = directBalance ? Number(directBalance) / 1e6 : 0;

  if (!address || !chainId || sourceDomain === undefined) return null;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
      <h3 className="text-slate-400 text-xs font-semibold uppercase mb-2">
        USDC on {chainName}
      </h3>
      <div className="space-y-1">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-slate-500">Wallet:</span>{" "}
            <span className="text-white font-medium">
              {walletBalance.toLocaleString()} USDC
            </span>
          </div>
          <div>
            <span className="text-slate-500">Gateway:</span>{" "}
            <span
              className={`font-medium ${
                gatewayBalance > 0 ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {gatewayBalance.toLocaleString()} USDC
            </span>
          </div>
        </div>
        {gatewayBalance === 0 && walletBalance > 0 && (
          <p className="text-amber-400 text-xs">Deposit to Gateway before investing</p>
        )}
        {pendingForDomain > 0 && gatewayApiBalance === 0 && (
          <p className="text-emerald-400 text-xs">
            Pending: {pendingForDomain.toLocaleString()} USDC (~10–20 min to confirm)
          </p>
        )}
        {gatewayBalance === 0 && (
          <p className="text-slate-500 text-xs">
            Gateway balance updates ~10–20 min after deposit (block finality)
          </p>
        )}
      </div>
    </div>
  );
}
