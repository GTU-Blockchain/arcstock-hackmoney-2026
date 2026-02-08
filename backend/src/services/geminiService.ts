import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from '../config.js';
import { db } from '../database/client.js';

interface CompanyContext {
    companyId: number;
    name: string;
    symbol: string;
    currentPrice: number;
    treasury: number;
    supply: number;
    marketCap: number;
    nav: number;
    priceVsNav: number;
    oracleData: {
        demand: string;
        liquidity: number;
        volume: number;
    };
    historicalData: {
        avgPrice: number;
        lastAction?: string;
        daysAgo?: number;
    };
    agentConfig: {
        riskTolerance: string;
        maxMintPerDay: number;
        maxDividendPerDay: number;
    };
}

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

interface PricePrediction {
    predictedPrice: number;
    confidence: number;
    reasoning: string;
    timeframe: string;
}

interface RiskAssessment {
    overallRisk: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
}

export default class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        if (!config.geminiApiKey) {
            console.warn('[Gemini] API key not configured. AI decisions will use fallback logic.');
        }

        this.genAI = new GoogleGenerativeAI(config.geminiApiKey || 'dummy-key');
        this.model = this.genAI.getGenerativeModel({ model: config.geminiModel });
    }

    /**
     * Main decision-making function: analyzes company context and decides action
     */
    async analyzeAndDecide(context: CompanyContext): Promise<Decision> {
        try {
            if (!config.geminiApiKey) {
                return this.fallbackDecision(context);
            }

            const prompt = this.buildDecisionPrompt(context);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse JSON response from Gemini
            const decision = this.parseDecisionResponse(text);

            // Save insight to database
            await this.saveInsight(context.companyId, 'action_recommendation', decision);

            return decision;
        } catch (error) {
            console.error('[Gemini] Error in analyzeAndDecide:', error);
            return this.fallbackDecision(context);
        }
    }

    /**
     * Predict future price based on historical and oracle data
     */
    async predictPrice(context: CompanyContext): Promise<PricePrediction> {
        try {
            if (!config.geminiApiKey) {
                return this.fallbackPricePrediction(context);
            }

            const prompt = `
You are a financial analyst for tokenized equity. Predict the share price for the next 24 hours.

Current Data:
- Company: ${context.name} (${context.symbol})
- Current Price: $${context.currentPrice}
- Historical Avg (7d): $${context.historicalData.avgPrice}
- Oracle Volume: $${context.oracleData.volume}
- Oracle Liquidity: $${context.oracleData.liquidity}
- Demand Signal: ${context.oracleData.demand}

Return JSON only:
{
    "predictedPrice": 10.5,
    "confidence": 0.75,
    "reasoning": "Price likely to increase due to high demand and strong liquidity",
    "timeframe": "24h"
}
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const prediction = this.parsePredictionResponse(text);

            // Save insight
            await this.saveInsight(context.companyId, 'price_prediction', prediction);

            return prediction;
        } catch (error) {
            console.error('[Gemini] Error in predictPrice:', error);
            return this.fallbackPricePrediction(context);
        }
    }

    /**
     * Assess risk of a proposed action
     */
    async assessRisk(proposedAction: any, companyState: any): Promise<RiskAssessment> {
        try {
            if (!config.geminiApiKey) {
                return this.fallbackRiskAssessment(proposedAction);
            }

            const prompt = `
You are a risk assessment agent for corporate actions in tokenized equity.

Proposed Action: ${proposedAction.action}
Parameters: ${JSON.stringify(proposedAction.params)}

Company State:
- Treasury: $${companyState.treasury}
- Supply: ${companyState.supply} shares
- Price: $${companyState.currentPrice}
- NAV: $${companyState.nav}

Assess the risk level and provide recommendations.

Return JSON only:
{
    "overallRisk": "low | medium | high",
    "factors": ["Factor 1", "Factor 2"],
    "recommendations": ["Recommendation 1", "Recommendation 2"]
}
`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const assessment = this.parseRiskResponse(text);

            return assessment;
        } catch (error) {
            console.error('[Gemini] Error in assessRisk:', error);
            return this.fallbackRiskAssessment(proposedAction);
        }
    }

    /**
     * Build the main decision prompt for Gemini
     */
    private buildDecisionPrompt(context: CompanyContext): string {
        return `
You are an autonomous financial agent for a tokenized equity platform managing company: ${context.name} (${context.symbol}).

Current State:
- Share Price: $${context.currentPrice} (Stork Oracle)
- Treasury Balance: $${context.treasury}
- Total Supply: ${context.supply} shares
- Market Cap: $${context.marketCap}
- NAV (Net Asset Value): $${context.nav} (treasury/supply)
- Price vs NAV: ${context.priceVsNav}%
- Stork Demand Signal: ${context.oracleData.demand}
- Stork Liquidity: ${context.oracleData.liquidity}
- Recent 24h Volume: ${context.oracleData.volume}

Historical Context:
- Last 7 days avg price: $${context.historicalData.avgPrice}
- Last action: ${context.historicalData.lastAction || 'none'} (${context.historicalData.daysAgo || 'N/A'} days ago)
- Company risk tolerance: ${context.agentConfig.riskTolerance}

Safety Limits:
- Max mint per day: ${context.agentConfig.maxMintPerDay} shares
- Max dividend per day: $${context.agentConfig.maxDividendPerDay}

Your task: Decide the BEST action right now. Options:
1. mint_shares - Issue new shares (increases supply, raises capital)
2. distribute_dividends - Pay shareholders from treasury
3. execute_buyback - Buy back shares (reduce supply, increase price)
4. hold - Take no action, wait for better conditions

Consider:
- Is the price above or below NAV? (If price > NAV, consider mint; if price < NAV, consider buyback)
- Is treasury sufficient for operations and dividends?
- What is the demand signal? (High demand = good time to mint)
- What is the risk level?

Return ONLY valid JSON, no markdown:
{
    "action": "mint_shares",
    "reasoning": "Clear 2-3 sentence explanation of WHY this action is optimal",
    "confidence": 0.85,
    "params": {
        "amount": 1000
    },
    "riskLevel": "low"
}
`;
    }

    /**
     * Parse Gemini's decision response
     */
    private parseDecisionResponse(text: string): Decision {
        try {
            // Remove markdown code blocks if present
            const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(cleanText);

            return {
                action: parsed.action || 'hold',
                reasoning: parsed.reasoning || 'No reasoning provided',
                confidence: parsed.confidence || 0.5,
                params: parsed.params,
                riskLevel: parsed.riskLevel || 'medium',
            };
        } catch (error) {
            console.error('[Gemini] Error parsing decision response:', error);
            return {
                action: 'hold',
                reasoning: 'Failed to parse AI response, defaulting to hold',
                confidence: 0.3,
                riskLevel: 'high',
            };
        }
    }

    /**
     * Parse price prediction response
     */
    private parsePredictionResponse(text: string): PricePrediction {
        try {
            const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(cleanText);

            return {
                predictedPrice: parsed.predictedPrice || 0,
                confidence: parsed.confidence || 0.5,
                reasoning: parsed.reasoning || 'No reasoning provided',
                timeframe: parsed.timeframe || '24h',
            };
        } catch (error) {
            console.error('[Gemini] Error parsing prediction response:', error);
            return {
                predictedPrice: 0,
                confidence: 0.3,
                reasoning: 'Failed to parse AI response',
                timeframe: '24h',
            };
        }
    }

    /**
     * Parse risk assessment response
     */
    private parseRiskResponse(text: string): RiskAssessment {
        try {
            const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(cleanText);

            return {
                overallRisk: parsed.overallRisk || 'medium',
                factors: parsed.factors || [],
                recommendations: parsed.recommendations || [],
            };
        } catch (error) {
            console.error('[Gemini] Error parsing risk response:', error);
            return {
                overallRisk: 'high',
                factors: ['Failed to parse AI response'],
                recommendations: ['Review manually'],
            };
        }
    }

    /**
     * Save Gemini insight to database
     */
    private async saveInsight(
        companyId: number,
        insightType: string,
        insightData: any
    ): Promise<void> {
        try {
            const summary = insightData.reasoning || insightData.summary || 'No summary';
            const confidence = insightData.confidence || 0.5;
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            await db.query(
                `INSERT INTO gemini_insights (company_id, insight_type, insight_data, summary, confidence_score, expires_at)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [companyId, insightType, JSON.stringify(insightData), summary, confidence, expiresAt]
            );
        } catch (error) {
            console.error('[Gemini] Error saving insight:', error);
        }
    }

    /**
     * Fallback decision logic when Gemini API is unavailable
     */
    private fallbackDecision(context: CompanyContext): Decision {
        console.log('[Gemini] Using fallback decision logic');

        // Simple rule-based fallback
        const priceVsNav = context.priceVsNav;
        const treasuryRatio = context.treasury / context.marketCap;

        if (priceVsNav > 20 && context.oracleData.demand === 'high') {
            // Price significantly above NAV and high demand - mint shares
            return {
                action: 'mint_shares',
                reasoning: 'Price 20%+ above NAV with high demand. Good opportunity to mint shares.',
                confidence: 0.7,
                params: { amount: Math.min(1000, context.agentConfig.maxMintPerDay) },
                riskLevel: 'low',
            };
        } else if (treasuryRatio > 0.3 && context.oracleData.demand === 'medium') {
            // Healthy treasury - consider dividend
            return {
                action: 'distribute_dividends',
                reasoning: 'Strong treasury position. Rewarding shareholders with dividends.',
                confidence: 0.6,
                params: { amount: Math.min(context.treasury * 0.05, context.agentConfig.maxDividendPerDay) },
                riskLevel: 'low',
            };
        } else {
            // Default to hold
            return {
                action: 'hold',
                reasoning: 'Market conditions not optimal for action. Waiting for better opportunity.',
                confidence: 0.8,
                riskLevel: 'low',
            };
        }
    }

    /**
     * Fallback price prediction
     */
    private fallbackPricePrediction(context: CompanyContext): PricePrediction {
        return {
            predictedPrice: context.currentPrice,
            confidence: 0.5,
            reasoning: 'Fallback prediction: no significant change expected',
            timeframe: '24h',
        };
    }

    /**
     * Fallback risk assessment
     */
    private fallbackRiskAssessment(_proposedAction: any): RiskAssessment {
        return {
            overallRisk: 'medium',
            factors: ['AI unavailable, using conservative assessment'],
            recommendations: ['Review action manually before execution'],
        };
    }
}
