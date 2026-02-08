/**
 * ArcStock Backend API Client
 * Uses relative /api when unset (proxied via next.config rewrites).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = path.startsWith("/") ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `API error ${res.status}`);
  }

  return data as T;
}

// --- Types ---

export interface IntentResponse {
  intentId: string;
  companyId: number;
  amount: string;
  investorAddress: string;
  sourceDomain: number;
  typedData: {
    domain: { name: string; version: string };
    types: Record<string, { name: string; type: string }[]>;
    primaryType: string;
    message: Record<string, unknown>;
  };
}

export interface CompleteResponse {
  success: boolean;
  transferId: string;
  mintTxHash: string;
  settlementTxHash: string;
}

export interface BalancesResponse {
  token: string;
  balances: Array<{ domain: number; balance: string; depositor?: string }>;
  pendingDeposits?: Array<{
    domain: number;
    amount: string;
    status: string;
    transactionHash?: string;
  }>;
}

export interface TreasuryResponse {
  companyId: number;
  balance: string;
}

export interface IssuerCompany {
  id: number;
  name: string;
  symbol: string;
  metadataUri: string;
  equityToken: string;
  companyWallet: string;
  active: boolean;
  treasuryBalance?: string;
  totalSupply?: string;
}

export interface RegisterCompanyResponse {
  success: boolean;
  companyId: number;
  equityToken: string;
}

export interface ApiCompany {
  id: number;
  name: string;
  symbol: string;
  metadataUri: string;
  equityToken: string;
  companyWallet: string;
  active: boolean;
  treasuryBalance: string;
  totalSupply: string;
}

export interface PortfolioItem {
  companyId: number;
  companyName: string;
  symbol: string;
  equityToken: string;
  balance: string;
  totalSupply: string;
}

// --- API ---

export async function createIntent(params: {
  companyId: number;
  amount: string;
  investorAddress: string;
  sourceDomain?: number;
}): Promise<IntentResponse> {
  return fetchApi<IntentResponse>("/api/invest/intent", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function completeInvestment(params: {
  signedBurnIntent: { burnIntent: Record<string, unknown>; signature: string };
  companyId: number;
  investorAddress: string;
  usdcAmount: string;
  shareAmount: string;
}): Promise<CompleteResponse> {
  return fetchApi<CompleteResponse>("/api/invest/complete", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getBalances(address: string): Promise<BalancesResponse> {
  return fetchApi<BalancesResponse>(`/api/invest/balances/${address}`);
}

export async function getTreasuryBalance(companyId: number): Promise<TreasuryResponse> {
  return fetchApi<TreasuryResponse>(`/api/invest/treasury/${companyId}`);
}

export async function getBackendAddress(): Promise<{ backendWallet: string }> {
  return fetchApi<{ backendWallet: string }>("/api/invest/backend-address");
}

// --- Issuer API ---

export async function getIssuerCompany(wallet: string): Promise<IssuerCompany> {
  return fetchApi<IssuerCompany>(`/api/issuer/company/${wallet}`);
}

/** Returns null if no company exists for this wallet (404) */
export async function getIssuerCompanyOrNull(
  wallet: string
): Promise<IssuerCompany | null> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  const url = `${base}/api/issuer/company/${wallet}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `API error ${res.status}`);
  return data as IssuerCompany;
}

export async function registerCompany(params: {
  name: string;
  symbol: string;
  metadataUri?: string;
  companyWallet: string;
}): Promise<RegisterCompanyResponse> {
  return fetchApi<RegisterCompanyResponse>("/api/issuer/register", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function executeBuyback(params: {
  companyId: number;
  from: string;
  amount: string;
  issuerAddress: string;
}): Promise<{ success: boolean; txHash: string }> {
  return fetchApi<{ success: boolean; txHash: string }>("/api/issuer/buyback", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function mintShares(params: {
  companyId: number;
  to: string;
  amount: string;
  issuerAddress: string;
}): Promise<{ success: boolean; txHash: string }> {
  return fetchApi<{ success: boolean; txHash: string }>("/api/issuer/mint", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function withdrawFromTreasury(params: {
  companyId: number;
  to: string;
  amount: string;
  issuerAddress: string;
}): Promise<{ success: boolean; txHash: string }> {
  return fetchApi<{ success: boolean; txHash: string }>(
    "/api/issuer/withdraw",
    {
      method: "POST",
      body: JSON.stringify(params),
    }
  );
}

export interface Shareholder {
  address: string;
  balance: string;
  balanceFormatted: string;
}

export async function getShareholders(
  companyId: number,
  issuerAddress: string
): Promise<Shareholder[]> {
  return fetchApi<Shareholder[]>(
    `/api/issuer/shareholders/${companyId}?issuerAddress=${encodeURIComponent(issuerAddress)}`
  );
}

export interface DividendDistribution {
  address: string;
  amount: string;
  amountFormatted: string;
  txHash: string;
}

export async function distributeDividends(params: {
  companyId: number;
  amount: string;
  issuerAddress: string;
}): Promise<{ success: boolean; distributions: DividendDistribution[] }> {
  return fetchApi<{ success: boolean; distributions: DividendDistribution[] }>(
    "/api/issuer/dividends",
    {
      method: "POST",
      body: JSON.stringify(params),
    }
  );
}

// --- Companies & Investor API ---

export async function getCompanies(): Promise<ApiCompany[]> {
  return fetchApi<ApiCompany[]>("/api/companies");
}

export async function getInvestorPortfolio(
  wallet: string
): Promise<PortfolioItem[]> {
  return fetchApi<PortfolioItem[]>(`/api/investor/portfolio/${wallet}`);
}

/** Map API company to frontend Company type */
export function mapApiCompanyToCompany(api: ApiCompany) {
  const treasury = parseFloat(api.treasuryBalance) / 1e6;
  const supply = parseFloat(api.totalSupply) / 1e18;
  const sharePrice = supply > 0 ? treasury / supply : 1;
  const marketCap = supply > 0 ? sharePrice * supply : 0;
  return {
    id: String(api.id),
    name: api.name,
    ticker: api.symbol,
    sector: "other" as const,
    isVerified: true,
    status: (api.active ? "open" : "closed") as "open" | "paused" | "closed",
    sharePrice,
    totalSupply: supply,
    treasuryBalance: treasury,
    marketCap,
    createdAt: new Date(),
  };
}
