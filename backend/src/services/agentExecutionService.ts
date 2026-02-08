import { createPublicClient, createWalletClient, http, parseEther, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "../config.js";
import { db } from "../database/client.js";
import StorkService from "./storkService.js";
import GeminiService from "./geminiService.js";
import { equityRegistryAbi } from "../abis/EquityRegistry.js";
import { treasuryAbi } from "../abis/Treasury.js";
import { erc20Abi } from "../abis/ERC20.js";

interface Decision {
    action: 'mint_shares' | 'distribute_dividends' | 'execute_buyback' | 'hold';
    reasoning: string;
    confidence: number;
    params?: {
        amount?: number;
        recipients?: string[];
    };
    riskLevel: 'low' | 'medium' | 'high';
}

interface AgentConfig {
    is_enabled: boolean;
    risk_tolerance: string;
    max_mint_per_day: number;
    max_dividend_per_day: number;
}

interface CompanyData {
    companyId: number;
    name: string;
    symbol: string;
    equityTokenAddress: string;
    companyWalletAddress: string;
    treasury: number;
    supply: number;
    currentPrice: number;
    marketCap: number;
    nav: number;
}

const arcTestnet = {
    id: config.arcChainId,
    name: "Arc Testnet",
    network: "arc-testnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: { http: [config.arcRpcUrl] },
        public: { http: [config.arcRpcUrl] },
    },
};

export default class AgentExecutionService {
    private stork: StorkService;
    private gemini: GeminiService;
    private publicClient: any;
    private walletClient: any;

    constructor() {
        this.stork = new StorkService();
        this.gemini = new GeminiService();

        this.publicClient = createPublicClient({
            chain: arcTestnet,
            transport: http(config.arcRpcUrl),
        });

        if (config.privateKey) {
            const account = privateKeyToAccount(config.privateKey);
            this.walletClient = createWalletClient({
                account,
                chain: arcTestnet,
                transport: http(config.arcRpcUrl),
            });
        }
    }

    /**
     * Main evaluation loop - called by scheduler for each enabled company
     */
    async evaluateCompany(companyId: number): Promise<void> {
        const startTime = Date.now();
        console.log(`[Agent] Evaluating company ${companyId}...`);

        try {
            // 1. Check if agent is enabled
            const agentConfig = await this.getAgentConfig(companyId);
            if (!agentConfig || !agentConfig.is_enabled) {
                console.log(`[Agent] Agent disabled for company ${companyId}`);
                return;
            }

            // 2. Gather on-chain data
            const onChainData = await this.fetchOnChainData(companyId);
            if (!onChainData) {
                console.error(`[Agent] Failed to fetch on-chain data for company ${companyId}`);
                return;
            }

            // 3. Gather oracle data
            const oracleData = await this.stork.getOracleData(companyId);

            // 4. Get historical context
            const historicalData = await this.getHistoricalContext(companyId);

            // 5. Build context for Gemini
            const context = {
                companyId: onChainData.companyId,
                name: onChainData.name,
                symbol: onChainData.symbol,
                currentPrice: oracleData.price,
                treasury: onChainData.treasury,
                supply: onChainData.supply,
                marketCap: onChainData.marketCap,
                nav: onChainData.nav,
                priceVsNav: ((oracleData.price - onChainData.nav) / onChainData.nav) * 100,
                oracleData: {
                    demand: oracleData.demand,
                    liquidity: oracleData.liquidity,
                    volume: oracleData.volume,
                },
                historicalData,
                agentConfig: {
                    riskTolerance: agentConfig.risk_tolerance,
                    maxMintPerDay: agentConfig.max_mint_per_day,
                    maxDividendPerDay: agentConfig.max_dividend_per_day,
                },
            };

            // 6. Ask Gemini for decision
            const decision = await this.gemini.analyzeAndDecide(context);

            console.log(`[Agent] Decision for company ${companyId}:`, decision);

            // 7. Validate safety limits
            const isValid = await this.validateSafetyLimits(decision, agentConfig, companyId);
            if (!isValid) {
                await this.logDecision(
                    companyId,
                    decision.action,
                    'Safety limits exceeded',
                    'failed',
                    decision.params,
                    null,
                    Date.now() - startTime
                );
                console.log(`[Agent] Safety limits exceeded for company ${companyId}`);
                return;
            }

            // 8. Log decision as pending
            const logId = await this.logDecision(
                companyId,
                decision.action,
                decision.reasoning,
                'pending',
                decision.params,
                null,
                Date.now() - startTime
            );

            // 9. Execute action if not 'hold'
            if (decision.action !== 'hold') {
                const txHash = await this.executeAction(decision, onChainData);
                await this.updateLogStatus(logId, 'success', txHash, Date.now() - startTime);
                console.log(`[Agent] Action executed successfully: ${txHash}`);
            } else {
                await this.updateLogStatus(logId, 'success', null, Date.now() - startTime);
                console.log(`[Agent] Decision: hold (no action)`);
            }

            // 10. Update company cache
            await this.syncCompanyData(companyId, onChainData, oracleData.price);

        } catch (error) {
            console.error(`[Agent] Error evaluating company ${companyId}:`, error);
            await this.logDecision(
                companyId,
                'hold',
                `Error during evaluation: ${error}`,
                'failed',
                null,
                null,
                Date.now() - startTime
            );
        }
    }

    /**
     * Fetch on-chain data for a company
     */
    private async fetchOnChainData(companyId: number): Promise<CompanyData | null> {
        try {
            // Get company details from registry
            const companyDetails = await this.publicClient.readContract({
                address: config.equityRegistry,
                abi: equityRegistryAbi,
                functionName: "companies",
                args: [BigInt(companyId)],
            });

            const [name, symbol, metadataUri, equityToken, companyWallet] = companyDetails;

            // Get total supply from equity token
            const totalSupply = await this.publicClient.readContract({
                address: equityToken,
                abi: erc20Abi,
                functionName: "totalSupply",
            });

            // Get treasury balance
            const treasuryBalance = await this.publicClient.readContract({
                address: config.treasury,
                abi: treasuryAbi,
                functionName: "companyBalance",
                args: [BigInt(companyId)],
            });

            const supply = parseFloat(formatUnits(totalSupply, 18));
            const treasury = parseFloat(formatUnits(treasuryBalance, 6)); // USDC is 6 decimals

            // Calculate NAV (Net Asset Value)
            const nav = supply > 0 ? treasury / supply : 0;

            // For now, use a mock market cap calculation
            const mockPrice = 10; // We'll get real price from Stork
            const marketCap = supply * mockPrice;

            return {
                companyId,
                name,
                symbol,
                equityTokenAddress: equityToken,
                companyWalletAddress: companyWallet,
                treasury,
                supply,
                currentPrice: mockPrice, // Will be overridden by Stork data
                marketCap,
                nav,
            };
        } catch (error) {
            console.error('[Agent] Error fetching on-chain data:', error);
            return null;
        }
    }

    /**
     * Get historical context for decision-making
     */
    private async getHistoricalContext(companyId: number): Promise<any> {
        try {
            // Get average price from last 7 days
            const priceHistory = await this.stork.getHistoricalData(companyId, 'price', 168);
            const avgPrice = priceHistory.length > 0
                ? priceHistory.reduce((sum, row) => sum + parseFloat(row.value), 0) / priceHistory.length
                : 10;

            // Get last action
            const lastActionResult = await db.query(
                `SELECT decision_type, timestamp FROM agent_logs
                 WHERE company_id = $1 AND decision_type != 'hold' AND status = 'success'
                 ORDER BY timestamp DESC LIMIT 1`,
                [companyId]
            );

            const lastAction = lastActionResult.rows.length > 0 ? lastActionResult.rows[0].decision_type : null;
            const daysAgo = lastActionResult.rows.length > 0
                ? Math.floor((Date.now() - new Date(lastActionResult.rows[0].timestamp).getTime()) / (1000 * 60 * 60 * 24))
                : null;

            return {
                avgPrice,
                lastAction,
                daysAgo,
            };
        } catch (error) {
            console.error('[Agent] Error getting historical context:', error);
            return {
                avgPrice: 10,
                lastAction: null,
                daysAgo: null,
            };
        }
    }

    /**
     * Validate action against safety limits
     */
    private async validateSafetyLimits(
        decision: Decision,
        config: AgentConfig,
        companyId: number
    ): Promise<boolean> {
        try {
            const today = new Date().toISOString().split('T')[0];

            if (decision.action === 'mint_shares' && decision.params?.amount) {
                // Check daily mint limit
                const result = await db.query(
                    `SELECT SUM(CAST(action_params->>'amount' AS DECIMAL)) as total_minted
                     FROM agent_logs
                     WHERE company_id = $1 AND decision_type = 'mint_shares'
                     AND status = 'success' AND DATE(timestamp) = $2`,
                    [companyId, today]
                );

                const totalMinted = parseFloat(result.rows[0]?.total_minted || '0');
                const proposedAmount = decision.params.amount;

                if (totalMinted + proposedAmount > config.max_mint_per_day) {
                    console.log(`[Agent] Mint limit exceeded: ${totalMinted + proposedAmount} > ${config.max_mint_per_day}`);
                    return false;
                }
            }

            if (decision.action === 'distribute_dividends' && decision.params?.amount) {
                // Check daily dividend limit
                const result = await db.query(
                    `SELECT SUM(CAST(action_params->>'amount' AS DECIMAL)) as total_distributed
                     FROM agent_logs
                     WHERE company_id = $1 AND decision_type = 'distribute_dividends'
                     AND status = 'success' AND DATE(timestamp) = $2`,
                    [companyId, today]
                );

                const totalDistributed = parseFloat(result.rows[0]?.total_distributed || '0');
                const proposedAmount = decision.params.amount;

                if (totalDistributed + proposedAmount > config.max_dividend_per_day) {
                    console.log(`[Agent] Dividend limit exceeded: ${totalDistributed + proposedAmount} > ${config.max_dividend_per_day}`);
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('[Agent] Error validating safety limits:', error);
            return false;
        }
    }

    /**
     * Execute on-chain action based on decision
     */
    private async executeAction(decision: Decision, companyData: CompanyData): Promise<string> {
        if (!this.walletClient) {
            throw new Error('Wallet client not initialized (missing PRIVATE_KEY)');
        }

        try {
            switch (decision.action) {
                case 'mint_shares':
                    return await this.executeMintShares(
                        companyData.companyId,
                        decision.params?.amount || 1000,
                        companyData.companyWalletAddress
                    );

                case 'distribute_dividends':
                    return await this.executeDividendDistribution(
                        companyData.companyId,
                        decision.params?.amount || 1000
                    );

                case 'execute_buyback':
                    return await this.executeBuyback(
                        companyData.companyId,
                        decision.params?.amount || 1000
                    );

                default:
                    throw new Error(`Unknown action: ${decision.action}`);
            }
        } catch (error) {
            console.error('[Agent] Error executing action:', error);
            throw error;
        }
    }

    /**
     * Execute mint shares action
     */
    private async executeMintShares(
        companyId: number,
        amount: number,
        recipient: string
    ): Promise<string> {
        const amountInWei = parseEther(amount.toString());

        const hash = await this.walletClient.writeContract({
            address: config.equityRegistry,
            abi: equityRegistryAbi,
            functionName: "mintShares",
            args: [BigInt(companyId), recipient, amountInWei],
        });

        console.log(`[Agent] Minting ${amount} shares for company ${companyId}: ${hash}`);
        return hash;
    }

    /**
     * Execute dividend distribution
     */
    private async executeDividendDistribution(
        companyId: number,
        amount: number
    ): Promise<string> {
        const amountInUsdc = BigInt(Math.floor(amount * 1_000_000)); // USDC has 6 decimals

        // For now, withdraw to company wallet (in production, distribute to all shareholders)
        const hash = await this.walletClient.writeContract({
            address: config.treasury,
            abi: treasuryAbi,
            functionName: "withdraw",
            args: [BigInt(companyId), amountInUsdc],
        });

        console.log(`[Agent] Distributing $${amount} dividend for company ${companyId}: ${hash}`);
        return hash;
    }

    /**
     * Execute buyback (placeholder - requires custom implementation)
     */
    private async executeBuyback(companyId: number, amount: number): Promise<string> {
        // TODO: Implement buyback logic
        // This requires: withdraw from treasury, buy shares from market, cancel shares
        console.log(`[Agent] Buyback not yet implemented for company ${companyId}`);
        throw new Error('Buyback not yet implemented');
    }

    /**
     * Log agent decision to database
     */
    private async logDecision(
        companyId: number,
        decisionType: string,
        reasoning: string,
        status: string,
        actionParams: any,
        txHash: string | null,
        durationMs: number
    ): Promise<string> {
        try {
            const result = await db.query(
                `INSERT INTO agent_logs (company_id, decision_type, status, reasoning, action_params, tx_hash, execution_duration_ms)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING id`,
                [companyId, decisionType, status, reasoning, JSON.stringify(actionParams), txHash, durationMs]
            );

            return result.rows[0].id;
        } catch (error) {
            console.error('[Agent] Error logging decision:', error);
            throw error;
        }
    }

    /**
     * Update log status after execution
     */
    private async updateLogStatus(
        logId: string,
        status: string,
        txHash: string | null,
        durationMs: number
    ): Promise<void> {
        try {
            await db.query(
                `UPDATE agent_logs SET status = $1, tx_hash = $2, execution_duration_ms = $3
                 WHERE id = $4`,
                [status, txHash, durationMs, logId]
            );
        } catch (error) {
            console.error('[Agent] Error updating log status:', error);
        }
    }

    /**
     * Get agent configuration for a company
     */
    private async getAgentConfig(companyId: number): Promise<AgentConfig | null> {
        try {
            const result = await db.query(
                `SELECT is_enabled, risk_tolerance, max_mint_per_day, max_dividend_per_day
                 FROM agent_config WHERE company_id = $1`,
                [companyId]
            );

            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('[Agent] Error getting agent config:', error);
            return null;
        }
    }

    /**
     * Sync company data to database cache
     */
    private async syncCompanyData(
        companyId: number,
        onChainData: CompanyData,
        currentPrice: number
    ): Promise<void> {
        try {
            await db.query(
                `INSERT INTO companies (company_id, name, symbol, equity_token_address, company_wallet_address,
                    share_price, total_supply, treasury_balance, market_cap, last_synced_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                 ON CONFLICT (company_id) DO UPDATE SET
                    share_price = $6, total_supply = $7, treasury_balance = $8,
                    market_cap = $9, last_synced_at = NOW()`,
                [
                    companyId,
                    onChainData.name,
                    onChainData.symbol,
                    onChainData.equityTokenAddress,
                    onChainData.companyWalletAddress,
                    currentPrice,
                    onChainData.supply,
                    onChainData.treasury,
                    onChainData.supply * currentPrice,
                ]
            );
        } catch (error) {
            console.error('[Agent] Error syncing company data:', error);
        }
    }
}
