import { privateKeyToAccount } from "viem/accounts";

/**
 * ArcStock Backend Configuration
 * Load from environment variables
 */
export const config = {
    port: parseInt(process.env.PORT ?? "3001", 10),

    // Arc Testnet
    arcRpcUrl:
        process.env.ARC_TESTNET_RPC_URL ?? "https://rpc.testnet.arc.network",
    arcChainId: 5042002,

    // Deployed contract addresses (Arc Testnet)
    equityRegistry: (process.env.EQUITY_REGISTRY ??
        "0xb9d66859BFDb385584958eB340a8951a2063c129") as `0x${string}`,
    treasury: (process.env.TREASURY ??
        "0xB67574396127961e7aB2FA8d48180bA0585Ff899") as `0x${string}`,
    usdc: "0x3600000000000000000000000000000000000000" as `0x${string}`,

    // Circle Gateway API (testnet - no auth required)
    gatewayApiUrl:
        process.env.GATEWAY_API_URL ?? "https://gateway-api-testnet.circle.com",

    // Gateway contract addresses (Arc Testnet - same on all EVM chains)
    gatewayWallet:
        "0x0077777d7EBA4688BDeF3E311b846F25870A19B9" as `0x${string}`,
    gatewayMinter:
        "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B" as `0x${string}`,

    // Source chain USDC addresses (testnet) - domain -> USDC address
    sourceChainUsdc: {
        0: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as `0x${string}`, // Sepolia
        1: "0x5425890298aed601595a70ab815c96711a31bc65" as `0x${string}`, // Avalanche Fuji
        6: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`, // Base Sepolia
    } as Record<number, `0x${string}`>,

    // Private key for settlement transactions (Treasury deposit, Registry mint)
    privateKey: process.env.PRIVATE_KEY as `0x${string}` | undefined,

    // Backend wallet (recipient for Gateway transfers) - derived from private key
    get backendWallet(): `0x${string}` | undefined {
        const pk = process.env.PRIVATE_KEY as `0x${string}` | undefined;
        return pk ? privateKeyToAccount(pk).address : undefined;
    },

    // Database
    databaseUrl: process.env.DATABASE_URL ?? "postgresql://localhost:5432/arcstock",

    // Stork Network Oracle
    storkApiUrl: process.env.STORK_API_URL ?? "https://rest.jp.stork-oracle.network",
    storkAuthToken: process.env.STORK_AUTH_TOKEN,

    // Gemini AI
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.0-flash-exp",

    // Agent Settings
    agentSchedulerInterval: parseInt(process.env.AGENT_SCHEDULER_INTERVAL ?? "300", 10), // 5 minutes
} as const;
