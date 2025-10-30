# Cipherlands

> A privacy-preserving multiplayer blockchain game powered by Fully Homomorphic Encryption (FHE)

Cipherlands is an innovative on-chain multiplayer game that demonstrates the power of Fully Homomorphic Encryption in blockchain applications. Players join a shared map and receive encrypted positions that remain private until they choose to reveal them, creating a unique gaming experience where privacy is built into the protocol itself.

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [Advantages](#advantages)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
  - [Running Locally](#running-locally)
  - [Deploying to Sepolia](#deploying-to-sepolia)
  - [Frontend Application](#frontend-application)
- [Smart Contract Details](#smart-contract-details)
- [Frontend Details](#frontend-details)
- [Testing](#testing)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Hardhat Tasks](#hardhat-tasks)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)
- [Acknowledgments](#acknowledgments)

## Overview

Cipherlands is a multiplayer map-based game built on the Ethereum blockchain using Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine). The game features a 20×20 grid (400 tiles) where each player is assigned a unique encrypted position upon joining. The encryption is performed on-chain, ensuring that player positions remain completely private and cannot be viewed by other players, observers, or even blockchain validators—unless the player explicitly chooses to make their position public.

This project serves as both a functional game and a technical demonstration of how FHE can be integrated into smart contracts to enable privacy-preserving decentralized applications (dApps).

## Problem Statement

Traditional blockchain applications suffer from a fundamental privacy limitation: **all on-chain data is publicly visible**. This transparency, while beneficial for verification and trust, creates significant challenges for applications requiring confidentiality, such as:

- **Gaming**: Hidden information games (poker, strategy games, fog-of-war mechanics) cannot be implemented fairly without off-chain trusted components
- **Auctions**: Sealed-bid auctions require trust in centralized servers or complex cryptographic protocols
- **Voting**: On-chain voting systems expose voter preferences, compromising ballot secrecy
- **Financial Applications**: Trading strategies, portfolio positions, and financial data are exposed to front-runners and competitors

**Cipherlands addresses these challenges** by leveraging Fully Homomorphic Encryption (FHE), which allows computations to be performed on encrypted data without decryption. This enables truly private on-chain state while maintaining the verifiability and decentralization benefits of blockchain technology.

## Key Features

### Privacy-First Design
- **Encrypted Positions**: All player positions are stored as encrypted values (`euint32`) on-chain
- **Selective Disclosure**: Players can choose to make their positions public at any time
- **Cryptographic Guarantees**: Positions remain private even from validators and block explorers until explicitly revealed

### Blockchain-Native
- **Fully On-Chain**: All game logic runs on smart contracts—no off-chain servers required
- **Permissionless**: Anyone can join the game by connecting their Ethereum wallet
- **Verifiable**: All game state and rules are transparently encoded in the smart contract

### Fair Position Assignment
- **Collision-Free**: Automated tile allocation ensures no two players occupy the same position
- **Pseudo-Random**: Uses block randomness (`prevrandao`) combined with player address and timestamp for fair distribution
- **Bounded Capacity**: Maximum 400 players (one per tile) with automatic occupancy tracking

### Modern Web3 Frontend
- **Wallet Integration**: Seamless connection via RainbowKit supporting MetaMask, WalletConnect, and more
- **Real-Time Updates**: React-based UI with Wagmi hooks for live blockchain data
- **Visual Map Display**: Interactive 20×20 grid showing your encrypted position and public players
- **Decryption Interface**: Built-in tools to decrypt and visualize positions using Zama's relayer SDK

## Advantages

### For Developers

1. **FHE Learning Platform**: Comprehensive example of integrating FHEVM into a dApp
2. **Production-Ready Template**: Built on established frameworks (Hardhat, React, TypeScript)
3. **Complete Stack**: Smart contracts, deployment scripts, tests, tasks, and frontend—all in one repository
4. **Type Safety**: Full TypeScript coverage with TypeChain for contract type generation
5. **Testing Framework**: Unit tests (local mock mode) and Sepolia integration tests included
6. **Extensible Architecture**: Clean code structure makes it easy to add new features or adapt for other use cases

### For Users

1. **True Privacy**: Positions are mathematically guaranteed to be private (not just obfuscated)
2. **No Trusted Third Party**: Unlike traditional games, no centralized server holds secret information
3. **Transparent Rules**: All game logic is visible and verifiable on-chain
4. **Censorship Resistant**: No single entity can prevent you from playing or manipulating game state
5. **Ownership**: Your encrypted position is truly yours, stored on the blockchain

### For the Ecosystem

1. **FHE Demonstration**: Real-world showcase of FHE's potential in blockchain gaming
2. **Open Source**: BSD-3-Clause-Clear license encourages learning and derivative works
3. **Standards Compliance**: Uses established Ethereum development patterns and tools
4. **Educational Resource**: Serves as a reference implementation for privacy-preserving dApps

## How It Works

### Game Flow

1. **Connect Wallet**: User connects an Ethereum wallet (MetaMask, WalletConnect, etc.) to the frontend
2. **Join Game**: User calls `joinGame()` on the smart contract
3. **Position Assignment**: Contract allocates a unique tile using pseudo-random selection
4. **Encryption**: The tile number is encrypted on-chain as `euint32` using FHEVM
5. **Access Control**: Encryption keys are granted to the contract and the player
6. **Decryption**: Player can decrypt their own position using Zama's relayer infrastructure
7. **Optional Reveal**: Player can call `makePositionPublic()` to allow anyone to decrypt their position
8. **Map Visualization**: Frontend displays the map with the player's tile and any public tiles highlighted

### Encryption Flow

```
Player joins → Tile assigned (1-400) → FHE.asEuint32(tile)
              → Encrypted position stored → Access granted to player
              → Player uses relayer to decrypt → Sees tile on map
```

### Decryption Mechanism

- **Private Decryption**: Player uses their private key + Zama relayer to decrypt their own `euint32`
- **Public Decryption**: If made public, anyone can decrypt via relayer without special permissions
- **Gateway Protocol**: Zama's Gateway relayer handles threshold decryption using MPC (Multi-Party Computation)

### Smart Contract Architecture

The `Cipherlands.sol` contract maintains:
- **Player Registry**: Mapping of addresses to `PlayerData` structs
- **Encrypted Positions**: Each player has an `euint32` encrypted tile number
- **Occupancy Tracking**: Boolean mapping to prevent tile collisions
- **Public Players List**: Array of addresses who revealed their positions

## Technology Stack

### Smart Contract Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | ^0.8.24 | Smart contract language |
| **FHEVM** | ^0.8.0 | Fully Homomorphic Encryption library by Zama |
| **Hardhat** | ^2.26.0 | Ethereum development environment |
| **Hardhat Deploy** | ^0.11.45 | Deployment management and versioning |
| **TypeChain** | ^8.3.2 | TypeScript bindings for contracts |
| **Ethers.js** | ^6.15.0 | Ethereum library for interaction |

### Testing & Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **Mocha** | ^11.7.1 | Test framework |
| **Chai** | ^4.5.0 | Assertion library |
| **Hardhat Network Helpers** | ^1.1.0 | Testing utilities |
| **Solidity Coverage** | ^0.8.16 | Code coverage analysis |
| **ESLint** | ^8.57.1 | Linting for TypeScript/Solidity |
| **Prettier** | ^3.6.2 | Code formatting |
| **Solhint** | ^6.0.0 | Solidity linter |

### Frontend Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^19.1.1 | UI framework |
| **TypeScript** | ~5.8.3 | Type-safe JavaScript |
| **Vite** | ^7.1.6 | Fast build tool and dev server |
| **Wagmi** | ^2.17.0 | React hooks for Ethereum |
| **Viem** | ^2.37.6 | TypeScript Ethereum library |
| **RainbowKit** | ^2.2.8 | Wallet connection UI |
| **TanStack Query** | ^5.89.0 | Async state management |
| **Zama Relayer SDK** | ^0.2.0 | FHE decryption via gateway |

### Blockchain & Infrastructure

- **Ethereum Sepolia Testnet**: Primary deployment target
- **Hardhat Network**: Local development and testing
- **Infura**: RPC provider for Sepolia
- **Etherscan**: Contract verification
- **Zama Gateway**: FHE decryption relayer network

## Architecture

### Smart Contract Architecture

```
Cipherlands.sol
├── State Variables
│   ├── MAP_WIDTH (20)
│   ├── MAP_HEIGHT (20)
│   ├── TOTAL_TILES (400)
│   ├── _players: mapping(address => PlayerData)
│   ├── _occupiedTiles: mapping(uint16 => bool)
│   ├── _publicPlayers: address[]
│   └── _playersRegistry: address[]
│
├── Structs
│   └── PlayerData { euint32 position, bool joined, bool isPublic }
│
├── Public Functions
│   ├── joinGame() - Assign encrypted position to new player
│   ├── makePositionPublic() - Allow public decryption of position
│   ├── getEncryptedPosition(address) - View encrypted position handle
│   ├── hasJoined(address) - Check if player is registered
│   ├── isPublic(address) - Check if position is publicly decryptable
│   ├── getPublicPlayers() - List all players who revealed positions
│   ├── getPublicPlayerPositions() - Get players and their encrypted positions
│   ├── totalPlayers() - Count of registered players
│   └── tileIsOccupied(uint16) - Check tile occupancy
│
└── Internal Functions
    ├── _allocateTile(address) - Random collision-free tile assignment
    └── _requireExistingPlayer(address) - Validation helper
```

### Frontend Architecture

```
app/
├── src/
│   ├── components/
│   │   ├── CipherlandsApp.tsx - Main app container
│   │   ├── Header.tsx - Navigation and wallet connection
│   │   ├── MapGrid.tsx - Visual 20×20 grid display
│   │   ├── PlayerPanel.tsx - Join game and decrypt position
│   │   └── PublicPlayers.tsx - List and decrypt public players
│   │
│   ├── config/
│   │   ├── wagmi.ts - Wagmi/Viem configuration
│   │   └── contracts.ts - Contract addresses and ABIs
│   │
│   ├── hooks/
│   │   ├── useEthersSigner.ts - Wagmi to Ethers adapter
│   │   └── useZamaInstance.ts - FHE instance for decryption
│   │
│   ├── styles/ - CSS modules for components
│   └── main.tsx - App entry point
│
└── App.tsx - Wagmi/RainbowKit provider setup
```

### Data Flow

```
User Action → Wagmi Hook → Smart Contract → FHEVM Encryption
          ↓
Frontend UI Update ← Relayer Decryption ← Contract Event ← Blockchain
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher ([Download](https://nodejs.org/))
- **npm**: Version 7.0.0 or higher (comes with Node.js)
- **Git**: For cloning the repository
- **Ethereum Wallet**: MetaMask or similar (for frontend interaction)
- **Sepolia ETH**: For testnet deployment (obtain from [Sepolia faucet](https://sepoliafaucet.com/))

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Cipherlands.git
cd Cipherlands
```

### 2. Install Smart Contract Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```ini
# Infura Project ID for Sepolia RPC
INFURA_API_KEY=your_infura_project_id

# Private key for deployment (DO NOT commit this!)
PRIVATE_KEY=0xyour_wallet_private_key_without_0x_prefix

# Etherscan API key for contract verification (optional)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Security Note**: Never commit your `.env` file. The `.gitignore` is configured to exclude it.

### 4. Install Frontend Dependencies

```bash
cd app
npm install
cd ..
```

### 5. Compile Smart Contracts

```bash
npm run compile
```

This will:
- Compile Solidity contracts
- Generate TypeChain TypeScript bindings
- Create ABI files in `artifacts/`

## Usage

### Running Locally

#### Start Local FHEVM Node

```bash
npm run chain
```

This starts a Hardhat Network with FHEVM support on `localhost:8545`.

#### Deploy Contracts Locally

In a new terminal:

```bash
npm run deploy:localhost
```

#### Run Tests

```bash
npm test
```

#### Run Frontend (Development Mode)

```bash
cd app
npm run dev
```

Frontend will be available at `http://localhost:5173` (default Vite port).

### Deploying to Sepolia

#### 1. Ensure You Have Sepolia ETH

Your wallet (corresponding to `PRIVATE_KEY` in `.env`) needs Sepolia testnet ETH. Get some from:
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

#### 2. Deploy Contract

```bash
npm run deploy:sepolia
```

The contract address will be displayed. Save it for frontend configuration.

#### 3. Verify Contract on Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

#### 4. Update Frontend Configuration

Edit `app/src/config/contracts.ts` with your deployed contract address.

#### 5. Build and Deploy Frontend

```bash
cd app
npm run build
```

Deploy the `app/dist/` directory to:
- **Netlify**: Drag-and-drop or connect GitHub repo
- **Vercel**: Import project and set build command to `cd app && npm run build`
- **IPFS**: Use `ipfs add -r dist/` for decentralized hosting

### Frontend Application

#### Connect Wallet

1. Click "Connect Wallet" in the header
2. Select your wallet provider (MetaMask, WalletConnect, etc.)
3. Approve the connection

#### Join the Game

1. Click "Join Game" button
2. Confirm the transaction in your wallet
3. Wait for transaction confirmation
4. Click "Decrypt My Position" to reveal your tile
5. Your tile will be highlighted in blue on the map

#### Make Position Public

1. After joining, click "Make Public"
2. Confirm the transaction
3. Your position becomes decryptable by all players
4. You'll appear in the "Public Players" list

#### View Other Public Players

- The "Public Players" panel shows all players who revealed their positions
- Click "Decrypt" next to any public player to see their tile
- Public tiles appear in green on the map

## Smart Contract Details

### Core Functions

#### `joinGame()`
- **Visibility**: External
- **State**: Writes to `_players`, `_occupiedTiles`, `_playersRegistry`
- **Effects**:
  - Allocates a unique tile (1-400)
  - Encrypts tile as `euint32`
  - Grants decryption permission to player
  - Emits `PlayerJoined` event
- **Requirements**: Player must not have already joined

#### `makePositionPublic()`
- **Visibility**: External
- **State**: Writes to `_players`, `_publicPlayers`, `_isInPublicList`
- **Effects**:
  - Marks position as publicly decryptable via `FHE.makePubliclyDecryptable()`
  - Adds player to public players list
  - Emits `PositionMadePublic` event
- **Requirements**: Player must have joined, position must not already be public

#### `getEncryptedPosition(address player)`
- **Visibility**: External view
- **Returns**: `euint32` encrypted position handle
- **Access Control**: Return value is still encrypted; decryption requires permission

#### `getPublicPlayerPositions()`
- **Visibility**: External view
- **Returns**: Parallel arrays of `address[]` and `euint32[]`
- **Use Case**: Frontend can decrypt all public positions in batch

### Encryption Details

**Encrypted Type**: `euint32` (32-bit unsigned integer, encrypted)

**Encryption Process**:
```solidity
euint32 encryptedPosition = FHE.asEuint32(allocatedTile);
```

**Permission System**:
- `FHE.allowThis(encryptedPosition)` - Contract can use it in computations
- `FHE.allow(encryptedPosition, player)` - Player can request decryption
- `FHE.makePubliclyDecryptable(position)` - Anyone can decrypt via relayer

### Security Considerations

1. **Randomness**: Uses `block.prevrandao` which is manipulable by validators. For a production game with value, consider using Chainlink VRF.
2. **Gas Costs**: FHE operations are more expensive than normal operations. Decryption costs depend on Zama Gateway pricing.
3. **Position Disclosure**: Once made public, positions cannot be made private again.
4. **Map Capacity**: Maximum 400 players enforced by contract.

## Frontend Details

### Component Hierarchy

```
App (Wagmi/RainbowKit providers)
└── CipherlandsApp
    ├── Header (wallet connection)
    ├── MapGrid (visual tile display)
    ├── PlayerPanel (join + decrypt your position)
    └── PublicPlayers (list + decrypt public positions)
```

### Key Hooks

**`useZamaInstance()`**: Creates FHEVM instance for decryption
```typescript
const zamaInstance = useZamaInstance();
const clearValue = await zamaInstance.decrypt(contractAddress, encryptedHandle);
```

**`useEthersSigner()`**: Converts Wagmi account to Ethers.js signer
```typescript
const signer = useEthersSigner();
const tx = await contract.connect(signer).joinGame();
```

**Wagmi Hooks**:
- `useAccount()` - Get connected address
- `useReadContract()` - Call view functions
- `useWriteContract()` - Send transactions
- `useWatchContractEvent()` - Listen for events

### Styling

- CSS modules in `app/src/styles/`
- Responsive grid layout for map
- Color coding: Blue (your tile), Green (public tiles)

## Testing

### Local Mock Tests

```bash
npm test
```

Runs test suite in `test/Cipherlands.ts`:
- ✅ Assigns encrypted tile when joining
- ✅ Ensures players receive distinct tiles
- ✅ Allows players to expose their position
- ✅ Validates decryption works correctly

**Note**: These tests run on Hardhat Network with FHEVM mock mode (instant, free decryption).

### Sepolia Integration Test

```bash
npm run test:sepolia
```

Runs `test/CipherlandsSepolia.ts` against deployed Sepolia contract:
- Uses real Zama Gateway for decryption
- Requires Sepolia ETH and deployed contract
- Tests actual on-chain FHE encryption

### Coverage

```bash
npm run coverage
```

Generates coverage report in `coverage/index.html`.

## Available Scripts

### Smart Contract Scripts

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile contracts and generate types |
| `npm run test` | Run local Hardhat tests |
| `npm run test:sepolia` | Run Sepolia integration tests |
| `npm run coverage` | Generate test coverage report |
| `npm run lint` | Run Solidity and TypeScript linters |
| `npm run lint:sol` | Lint Solidity files |
| `npm run lint:ts` | Lint TypeScript files |
| `npm run prettier:check` | Check code formatting |
| `npm run prettier:write` | Auto-format code |
| `npm run clean` | Remove build artifacts |
| `npm run typechain` | Generate TypeScript contract types |
| `npm run chain` | Start local Hardhat node |
| `npm run deploy:localhost` | Deploy to local node |
| `npm run deploy:sepolia` | Deploy to Sepolia testnet |
| `npm run verify:sepolia` | Verify contract on Etherscan |

### Frontend Scripts

| Command | Description |
|---------|-------------|
| `cd app && npm run dev` | Start Vite dev server |
| `cd app && npm run build` | Build production bundle |
| `cd app && npm run preview` | Preview production build |
| `cd app && npm run lint` | Lint frontend code |

## Project Structure

```
Cipherlands/
├── contracts/
│   └── Cipherlands.sol          # Main game contract
│
├── deploy/
│   └── deploy.ts                # Hardhat deployment script
│
├── tasks/
│   └── Cipherlands.ts           # CLI tasks (join, decrypt, make-public, etc.)
│
├── test/
│   ├── Cipherlands.ts           # Local mock tests
│   └── CipherlandsSepolia.ts    # Sepolia integration test
│
├── app/                         # React frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── config/              # Wagmi/contract configuration
│   │   ├── hooks/               # Custom React hooks
│   │   ├── styles/              # CSS files
│   │   └── main.tsx             # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── hardhat.config.ts            # Hardhat configuration
├── package.json                 # Root dependencies
├── tsconfig.json                # TypeScript config
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## Hardhat Tasks

Custom CLI tasks for interacting with deployed contracts:

### `task:address`
Print the deployed contract address:
```bash
npx hardhat task:address --network sepolia
```

### `task:join`
Join the game from CLI:
```bash
npx hardhat task:join --network sepolia
```

### `task:decrypt-position`
Decrypt a player's position:
```bash
# Decrypt your own position
npx hardhat task:decrypt-position --network sepolia

# Decrypt another player's position (if public)
npx hardhat task:decrypt-position --network sepolia --player 0x123...
```

### `task:make-public`
Make your position publicly decryptable:
```bash
npx hardhat task:make-public --network sepolia
```

### `task:list-public`
List all public players and their decrypted positions:
```bash
npx hardhat task:list-public --network sepolia
```

## Roadmap

### Phase 1: Foundation ✅ (Current)
- [x] Core smart contract with encrypted positions
- [x] Fair tile allocation algorithm
- [x] Public/private position visibility
- [x] React frontend with wallet integration
- [x] Map visualization
- [x] Decryption UI
- [x] Comprehensive test suite
- [x] Sepolia deployment

### Phase 2: Gameplay Enhancements 🚧
- [ ] **Movement System**: Allow players to move encrypted positions to adjacent tiles
- [ ] **Fog of War**: Reveal nearby tiles based on proximity computations on encrypted data
- [ ] **Player Actions**: Encrypted messages or interactions between players
- [ ] **Territory Control**: Claim regions and track ownership
- [ ] **Resource System**: Collect encrypted resources tied to tile types

### Phase 3: Multiplayer Features 🔮
- [ ] **Teams/Alliances**: Form groups with shared visibility
- [ ] **Combat System**: FHE-based battle mechanics
- [ ] **Leaderboards**: Rankings based on encrypted scores
- [ ] **Achievements**: On-chain badges and milestones
- [ ] **Chat System**: Encrypted messaging between players

### Phase 4: Scaling & Optimization 🔮
- [ ] **Layer 2 Deployment**: Move to Arbitrum/Optimism for lower gas costs
- [ ] **Zama Coprocessor**: Offload FHE computations for better performance
- [ ] **Batch Operations**: Allow multiple actions in single transaction
- [ ] **Map Expansion**: Support larger maps (50×50, 100×100)
- [ ] **Multiple Maps**: Parallel game instances

### Phase 5: Economic Layer 🔮
- [ ] **NFT Positions**: Tradeable ownership of map tiles
- [ ] **Staking**: Lock tokens to hold premium positions
- [ ] **Rewards**: Incentivize gameplay and position reveals
- [ ] **DAO Governance**: Community control over game parameters

### Phase 6: Advanced FHE Features 🔮
- [ ] **Encrypted Inventory**: Private item/asset storage
- [ ] **Confidential Auctions**: Sealed-bid marketplace for tiles
- [ ] **Private Voting**: On-chain governance with hidden votes
- [ ] **Encrypted RNG**: Secure randomness for loot drops and events

### Developer Experience Improvements
- [ ] **Better Documentation**: Video tutorials and guides
- [ ] **SDK/Package**: Reusable library for FHE game development
- [ ] **Template Generator**: CLI tool to bootstrap FHE games
- [ ] **Debugging Tools**: Better FHE state inspection

## Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Open an issue with detailed reproduction steps
2. **Suggest Features**: Propose new ideas in GitHub Discussions
3. **Improve Documentation**: Fix typos, add examples, clarify instructions
4. **Submit Code**: Fix bugs or implement new features via pull requests
5. **Write Tests**: Improve test coverage
6. **Optimize Gas**: Propose gas-saving improvements
7. **Design UI**: Enhance frontend aesthetics and UX

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm test`
5. **Run linter**: `npm run lint`
6. **Commit**: `git commit -m 'Add amazing feature'`
7. **Push**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Code Standards

- Follow existing code style (enforced by Prettier/ESLint)
- Write tests for new functionality
- Update documentation for user-facing changes
- Add comments for complex FHE logic
- Keep commits atomic and well-described

### Testing Your Changes

Before submitting:
```bash
npm run lint           # Check code style
npm test              # Run test suite
npm run coverage      # Ensure coverage doesn't drop
npm run compile       # Verify compilation
```

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

### What this means:
- ✅ You can use, modify, and distribute this code
- ✅ Commercial use is allowed
- ✅ Must include license and copyright notice
- ❌ No patent rights are granted
- ❌ No warranty provided

See the [LICENSE](LICENSE) file for full details.

## Support

### Getting Help

- **Documentation**: [FHEVM Docs](https://docs.zama.ai/fhevm)
- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/Cipherlands/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/yourusername/Cipherlands/discussions)
- **Zama Community**: [Zama Discord](https://discord.gg/zama)

### Frequently Asked Questions

**Q: What is Fully Homomorphic Encryption (FHE)?**
A: FHE allows computations on encrypted data without decryption. Smart contracts can process secret values while keeping them hidden.

**Q: Is this production-ready?**
A: Cipherlands is a demonstration project. While functional, consider additional security audits and optimizations for production use.

**Q: What are the gas costs?**
A: FHE operations are more expensive than normal Solidity operations. Typical `joinGame()` costs ~500k-1M gas. Decryption via Gateway has separate fees.

**Q: Can I use this on mainnet?**
A: FHEVM is currently deployed on testnets. Check Zama's roadmap for mainnet availability.

**Q: How does decryption work?**
A: Decryption uses Zama's Gateway relayer network, which performs threshold decryption via MPC. You need the encryption handle and appropriate permissions.

**Q: Can encrypted positions be hacked?**
A: FHE provides mathematical guarantees. Positions cannot be decrypted without proper authorization, even by validators or Zama relayers.

**Q: Why is the map limited to 400 tiles?**
A: This is a design choice for demonstration. Larger maps are possible but require more complex allocation algorithms and gas optimization.

## Acknowledgments

### Built With
- **[Zama](https://zama.ai/)** - FHEVM protocol and documentation
- **[Hardhat](https://hardhat.org/)** - Ethereum development environment
- **[RainbowKit](https://www.rainbowkit.com/)** - Wallet connection UI
- **[Wagmi](https://wagmi.sh/)** - React hooks for Ethereum
- **[Vite](https://vitejs.dev/)** - Frontend build tool

### Inspiration
This project was inspired by:
- Zama's FHEVM Hardhat template
- Classic grid-based strategy games
- The vision of privacy-preserving blockchain applications

### Community
Special thanks to:
- The Zama team for pioneering FHE on Ethereum
- Early testers and contributors
- The broader Ethereum developer community

---

**Built with privacy in mind, powered by mathematics** 🔐

*For questions, feedback, or collaborations, reach out via GitHub Issues or Discussions.*
