export const treasuryAbi = [
    {
        inputs: [
            { name: "companyId", type: "uint256" },
            { name: "amount", type: "uint256" },
        ],
        name: "deposit",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "companyId", type: "uint256" },
            { name: "amount", type: "uint256" },
        ],
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "companyId", type: "uint256" }],
        name: "companyBalance",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
] as const;
