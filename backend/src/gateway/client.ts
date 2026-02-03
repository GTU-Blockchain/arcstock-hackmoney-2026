/**
 * Circle Gateway API Client
 * @see https://developers.circle.com/gateway/quickstarts/unified-balance-evm
 */
import { config } from "../config.js";

const BASE_URL = config.gatewayApiUrl;

/** Serialize for JSON (bigint -> string) */
function serialize(obj: unknown): string {
    return JSON.stringify(obj, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value,
    );
}

export interface GatewayBalance {
    domain: number;
    balance: string;
}

export interface GetBalancesResponse {
    balances: GatewayBalance[];
}

/**
 * Get unified USDC balance across chains for a depositor
 * POST /v1/balances
 */
export async function getBalances(
    depositor: string,
    domains: number[] = [0, 1, 6, 26],
): Promise<GetBalancesResponse> {
    const res = await fetch(`${BASE_URL}/v1/balances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            token: "USDC",
            sources: domains.map((domain) => ({ domain, depositor })),
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gateway balances error ${res.status}: ${err}`);
    }

    return res.json();
}

export interface TransferAttestationResponse {
    transferId: string;
    attestation: string;
    signature: string;
    fees: { total: string; token: string };
    expirationBlock: string;
}

/** Ensure uint256 fields are strings for Gateway API */
function normalizeBurnIntent(
    obj: Record<string, unknown>,
): Record<string, unknown> {
    const normalized = { ...obj };
    if ("value" in normalized && typeof normalized.value !== "string") {
        normalized.value = String(normalized.value);
    }
    if (
        "maxBlockHeight" in normalized &&
        typeof normalized.maxBlockHeight !== "string"
    ) {
        normalized.maxBlockHeight = String(normalized.maxBlockHeight);
    }
    if ("maxFee" in normalized && typeof normalized.maxFee !== "string") {
        normalized.maxFee = String(normalized.maxFee);
    }
    if (normalized.spec && typeof normalized.spec === "object") {
        const spec = normalized.spec as Record<string, unknown>;
        if (typeof spec.value !== "string")
            spec.value = String(spec.value ?? 0);
        normalized.spec = spec;
    }
    return normalized;
}

/**
 * Create transfer attestation from signed burn intents
 * POST /v1/transfer
 * Body: array of { burnIntent, signature }
 */
export async function createTransferAttestation(
    requests: Array<{ burnIntent: Record<string, unknown>; signature: string }>,
): Promise<TransferAttestationResponse> {
    const normalized = requests.map((r) => ({
        burnIntent: normalizeBurnIntent(r.burnIntent),
        signature: r.signature,
    }));

    const res = await fetch(`${BASE_URL}/v1/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: serialize(normalized),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gateway transfer error ${res.status}: ${err}`);
    }

    const json = await res.json();

    // API may return single object or array (batch)
    const data = Array.isArray(json) ? json[0] : json;
    if (!data?.attestation || !data?.signature) {
        throw new Error("Missing attestation or signature in Gateway response");
    }

    return data;
}
