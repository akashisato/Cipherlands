import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { Cipherlands, Cipherlands__factory } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("Cipherlands")) as Cipherlands__factory;
  const cipherlands = (await factory.deploy()) as Cipherlands;
  const cipherlandsAddress = await cipherlands.getAddress();

  return { cipherlands, cipherlandsAddress };
}

describe("Cipherlands", function () {
  let signers: Signers;
  let cipherlands: Cipherlands;
  let cipherlandsAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("This hardhat test suite cannot run on Sepolia Testnet");
      this.skip();
    }

    ({ cipherlands, cipherlandsAddress } = await deployFixture());
  });

  async function decryptPosition(handle: string, signer: HardhatEthersSigner) {
    return fhevm.userDecryptEuint(FhevmType.euint32, handle, cipherlandsAddress, signer);
  }

  it("assigns an encrypted tile when joining", async function () {
    await cipherlands.connect(signers.alice).joinGame();

    const encryptedPosition = await cipherlands.getEncryptedPosition(signers.alice.address);
    expect(encryptedPosition).to.not.eq(ethers.ZeroHash);

    const clearPosition = await decryptPosition(encryptedPosition, signers.alice);
    const totalTiles = await cipherlands.TOTAL_TILES();
    expect(clearPosition).to.be.gte(1n);
    expect(clearPosition).to.be.lte(totalTiles);

    const occupied = await cipherlands.tileIsOccupied(Number(clearPosition));
    expect(occupied).to.eq(true);
  });

  it("ensures players receive distinct tiles", async function () {
    await cipherlands.connect(signers.alice).joinGame();
    await cipherlands.connect(signers.bob).joinGame();

    const aliceEncrypted = await cipherlands.getEncryptedPosition(signers.alice.address);
    const bobEncrypted = await cipherlands.getEncryptedPosition(signers.bob.address);

    const aliceTile = await decryptPosition(aliceEncrypted, signers.alice);
    const bobTile = await decryptPosition(bobEncrypted, signers.bob);

    expect(aliceTile).to.not.eq(bobTile);
  });

  it("allows players to expose their position", async function () {
    await cipherlands.connect(signers.alice).joinGame();

    await cipherlands.connect(signers.alice).makePositionPublic();

    const isPublic = await cipherlands.isPublic(signers.alice.address);
    expect(isPublic).to.eq(true);

    const publicPlayers = await cipherlands.getPublicPlayers();
    expect(publicPlayers).to.deep.eq([signers.alice.address]);

    const [players, positions] = await cipherlands.getPublicPlayerPositions();
    expect(players).to.deep.eq([signers.alice.address]);

    const decrypted = await decryptPosition(positions[0], signers.alice);
    expect(decrypted).to.be.gte(1n);
  });
});
