/**
 * Gateway Burn Intent - EIP-712 typed data for user to sign
 * @see https://developers.circle.com/gateway/quickstarts/unified-balance-evm
 */
import { pad, maxUint256, zeroAddress, type Hex } from "viem";
import { randomBytes } from "node:crypto";
import { config } from "../config.js";

const ARC_DOMAIN = 26;

// EIP-712 types for Gateway
export const EIP712_DOMAIN = { name: "GatewayWallet", version: "1" };

export const TransferSpec = [
    { name: "version", type: "uint32" },
    { name: "sourceDomain", type: "uint32" },
    { name: "destinationDomain", type: "uint32" },
    { name: "sourceContract", type: "bytes32" },
    { name: "destinationContract", type: "bytes32" },
    { name: "sourceToken", type: "bytes32" },
    { name: "destinationToken", type: "bytes32" },
    { name: "sourceDepositor", type: "bytes32" },
    { name: "destinationRecipient", type: "bytes32" },
    { name: "sourceSigner", type: "bytes32" },
    { name: "destinationCaller", type: "bytes32" },
    { name: "value", type: "uint256" },
    { name: "salt", type: "bytes32" },
    { name: "hookData", type: "bytes" },
] as const;

export const BurnIntent = [
    { name: "maxBlockHeight", type: "uint256" },
    { name: "maxFee", type: "uint256" },
    { name: "spec", type: "TransferSpec" },
] as const;

function addressToBytes32(address: string): Hex {
    const addr = address.startsWith("0x") ? address : `0x${address}`;
    return pad(addr.toLowerCase() as Hex, { size: 32 });
}

export interface CreateBurnIntentParams {
    sourceDomain: number;
    sourceDepositor: string;
    destinationRecipient: string;
    amountWei: bigint;
    maxFeeWei?: bigint;
}

/**
 * Create burn intent for Gateway transfer (EVM -> Arc)
 * Returns typed data for user to sign with signTypedData
 */
export function createBurnIntent(params: CreateBurnIntentParams) {
    const {
        sourceDomain,
        sourceDepositor,
        destinationRecipient,
        amountWei,
        maxFeeWei = 2_010000n, // ~2 USDC max fee
    } = params;

    const sourceUsdc = config.sourceChainUsdc[sourceDomain];
    if (!sourceUsdc) {
        throw new Error(`Unsupported source domain: ${sourceDomain}`);
    }

    const salt = ("0x" + randomBytes(32).toString("hex")) as Hex;

    const spec = {
        version: 1,
        sourceDomain,
        destinationDomain: ARC_DOMAIN,
        sourceContract: addressToBytes32(config.gatewayWallet),
        destinationContract: addressToBytes32(config.gatewayMinter),
        sourceToken: addressToBytes32(sourceUsdc),
        destinationToken: addressToBytes32(config.usdc),
        sourceDepositor: addressToBytes32(sourceDepositor),
        destinationRecipient: addressToBytes32(destinationRecipient),
        sourceSigner: addressToBytes32(sourceDepositor),
        destinationCaller: addressToBytes32(zeroAddress),
        value: amountWei,
        salt,
        hookData: "0x" as Hex,
    };

    const burnIntent = {
        maxBlockHeight: maxUint256,
        maxFee: maxFeeWei,
        spec,
    };

    return {
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
            ],
            TransferSpec,
            BurnIntent,
        },
        domain: EIP712_DOMAIN,
        primaryType: "BurnIntent" as const,
        message: burnIntent,
    };
}
