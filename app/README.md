# Cipherlands Frontend

This Vite + React application renders the encrypted Cipherlands world map and connects to the `Cipherlands` FHE contract. Key capabilities:

- Join the on-chain game and receive a random encrypted tile
- Decrypt your own position using Zama’s relayer SDK
- Publish your tile for public decryption and browse explorers who opted-in
- Visual 20 × 20 grid highlighting personal and public tiles

## Available scripts

- `npm run dev` – start the Vite development server
- `npm run build` – type-check the project and produce a production build
- `npm run lint` – execute ESLint

### Contract configuration

1. Deploy the `Cipherlands` contract (local node first, then Sepolia).
2. Copy the generated ABI from `deployments/sepolia/Cipherlands.json` into `src/config/contracts.ts`.
3. Replace the placeholder `CONTRACT_ADDRESS` with the deployed Sepolia address.

Once the address and ABI are in sync with your deployment you can interact with the live map directly from this UI.
