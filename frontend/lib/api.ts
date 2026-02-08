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
}

export interface TreasuryResponse {
  companyId: number;
  balance: string;
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
