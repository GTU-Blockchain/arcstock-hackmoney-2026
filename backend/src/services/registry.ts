/**
 * EquityRegistry Service
 * Reads company data and registers new companies.
 */
import {
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "../config.js";

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

function getWalletClient() {
  if (!config.privateKey) {
    throw new Error("PRIVATE_KEY not set - cannot register companies");
  }
  const account = privateKeyToAccount(config.privateKey);
  return createWalletClient({
    account,
    chain: arcChain,
    transport: http(config.arcRpcUrl),
  });
}

// EquityRegistry ABI - companies(uint256), nextCompanyId, registerCompany
const registryAbi = [
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "companies",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "metadataUri", type: "string" },
      { name: "equityToken", type: "address" },
      { name: "companyWallet", type: "address" },
      { name: "active", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextCompanyId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "name_", type: "string" },
      { name: "symbol_", type: "string" },
      { name: "metadataUri_", type: "string" },
      { name: "companyWallet_", type: "address" },
    ],
    name: "registerCompany",
    outputs: [
      { name: "companyId", type: "uint256" },
      { name: "equityToken", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "companyId_", type: "uint256" },
      { name: "from", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "cancelShares",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "companyId_", type: "uint256" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "mintShares",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "account", type: "address" },
      { name: "authorized", type: "bool" },
    ],
    name: "setAuthorizedMinter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export interface Company {
  id: number;
  name: string;
  symbol: string;
  metadataUri: string;
  equityToken: `0x${string}`;
  companyWallet: `0x${string}`;
  active: boolean;
}

/**
 * Get company by wallet address (companyWallet).
 * Returns null if no company is registered for this wallet.
 */
export async function getCompanyByWallet(
  wallet: `0x${string}`
): Promise<Company | null> {
  const nextId = await publicClient.readContract({
    address: config.equityRegistry,
    abi: registryAbi,
    functionName: "nextCompanyId",
  });

  const count = Number(nextId);
  if (count === 0) return null;

  for (let id = 1; id < count; id++) {
    const [cid, name, symbol, metadataUri, equityToken, companyWallet, active] =
      await publicClient.readContract({
        address: config.equityRegistry,
        abi: registryAbi,
        functionName: "companies",
        args: [BigInt(id)],
      });

    if (companyWallet.toLowerCase() === wallet.toLowerCase()) {
      return {
        id: Number(cid),
        name,
        symbol,
        metadataUri,
        equityToken: equityToken as `0x${string}`,
        companyWallet: companyWallet as `0x${string}`,
        active,
      };
    }
  }

  return null;
}

/**
 * Get company by id.
 */
export async function getCompanyById(
  companyId: number
): Promise<Company | null> {
  const [cid, name, symbol, metadataUri, equityToken, companyWallet, active] =
    await publicClient.readContract({
      address: config.equityRegistry,
      abi: registryAbi,
      functionName: "companies",
      args: [BigInt(companyId)],
    });

  if (Number(cid) === 0) return null;

  return {
    id: Number(cid),
    name,
    symbol,
    metadataUri,
    equityToken: equityToken as `0x${string}`,
    companyWallet: companyWallet as `0x${string}`,
    active,
  };
}

/**
 * Get all companies (for investor marketplace).
 */
export async function getAllCompanies(): Promise<Company[]> {
  const nextId = await publicClient.readContract({
    address: config.equityRegistry,
    abi: registryAbi,
    functionName: "nextCompanyId",
  });

  const count = Number(nextId);
  if (count <= 1) return [];

  const companies: Company[] = [];
  for (let id = 1; id < count; id++) {
    const [cid, name, symbol, metadataUri, equityToken, companyWallet, active] =
      await publicClient.readContract({
        address: config.equityRegistry,
        abi: registryAbi,
        functionName: "companies",
        args: [BigInt(id)],
      });

    if (active) {
      companies.push({
        id: Number(cid),
        name,
        symbol,
        metadataUri,
        equityToken: equityToken as `0x${string}`,
        companyWallet: companyWallet as `0x${string}`,
        active,
      });
    }
  }

  return companies;
}

export interface CompanyWithDetails extends Company {
  treasuryBalance: string;
  totalSupply: string;
}

const treasuryBalanceAbi = [
  {
    inputs: [{ name: "companyId", type: "uint256" }],
    name: "getBalance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const erc20TotalSupplyAbi = [
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Get company by wallet with treasury and totalSupply (for issuer dashboard).
 */
export async function getCompanyWithDetailsByWallet(
  wallet: `0x${string}`
): Promise<CompanyWithDetails | null> {
  const company = await getCompanyByWallet(wallet);
  if (!company) return null;

  const [treasuryBalance, totalSupply] = await Promise.all([
    publicClient.readContract({
      address: config.treasury,
      abi: treasuryBalanceAbi,
      functionName: "getBalance",
      args: [BigInt(company.id)],
    }),
    publicClient.readContract({
      address: company.equityToken,
      abi: erc20TotalSupplyAbi,
      functionName: "totalSupply",
      args: [],
    }),
  ]);

  return {
    ...company,
    treasuryBalance: treasuryBalance.toString(),
    totalSupply: totalSupply.toString(),
  };
}

/**
 * Get all companies with treasury balance and total supply (for investor UI).
 */
export async function getAllCompaniesWithDetails(): Promise<CompanyWithDetails[]> {
  const companies = await getAllCompanies();

  const result: CompanyWithDetails[] = [];
  for (const c of companies) {
    const [treasuryBalance, totalSupply] = await Promise.all([
      publicClient.readContract({
        address: config.treasury,
        abi: treasuryBalanceAbi,
        functionName: "getBalance",
        args: [BigInt(c.id)],
      }),
      publicClient.readContract({
        address: c.equityToken,
        abi: erc20TotalSupplyAbi,
        functionName: "totalSupply",
        args: [],
      }),
    ]);
    result.push({
      ...c,
      treasuryBalance: treasuryBalance.toString(),
      totalSupply: totalSupply.toString(),
    });
  }
  return result;
}

export interface RegisterCompanyParams {
  name: string;
  symbol: string;
  metadataUri: string;
  companyWallet: `0x${string}`;
}

/**
 * Register a new company (owner only).
 */
export async function registerCompany(
  params: RegisterCompanyParams
): Promise<{ companyId: number; equityToken: string }> {
  const { name, symbol, metadataUri, companyWallet } = params;

  const wallet = getWalletClient();
  if (!wallet.account) throw new Error("No wallet account");

  const hash = await wallet.writeContract({
    address: config.equityRegistry,
    abi: registryAbi,
    functionName: "registerCompany",
    args: [name, symbol, metadataUri, companyWallet],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error("Transaction failed");
  }

  const company = await getCompanyByWallet(companyWallet);
  if (!company) {
    throw new Error("Company registered but could not fetch");
  }

  return {
    companyId: company.id,
    equityToken: company.equityToken,
  };
}

/**
 * Cancel shares (buyback). Only authorized (backend) can call.
 * Caller must verify issuerWallet is companyWallet for this company.
 */
export async function cancelShares(params: {
  companyId: number;
  from: `0x${string}`;
  amount: string;
}): Promise<{ txHash: string }> {
  const { companyId, from, amount } = params;
  const amountWei = parseUnits(String(amount), 18);

  const wallet = getWalletClient();
  if (!wallet.account) throw new Error("No wallet account");

  const hash = await wallet.writeContract({
    address: config.equityRegistry,
    abi: registryAbi,
    functionName: "cancelShares",
    args: [BigInt(companyId), from, amountWei],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error("Transaction failed");
  }

  return { txHash: hash };
}

/**
 * Mint new shares. Only authorized (backend) can call.
 */
export async function mintShares(params: {
  companyId: number;
  to: `0x${string}`;
  amount: string;
}): Promise<{ txHash: string }> {
  const { companyId, to, amount } = params;
  const amountWei = parseUnits(String(amount), 18);

  const wallet = getWalletClient();
  if (!wallet.account) throw new Error("No wallet account");

  const hash = await wallet.writeContract({
    address: config.equityRegistry,
    abi: registryAbi,
    functionName: "mintShares",
    args: [BigInt(companyId), to, amountWei],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error("Transaction failed");
  }

  return { txHash: hash };
}

/**
 * Authorize an address to call mintShares and transferFromCompany.
 * Only registry owner can call.
 */
export async function setAuthorizedMinter(
  account: `0x${string}`,
  authorized: boolean
): Promise<{ txHash: string }> {
  const wallet = getWalletClient();
  if (!wallet.account) throw new Error("No wallet account");

  const hash = await wallet.writeContract({
    address: config.equityRegistry,
    abi: registryAbi,
    functionName: "setAuthorizedMinter",
    args: [account, authorized],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error("Transaction failed");
  }

  return { txHash: hash };
}
