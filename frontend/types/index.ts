// ============================================
// Core Types for Arc Stock Equity Platform
// ============================================

/**
 * Company/Issuer information
 */
export interface Company {
    id: string;
    name: string;
    ticker: string;
    sector: Sector;
    logoUrl?: string;
    description?: string;
    isVerified: boolean;
    status: CompanyStatus;
    sharePrice: number;
    totalSupply: number;
    treasuryBalance: number;
    marketCap: number;
    legalHash?: string;
    createdAt: Date;
}

export type CompanyStatus = "open" | "paused" | "closed";

export type Sector =
    | "technology"
    | "energy"
    | "finance"
    | "logistics"
    | "healthcare"
    | "real-estate"
    | "consumer"
    | "other";

/**
 * Investment record
 */
export interface Investment {
    id: string;
    companyId: string;
    companyName: string;
    shares: number;
    amountUsdc: number;
    pricePerShare: number;
    chain: Chain;
    txHash: string;
    createdAt: Date;
}

/**
 * Supported blockchain networks
 */
export type Chain =
    | "ethereum"
    | "polygon"
    | "arbitrum"
    | "base"
    | "optimism"
    | "avalanche"
    | "solana"
    | "arc";

export interface ChainInfo {
    id: Chain;
    name: string;
    shortName: string;
    color: string;
}

/**
 * Activity feed item
 */
export interface Activity {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    amount?: number;
    shares?: number;
    txHash?: string;
    createdAt: Date;
}

export type ActivityType =
    | "investment"
    | "dividend"
    | "buyback"
    | "issuance"
    | "legal_update"
    | "governance";

/**
 * Portfolio summary
 */
export interface Portfolio {
    totalInvested: number;
    totalShares: number;
    dividendsReceived: number;
    companiesCount: number;
    investments: Investment[];
}

/**
 * User/Investor profile
 */
export interface User {
    address: string;
    chain: Chain;
    portfolio?: Portfolio;
    isKycVerified: boolean;
}

/**
 * Treasury action types for issuers
 */
export interface TreasuryAction {
    id: string;
    type: TreasuryActionType;
    amount: number;
    shares?: number;
    status: "pending" | "executed" | "failed";
    txHash?: string;
    createdAt: Date;
}

export type TreasuryActionType =
    | "issue_shares"
    | "buyback"
    | "cancel_shares"
    | "distribute_dividend"
    | "rebalance";

/**
 * Agentic treasury rule
 */
export interface AgentRule {
    id: string;
    name: string;
    description: string;
    trigger: AgentTriggerType;
    threshold: number;
    action: AgentActionType;
    isActive: boolean;
    lastChecked?: Date;
    lastTriggered?: Date;
    oracle?: string;
}

export type AgentTriggerType =
    | "premium"
    | "discount"
    | "balance"
    | "time";

export type AgentActionType =
    | "issue_shares"
    | "distribute_dividends"
    | "execute_buyback"
    | "rebalance"
    | "alert";

/**
 * Agent log entry
 */
export interface AgentLog {
    id: string;
    timestamp: Date;
    ruleId: string;
    ruleName: string;
    status: "success" | "pending" | "failed";
    message: string;
    txHash?: string;
}

/**
 * Order book entry
 */
export interface OrderBookEntry {
    price: number;
    size: number;
    total: number;
}

/**
 * Trade history entry
 */
export interface Trade {
    id: string;
    price: number;
    size: number;
    side: "buy" | "sell";
    timestamp: Date;
}

/**
 * Market order
 */
export interface Order {
    type: "market" | "limit";
    side: "buy" | "sell";
    amount: number;
    price?: number;
}

/**
 * Price oracle data
 */
export interface OraclePrice {
    source: string;
    chain: Chain;
    label: string;
    price: number;
    lastUpdated: Date;
}

/**
 * Demand signal data point
 */
export interface DemandSignal {
    date: Date;
    value: number;
    isHighlighted?: boolean;
}

// ============================================
// Component Props Types
// ============================================

export interface StatCardProps {
    title: string;
    value: string | number;
    trend?: {
        value: number;
        label?: string;
    };
    icon?: string;
}

export interface BadgeVariant {
    variant: "success" | "warning" | "danger" | "info" | "default";
}
