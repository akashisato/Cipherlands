import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

const CONTRACT_NAME = "Cipherlands";

task("task:address", "Prints the Cipherlands address").setAction(async function (_args: TaskArguments, hre) {
  const { deployments } = hre;
  const deployment = await deployments.get(CONTRACT_NAME);
  console.log(`${CONTRACT_NAME} address is ${deployment.address}`);
});

task("task:join", "Join Cipherlands and receive an encrypted tile")
  .addOptionalParam("address", "Optional Cipherlands address override")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const deployment = taskArguments.address ? { address: taskArguments.address } : await deployments.get(CONTRACT_NAME);
    console.log(`${CONTRACT_NAME}: ${deployment.address}`);

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt(CONTRACT_NAME, deployment.address);

    const tx = await contract.connect(signer).joinGame();
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);
  });

task("task:decrypt-position", "Decrypt a player's encrypted tile")
  .addOptionalParam("address", "Optional Cipherlands address override")
  .addOptionalParam("player", "Player address (defaults to signer)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address ? { address: taskArguments.address } : await deployments.get(CONTRACT_NAME);
    console.log(`${CONTRACT_NAME}: ${deployment.address}`);

    const [signer] = await ethers.getSigners();
    const target = (taskArguments.player as string | undefined) ?? signer.address;

    const contract = await ethers.getContractAt(CONTRACT_NAME, deployment.address);
    const encryptedPosition = await contract.getEncryptedPosition(target);

    const clearPosition = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedPosition,
      deployment.address,
      signer,
    );

    console.log(`Encrypted position: ${encryptedPosition}`);
    console.log(`Clear position    : ${clearPosition}`);
  });

task("task:make-public", "Make your position publicly decryptable")
  .addOptionalParam("address", "Optional Cipherlands address override")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const deployment = taskArguments.address ? { address: taskArguments.address } : await deployments.get(CONTRACT_NAME);
    console.log(`${CONTRACT_NAME}: ${deployment.address}`);

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt(CONTRACT_NAME, deployment.address);

    const tx = await contract.connect(signer).makePositionPublic();
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);
  });

task("task:list-public", "Lists public players and decryptable tiles")
  .addOptionalParam("address", "Optional Cipherlands address override")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address ? { address: taskArguments.address } : await deployments.get(CONTRACT_NAME);
    console.log(`${CONTRACT_NAME}: ${deployment.address}`);

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt(CONTRACT_NAME, deployment.address);

    const [players, positions] = await contract.getPublicPlayerPositions();
    if (!players.length) {
      console.log("No public players registered yet.");
      return;
    }

    console.log(`Found ${players.length} public player(s):`);
    for (let i = 0; i < players.length; i++) {
      const tile = await fhevm.userDecryptEuint(FhevmType.euint32, positions[i], deployment.address, signer);
      console.log(`- ${players[i]} => tile ${tile}`);
    }
  });
