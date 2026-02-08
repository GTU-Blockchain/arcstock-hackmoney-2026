"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { ArcLogo } from "@/components/icons/ArcLogo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface HeaderProps {
    variant?: "marketing" | "app";
}

const marketingNavItems = [
    { href: "#platform", label: "Platform" },
    { href: "#issuers", label: "Issuers" },
    { href: "#developers", label: "Developers" },
    { href: "#institutional", label: "Institutional" },
];

function HeaderChainIndicator() {
  const { address, isConnected, chainId } = useAccount();
  const chainNames: Record<number, string> = {
    11155111: "Sepolia",
    43113: "Avalanche Fuji",
    84532: "Base Sepolia",
    5042002: "Arc Testnet",
  };
  if (!isConnected || !address) return null;
  const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;
  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
      <div className="size-2 rounded-full bg-emerald-500" />
      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
        {chainId ? chainNames[chainId] ?? `Chain ${chainId}` : "Unknown"}
      </span>
      <span className="text-xs text-slate-400">{truncated}</span>
    </div>
  );
}

const appNavItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/market", label: "Marketplace" },
    { href: "/issuer", label: "Portfolio" },
    { href: "/treasury", label: "Treasury" },
];

export function Header({ variant = "marketing" }: HeaderProps) {
    const pathname = usePathname();
    const navItems = variant === "marketing" ? marketingNavItems : appNavItems;

    return (
        <header
            className={cn(
                "flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 lg:px-10 py-4 sticky top-0 z-50",
                "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3 text-primary">
                    <ArcLogo size={32} />
                    <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">
                        Arc Stock
                    </h2>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex flex-1 justify-end gap-8">
                <nav className="hidden lg:flex items-center gap-9">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "text-primary font-semibold"
                                    : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex gap-3">
                    {variant === "marketing" ? (
                        <>
                            <Link href="/login">
                                <Button variant="primary">Launch App</Button>
                            </Link>
                            <Button variant="secondary">Contact Sales</Button>
                        </>
                    ) : (
                        <>
                            <HeaderChainIndicator />
                            <ConnectButton />
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
