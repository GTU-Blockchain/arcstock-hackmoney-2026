/**
 * Investor Portfolio Service
 * Fetches user's equity holdings from contract.
 */
import { createPublicClient, http } from "viem";
import { config } from "../config.js";
import { getAllCompanies } from "./registry.js";

const arcChain = {
  id: config.arcChainId,
  name: "Arc Testnet",
  nativeCurrency: { name: "ARC", symbol: "ARC", decimals: 18 },
  rpcUrls: { default: { http: [config.arcRpcUrl] } },
} as const;

const publicClient = createPublicClient({
  chain: arcChain,
  transport: http(config.arcRpcUrl),
});

const erc20Abi = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export interface PortfolioItem {
  companyId: number;
  companyName: string;
  symbol: string;
  equityToken: string;
  balance: string;
  totalSupply: string;
}

/**
 * Get investor's portfolio - shares held in each company.
 */
export async function getInvestorPortfolio(
  wallet: `0x${string}`
): Promise<PortfolioItem[]> {
  const companies = await getAllCompanies();
  const portfolio: PortfolioItem[] = [];

  for (const company of companies) {
    const [balance, totalSupply] = await Promise.all([
      publicClient.readContract({
        address: company.equityToken,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [wallet],
      }),
      publicClient.readContract({
        address: company.equityToken,
        abi: erc20Abi,
        functionName: "totalSupply",
        args: [],
      }),
    ]);

    if (balance > 0n) {
      portfolio.push({
        companyId: company.id,
        companyName: company.name,
        symbol: company.symbol,
        equityToken: company.equityToken,
        balance: balance.toString(),
        totalSupply: totalSupply.toString(),
      });
    }
  }

  return portfolio;
}
