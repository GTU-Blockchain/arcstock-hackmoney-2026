"use client";

import { useEffect, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

interface WalletGuardProps {
  children: ReactNode;
}

/**
 * Protects dashboard routes: redirects to home when wallet disconnects
 * or when user tries to access without a connected wallet.
 */
export function WalletGuard({ children }: WalletGuardProps) {
  const { isConnected, status } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (status === "pending") return;

    if (!isConnected) {
      router.replace("/");
    }
  }, [isConnected, status, router]);

  if (status === "pending") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!isConnected) {
    return null;
  }

  return <>{children}</>;
}
