export const equityRegistryAbi = [
    {
        inputs: [
            { name: "companyId", type: "uint256" },
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        name: "mintShares",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "companyId", type: "uint256" },
            { name: "amount", type: "uint256" },
        ],
        name: "cancelShares",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "companyId", type: "uint256" }],
        name: "companies",
        outputs: [
            { name: "name", type: "string" },
            { name: "symbol", type: "string" },
            { name: "metadataUri", type: "string" },
            { name: "equityToken", type: "address" },
            { name: "companyWallet", type: "address" },
        ],
        stateMutability: "view",
        type: "function",
    },
] as const;
