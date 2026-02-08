/**
 * Gateway Transfer Service
 * Handles Gateway mint on Arc after user signs burn intent
 */
import {
    createPublicClient,
    createWalletClient,
    getContract,
    http,
    parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "../config.js";
import { createTransferAttestation } from "../gateway/client.js";

const arcChain = {
    id: config.arcChainId,
    name: "Arc Testnet",
    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
    rpcUrls: { default: { http: [config.arcRpcUrl] } },
} as const;

const gatewayMinterAbi = [
    {
        type: "function",
        name: "gatewayMint",
        inputs: [
            { name: "attestationPayload", type: "bytes" },
            { name: "signature", type: "bytes" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
] as const;

export interface CompleteGatewayTransferParams {
    signedBurnIntent: {
        burnIntent: Record<string, unknown>;
        signature: string;
    };
    companyId: number;
    investorAddress: `0x${string}`;
    usdcAmount: string;
    shareAmount: string;
}

/**
 * 1. Get attestation from Gateway API
 * 2. Call gatewayMint on Arc (USDC arrives at backend wallet)
 * 3. Execute settlement (Treasury.deposit + mintShares)
 */
export async function completeGatewayTransfer(
    params: CompleteGatewayTransferParams,
): Promise<{
    transferId: string;
    mintTxHash: string;
    settlementTxHash: string;
}> {
    const {
        signedBurnIntent,
        companyId,
        investorAddress,
        usdcAmount,
        shareAmount,
    } = params;

    if (!config.privateKey) {
        throw new Error("PRIVATE_KEY not set");
    }

    const account = privateKeyToAccount(config.privateKey);
    const publicClient = createPublicClient({
        chain: arcChain,
        transport: http(config.arcRpcUrl),
    });
    const walletClient = createWalletClient({
        account,
        chain: arcChain,
        transport: http(config.arcRpcUrl),
    });

    // 0. Pre-check: ensure company pool has shares and backend approval (before burning user's USDC)
    const { checkPoolForSettlement } = await import("./investment.js");
    await checkPoolForSettlement({ companyId, shareAmount });

    // 1. Get attestation from Gateway API
    const attestationResponse = await createTransferAttestation([
        signedBurnIntent,
    ]);

    // 2. gatewayMint on Arc - USDC minted to destinationRecipient (must be backend)
    const gatewayMinter = getContract({
        address: config.gatewayMinter,
        abi: gatewayMinterAbi,
        client: { public: publicClient, wallet: walletClient },
    });

    const mintTxHash = await gatewayMinter.write.gatewayMint(
        [
            attestationResponse.attestation as `0x${string}`,
            attestationResponse.signature as `0x${string}`,
        ],
        { account },
    );

    const mintReceipt = await publicClient.waitForTransactionReceipt({ hash: mintTxHash });
    console.log("[Gateway] gatewayMint success, block:", mintReceipt.blockNumber);

    // Gateway deducts fees from transfer; actual received = value - fees.total
    const specValue = (signedBurnIntent.burnIntent as { spec?: { value?: string } })?.spec?.value;
    const valueWei = specValue ? BigInt(specValue) : parseUnits(usdcAmount, 6);
    const feesTotal = attestationResponse.fees?.total ?? "0";
    const feesWei = parseUnits(feesTotal, 6);
    const receivedAmountWei = valueWei > feesWei ? valueWei - feesWei : valueWei;
    console.log("[Gateway] valueWei=%s feesWei=%s receivedAmountWei=%s", valueWei.toString(), feesWei.toString(), receivedAmountWei.toString());

    // 3. Settlement - Treasury.deposit + mintShares (use actual received amount)
    const { executeSettlement } = await import("./investment.js");
    const settlementResult = await executeSettlement({
        companyId,
        investorAddress,
        usdcAmount,
        shareAmount,
        receivedAmountWei,
    });

    return {
        transferId: attestationResponse.transferId,
        mintTxHash,
        settlementTxHash: settlementResult.txHash,
    };
}
