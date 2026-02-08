"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { ArcLogo } from "@/components/icons/ArcLogo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const CHAIN_NAMES: Record<number, string> = {
  11155111: "Sepolia",
  43113: "Avalanche Fuji",
  84532: "Base Sepolia",
  5042002: "Arc Testnet",
};

function IssuerChainIndicator() {
  const { address, isConnected, chainId } = useAccount();
  if (!isConnected || !address) return null;
  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;
  return (
    <div className="hidden sm:flex items-center gap-2 bg-slate-800/50 border border-slate-700 px-3 py-1.5 rounded-lg">
      <div className="size-2 rounded-full bg-emerald-500" />
      <span className="text-xs font-medium text-slate-300">
        {chainId ? CHAIN_NAMES[chainId] ?? `Chain ${chainId}` : "—"}
      </span>
      <span className="text-xs text-slate-500">{truncated}</span>
    </div>
  );
}

const issuerNavItems = [
    { href: "/issuer/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/issuer/treasury", label: "Treasury", icon: "account_balance" },
    { href: "/issuer/buyback", label: "Buyback", icon: "cancel" },
];

export function IssuerHeader() {
    const pathname = usePathname();

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-800 px-6 lg:px-8 py-4 sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md">
            {/* Logo */}
            <div className="flex items-center gap-8">
                <Link href="/issuer/dashboard" className="flex items-center gap-3 text-primary">
                    <ArcLogo size={28} />
                    <div className="flex items-center gap-2">
                        <h2 className="text-white text-lg font-bold">Arc Stock</h2>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                            Issuer
                        </span>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {issuerNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <span className="material-symbols-outlined text-lg">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
                <IssuerChainIndicator />
                <Link href="/issuer/profile">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <span className="material-symbols-outlined text-lg">person</span>
                        <span className="hidden sm:inline">Profile</span>
                    </Button>
                </Link>
                <ConnectButton />
            </div>
        </header>
    );
}
