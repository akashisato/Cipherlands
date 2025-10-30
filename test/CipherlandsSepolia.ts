import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers, fhevm } from "hardhat";
import { Cipherlands } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("CipherlandsSepolia", function () {
  let signers: Signers;
  let cipherlands: Cipherlands;
  let cipherlandsAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn("This hardhat test suite can only run on Sepolia Testnet");
      this.skip();
    }

    try {
      const deployment = await deployments.get("Cipherlands");
      cipherlandsAddress = deployment.address;
      cipherlands = (await ethers.getContractAt("Cipherlands", deployment.address)) as Cipherlands;
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("joins the map and exposes the position", async function () {
    steps = 9;
    this.timeout(4 * 40000);

    progress("Checking join status...");
    const alreadyJoined = await cipherlands.hasJoined(signers.alice.address);

    if (!alreadyJoined) {
      progress("Joining Cipherlands...");
      const tx = await cipherlands.connect(signers.alice).joinGame();
      await tx.wait();
    } else {
      progress("Account already joined");
    }

    progress("Fetching encrypted position...");
    const encryptedPosition = await cipherlands.getEncryptedPosition(signers.alice.address);
    expect(encryptedPosition).to.not.eq(ethers.ZeroHash);

    progress("Decrypting position...");
    const clearPosition = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedPosition,
      cipherlandsAddress,
      signers.alice,
    );
    progress(`Decrypted tile: ${clearPosition}`);

    progress("Ensuring position is public...");
    const alreadyPublic = await cipherlands.isPublic(signers.alice.address);
    if (!alreadyPublic) {
      const tx = await cipherlands.connect(signers.alice).makePositionPublic();
      await tx.wait();
    }

    progress("Reading public roster...");
    const publicPlayers = await cipherlands.getPublicPlayers();
    expect(publicPlayers).to.include(signers.alice.address);

    progress("Fetching public positions...");
    const [players, positions] = await cipherlands.getPublicPlayerPositions();
    const index = players.findIndex((addr) => addr === signers.alice.address);
    expect(index).to.not.eq(-1);

    progress("Decrypting public position...");
    const publicTile = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      positions[index],
      cipherlandsAddress,
      signers.alice,
    );
    progress(`Public tile: ${publicTile}`);

    expect(publicTile).to.eq(clearPosition);
  });
});
