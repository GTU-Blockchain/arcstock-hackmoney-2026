/**
 * Shareholders Service
 * Gets all token holders for a company from Transfer events.
 */
import { createPublicClient, http, parseAbiItem } from "viem";
import { config } from "../config.js";
import { getCompanyById } from "./registry.js";

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

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

export interface Shareholder {
  address: `0x${string}`;
  balance: string;
  balanceFormatted: string;
}

/**
 * Get all shareholders for a company (addresses with balance > 0).
 * Uses Transfer events to find potential holders, then checks balanceOf.
 */
export async function getShareholdersForCompany(
  companyId: number
): Promise<Shareholder[]> {
  const company = await getCompanyById(companyId);
  if (!company) return [];

  const equityToken = company.equityToken;
  const shareholders: Shareholder[] = [];

  // Get all Transfer events to find addresses that have ever held tokens
  const logs = await publicClient.getLogs({
    address: equityToken,
    event: parseAbiItem(
      "event Transfer(address indexed from, address indexed to, uint256 value)"
    ),
    fromBlock: 0n,
  });

  const candidateAddresses = new Set<string>();
  for (const log of logs) {
    const args = log.args as { from?: `0x${string}`; to?: `0x${string}` };
    if (args.from && args.from !== ZERO_ADDRESS) {
      candidateAddresses.add(args.from.toLowerCase());
    }
    if (args.to && args.to !== ZERO_ADDRESS) {
      candidateAddresses.add(args.to.toLowerCase());
    }
  }

  // Also get Minted events (EquityToken custom event)
  try {
    const mintedLogs = await publicClient.getLogs({
      address: equityToken,
      event: parseAbiItem("event Minted(address indexed to, uint256 amount)"),
      fromBlock: 0n,
    });
    for (const log of mintedLogs) {
      const args = log.args as { to?: `0x${string}` };
      if (args.to) {
        candidateAddresses.add(args.to.toLowerCase());
      }
    }
  } catch {
    // Minted might not exist on older contracts, Transfer covers it
  }

  // Check balance for each candidate
  for (const addr of candidateAddresses) {
    const balance = await publicClient.readContract({
      address: equityToken,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [addr as `0x${string}`],
    });
    if (balance > 0n) {
      shareholders.push({
        address: addr as `0x${string}`,
        balance: balance.toString(),
        balanceFormatted: (Number(balance) / 1e18).toFixed(2),
      });
    }
  }

  return shareholders;
}
