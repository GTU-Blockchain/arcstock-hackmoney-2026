# ArcStock Backend

Investment API for ArcStock - orchestrates Circle Gateway settlement and on-chain RWA actions.

## Structure

```
backend/
├── src/
│   ├── index.ts          # Entry point, Express app
│   ├── config.ts         # Env config
│   ├── gateway/          # Circle Gateway
│   │   ├── client.ts     # API client (balances, attestation)
│   │   └── burnIntent.ts # EIP-712 burn intent
│   ├── services/         # Business logic
│   │   ├── investment.ts
│   │   └── gatewayTransfer.ts
│   └── routes/
│       └── invest.ts     # /api/invest/* endpoints
├── package.json
└── tsconfig.json
```

## Setup

```bash
cp .env.example .env
# Edit .env with PRIVATE_KEY, contract addresses
npm install
```

## Run

```bash
npm run dev    # Development (port 3001)
npm run build && npm start
```

## API

| Method | Path                            | Description                            |
| ------ | ------------------------------- | -------------------------------------- |
| GET    | /health                         | Health check                           |
| POST   | /api/invest/intent              | Burn intent typedData for user to sign |
| POST   | /api/invest/complete            | Gateway transfer + settlement          |
| POST   | /api/invest/settlement          | Direct settlement (no Gateway)         |
| GET    | /api/invest/balances/:address   | Gateway USDC balance                   |
| GET    | /api/invest/treasury/:companyId | Company Treasury balance               |

## Gateway Flow

1. **Intent** – `POST /intent` → returns `typedData` (user signs with wallet that has Gateway balance)
2. **Complete** – `POST /complete` with `signedBurnIntent` → attestation → gatewayMint → Treasury.deposit → mintShares
