import { useEffect, useMemo, useState } from 'react';
import { Contract } from 'ethers';
import { useReadContract } from 'wagmi';
import type { Address } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import '../styles/PlayerPanel.css';

interface PlayerPanelProps {
  address?: Address;
  onPositionDecrypted: (tile: number | null) => void;
}

export function PlayerPanel({ address, onPositionDecrypted }: PlayerPanelProps) {
  const signerPromise = useEthersSigner();
  const { instance } = useZamaInstance();
  const [busyAction, setBusyAction] = useState<'join' | 'decrypt' | 'public' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tile, setTile] = useState<number | null>(null);

  const hasJoinedQuery = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasJoined',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const isPublicQuery = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isPublic',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && hasJoinedQuery.data),
    },
  });

  const encryptedPositionQuery = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getEncryptedPosition',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && hasJoinedQuery.data),
    },
  });

  const hasJoined = Boolean(hasJoinedQuery.data);
  const isPublic = Boolean(isPublicQuery.data);
  const encryptedPosition = encryptedPositionQuery.data as string | undefined;

  useEffect(() => {
    setTile(null);
    onPositionDecrypted(null);
  }, [address, onPositionDecrypted]);

  const readyToDecrypt = useMemo(() => {
    return Boolean(instance && address && hasJoined && encryptedPosition);
  }, [instance, address, hasJoined, encryptedPosition]);

  const performJoin = async () => {
    if (!address || !signerPromise) {
      setErrorMessage('Connect a wallet to join the map.');
      return;
    }

    setBusyAction('join');
    setStatusMessage('Joining Cipherlands...');
    setErrorMessage(null);

    try {
      const signer = await signerPromise;
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.joinGame();
      await tx.wait();

      await hasJoinedQuery.refetch();
      await encryptedPositionQuery.refetch();

      setStatusMessage('Successfully joined the map. Decrypt to reveal your tile.');
      setTile(null);
      onPositionDecrypted(null);
    } catch (error) {
      console.error('Failed to join Cipherlands:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to join the game.');
    } finally {
      setBusyAction(null);
    }
  };

  const performDecrypt = async () => {
    if (!readyToDecrypt || !signerPromise || !encryptedPosition) {
      setErrorMessage('Nothing to decrypt yet.');
      return;
    }

    setBusyAction('decrypt');
    setStatusMessage('Requesting decryption from Zama relayer...');
    setErrorMessage(null);

    try {
      const keypair = instance.generateKeypair();
      const handleContractPairs = [
        {
          handle: encryptedPosition,
          contractAddress: CONTRACT_ADDRESS,
        },
      ];

      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays,
      );

      const signer = await signerPromise;
      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message,
      );

      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays,
      );

      const decryptedValue = result[encryptedPosition];
      const tileNumber = Number(decryptedValue);
      if (!Number.isFinite(tileNumber)) {
        throw new Error('Unexpected decrypted value.');
      }

      setTile(tileNumber);
      setStatusMessage(`Your position is tile #${tileNumber}.`);
      onPositionDecrypted(tileNumber);
    } catch (error) {
      console.error('Failed to decrypt position:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to decrypt position.');
    } finally {
      setBusyAction(null);
    }
  };

  const performMakePublic = async () => {
    if (!address || !signerPromise) {
      setErrorMessage('Connect a wallet first.');
      return;
    }
    if (!hasJoined) {
      setErrorMessage('Join the game before changing visibility.');
      return;
    }

    setBusyAction('public');
    setStatusMessage('Publishing your encrypted position...');
    setErrorMessage(null);

    try {
      const signer = await signerPromise;
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.makePositionPublic();
      await tx.wait();

      await isPublicQuery.refetch();
      await encryptedPositionQuery.refetch();

      setStatusMessage('Your tile is now publicly decryptable.');
    } catch (error) {
      console.error('Failed to make position public:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to share position.');
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <section className="panel-card">
      <header className="panel-header">
        <h2 className="panel-title">My Position</h2>
        <p className="panel-subtitle">Join Cipherlands and decrypt your secret tile.</p>
      </header>

      <div className="panel-status">
        <dl>
          <div className="panel-row">
            <dt>Status</dt>
            <dd>{hasJoined ? 'Joined' : 'Not joined'}</dd>
          </div>
          <div className="panel-row">
            <dt>Visibility</dt>
            <dd>{isPublic ? 'Public' : 'Private'}</dd>
          </div>
          <div className="panel-row">
            <dt>Tile</dt>
            <dd>{tile ? `#${tile}` : 'Encrypted'}</dd>
          </div>
        </dl>
      </div>

      <div className="panel-actions">
        <button
          onClick={performJoin}
          disabled={!address || hasJoined || busyAction === 'join'}
          className="panel-button primary"
        >
          {!address ? 'Connect wallet to join' : hasJoined ? 'Already joined' : busyAction === 'join' ? 'Joining...' : 'Join Cipherlands'}
        </button>

        <button
          onClick={performDecrypt}
          disabled={!readyToDecrypt || busyAction === 'decrypt'}
          className="panel-button"
        >
          {busyAction === 'decrypt' ? 'Decrypting...' : 'Decrypt my position'}
        </button>

        <button
          onClick={performMakePublic}
          disabled={!hasJoined || isPublic || busyAction === 'public'}
          className="panel-button subtle"
        >
          {isPublic ? 'Already public' : busyAction === 'public' ? 'Publishing...' : 'Make my position public'}
        </button>
      </div>

      {statusMessage ? <p className="panel-message success">{statusMessage}</p> : null}
      {errorMessage ? <p className="panel-message error">{errorMessage}</p> : null}
    </section>
  );
}
