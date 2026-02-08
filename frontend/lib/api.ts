const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Agent Management API
 */

export async function fetchAgentLogs(companyId: string, limit: number = 50) {
    const res = await fetch(`${API_BASE_URL}/api/agent/logs/${companyId}?limit=${limit}`);
    if (!res.ok) {
        throw new Error('Failed to fetch agent logs');
    }
    return res.json();
}

export async function fetchAgentConfig(companyId: string) {
    const res = await fetch(`${API_BASE_URL}/api/agent/config/${companyId}`);
    if (!res.ok) {
        throw new Error('Failed to fetch agent config');
    }
    return res.json();
}

export interface AgentConfig {
    companyId: string;
    isEnabled: boolean;
    riskTolerance: 'low' | 'medium' | 'high';
    maxMintPerDay: number;
    maxDividendPerDay: number;
    walletAddress: string;
}

export async function updateAgentConfig(config: AgentConfig) {
    const res = await fetch(`${API_BASE_URL}/api/agent/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    });
    if (!res.ok) {
        throw new Error('Failed to update agent config');
    }
    return res.json();
}

export async function fetchGeminiInsights(companyId: string, limit: number = 10) {
    const res = await fetch(`${API_BASE_URL}/api/agent/insights/${companyId}?limit=${limit}`);
    if (!res.ok) {
        throw new Error('Failed to fetch Gemini insights');
    }
    return res.json();
}

export async function triggerAgentExecution(companyId: string) {
    const res = await fetch(`${API_BASE_URL}/api/agent/execute/${companyId}`, {
        method: 'POST',
    });
    if (!res.ok) {
        throw new Error('Failed to trigger agent execution');
    }
    return res.json();
}

export async function fetchAgentStats() {
    const res = await fetch(`${API_BASE_URL}/api/agent/stats`);
    if (!res.ok) {
        throw new Error('Failed to fetch agent stats');
    }
    return res.json();
}

/**
 * Oracle Data API
 */

export async function fetchOraclePrice(companyId: string) {
    const res = await fetch(`${API_BASE_URL}/api/oracle/price/${companyId}`);
    if (!res.ok) {
        throw new Error('Failed to fetch oracle price');
    }
    return res.json();
}

export async function fetchOracleSignals(companyId: string) {
    const res = await fetch(`${API_BASE_URL}/api/oracle/signals/${companyId}`);
    if (!res.ok) {
        throw new Error('Failed to fetch oracle signals');
    }
    return res.json();
}

export async function fetchOracleHistory(companyId: string, dataType: string, hours: number = 24) {
    const res = await fetch(`${API_BASE_URL}/api/oracle/history/${companyId}/${dataType}?hours=${hours}`);
    if (!res.ok) {
        throw new Error('Failed to fetch oracle history');
    }
    return res.json();
}

export async function fetchLatestOracleData() {
    const res = await fetch(`${API_BASE_URL}/api/oracle/latest`);
    if (!res.ok) {
        throw new Error('Failed to fetch latest oracle data');
    }
    return res.json();
}

/**
 * Investment API (existing)
 */

export async function createBurnIntent(data: {
    fromChainDomain: number;
    amount: string;
    destinationRecipient: string;
}) {
    const res = await fetch(`${API_BASE_URL}/api/invest/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        throw new Error('Failed to create burn intent');
    }
    return res.json();
}

export async function completeInvestment(data: {
    signedBurnIntent: any;
    companyId: number;
    shareAmount: string;
}) {
    const res = await fetch(`${API_BASE_URL}/api/invest/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        throw new Error('Failed to complete investment');
    }
    return res.json();
}

export async function fetchGatewayBalances(address: string) {
    const res = await fetch(`${API_BASE_URL}/api/invest/balances/${address}`);
    if (!res.ok) {
        throw new Error('Failed to fetch Gateway balances');
    }
    return res.json();
}

export async function fetchTreasuryBalance(companyId: string) {
    const res = await fetch(`${API_BASE_URL}/api/invest/treasury/${companyId}`);
    if (!res.ok) {
        throw new Error('Failed to fetch treasury balance');
    }
    return res.json();
}
