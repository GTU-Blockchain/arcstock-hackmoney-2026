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

// Chain ID -> Gateway domain
export const CHAIN_TO_DOMAIN: Record<number, number> = {
    11155111: 0, // Sepolia
    43113: 1, // Avalanche Fuji
    84532: 6, // Base Sepolia
    5042002: 26, // Arc Testnet
};

// Gateway Wallet (same on all EVM chains)
export const GATEWAY_WALLET = "0x0077777d7EBA4688BDeF3E311b846F25870A19B9" as const;

// Chain ID -> USDC contract address (testnet)
export const CHAIN_USDC: Record<number, `0x${string}`> = {
    11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as `0x${string}`, // Sepolia
    43113: "0x5425890298aed601595a70ab815c96711a31bc65" as `0x${string}`, // Avalanche Fuji
    84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`, // Base Sepolia
    5042002: "0x3600000000000000000000000000000000000000" as `0x${string}`, // Arc Testnet
};

export const config = getDefaultConfig({
    appName: "ArcStock",
    projectId:
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "YOUR_PROJECT_ID",
    chains: [baseSepolia, sepolia, arcTestnet],
    wallets: [
        {
            groupName: "Recommended",
            wallets: [injectedWallet, walletConnectWallet],
        },
    ],
    ssr: true,
});
