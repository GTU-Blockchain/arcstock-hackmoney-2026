"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
    walletConnectWallet,
    injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { defineChain } from "viem";
import { baseSepolia, sepolia } from "wagmi/chains";

// Arc Testnet (Gateway destination)
export const arcTestnet = defineChain({
    id: 5042002,
    name: "Arc Testnet",
    nativeCurrency: { name: "ARC", symbol: "ARC", decimals: 18 },
    rpcUrls: {
        default: { http: ["https://rpc.testnet.arc.network"] },
    },
});

// Chain ID -> Gateway source domain
export const CHAIN_TO_DOMAIN: Record<number, number> = {
    11155111: 0, // Sepolia
    43113: 1, // Avalanche Fuji
    84532: 6, // Base Sepolia
};

export const config = getDefaultConfig({
    appName: "ArcStock",
    projectId:
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "YOUR_PROJECT_ID",
    chains: [baseSepolia, sepolia, arcTestnet],
    wallets: [
        {
            groupName: "Önerilen",
            wallets: [injectedWallet, walletConnectWallet],
        },
    ],
    ssr: true,
});
