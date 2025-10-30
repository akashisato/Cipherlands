import { useEffect, useMemo, useState } from 'react';
import { useReadContract } from 'wagmi';
import type { Address } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import '../styles/PublicPlayers.css';

interface PublicPlayersProps {
  currentAccount?: Address;
  onDecrypt: (player: Address, tile: number | null) => void;
  onRosterChange: (players: Address[]) => void;
}

export function PublicPlayers({ currentAccount, onDecrypt, onRosterChange }: PublicPlayersProps) {
  const { instance } = useZamaInstance();
  const [decrypting, setDecrypting] = useState<Address | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localDecryptions, setLocalDecryptions] = useState<Record<string, number>>({});

  const publicDataQuery = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPublicPlayerPositions',
    query: {
      enabled: true,
      refetchInterval: 15_000,
    },
  });

  const players = useMemo(() => {
    const data = publicDataQuery.data as readonly [readonly string[], readonly string[]] | undefined;
    return data ? data[0].map((value) => value as Address) : [];
  }, [publicDataQuery.data]);

  const handles = useMemo(() => {
    const data = publicDataQuery.data as readonly [readonly string[], readonly string[]] | undefined;
    return data ? data[1] : [];
  }, [publicDataQuery.data]);

  useEffect(() => {
    onRosterChange(players);
    setLocalDecryptions((prev) => {
      const next: Record<string, number> = {};
      for (const player of players) {
        if (player in prev) {
          next[player] = prev[player];
        }
      }
      return next;
    });
  }, [players, onRosterChange]);

  const decryptTile = async (player: Address, index: number) => {
    if (!instance) {
      setError('Zama SDK is not ready yet.');
      return;
    }

    const handle = handles[index];
    if (!handle) {
      setError('Missing ciphertext handle.');
      return;
    }

    setDecrypting(player);
    setMessage('Requesting public decryption...');
    setError(null);

    try {
      const result = await instance.publicDecrypt([handle]);
      const decryptedValue = result[handle];
      const tile = Number(decryptedValue);

      if (!Number.isFinite(tile)) {
        throw new Error('Unexpected public decryption result.');
      }

      setLocalDecryptions((prev) => ({ ...prev, [player]: tile }));
      onDecrypt(player, tile);
      setMessage(`Decrypted tile #${tile} for ${player}`);
    } catch (err) {
      console.error('Failed to decrypt public tile:', err);
      setError(err instanceof Error ? err.message : 'Failed to decrypt public tile.');
    } finally {
      setDecrypting(null);
    }
  };

  return (
    <section className="public-card">
      <header className="public-header">
        <div>
          <h2 className="public-title">Public Explorers</h2>
          <p className="public-subtitle">Decrypt tiles made accessible by other players.</p>
        </div>
        <button
          className="public-refresh"
          onClick={() => publicDataQuery.refetch()}
          disabled={publicDataQuery.isLoading}
        >
          {publicDataQuery.isLoading ? 'Refreshing...' : 'Refresh list'}
        </button>
      </header>

      {players.length === 0 ? (
        <div className="public-empty">
          <p>No players have published their location yet.</p>
          <p>Positions appear here instantly once a player makes their tile public.</p>
        </div>
      ) : (
        <ul className="public-list">
          {players.map((player, index) => {
            const isSelf = currentAccount && player.toLowerCase() === currentAccount.toLowerCase();
            const tile = localDecryptions[player];

            return (
              <li key={player} className="public-item">
                <div className="public-info">
                  <span className="public-address">{player}</span>
                  {isSelf ? <span className="public-tag">You</span> : null}
                </div>
                <div className="public-actions">
                  <span className="public-tile">{tile ? `Tile #${tile}` : 'Encrypted'}</span>
                  <button
                    onClick={() => decryptTile(player, index)}
                    disabled={decrypting === player}
                    className="public-button"
                  >
                    {decrypting === player ? 'Decrypting...' : tile ? 'Decrypt again' : 'Decrypt tile'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {message ? <p className="public-message success">{message}</p> : null}
      {error ? <p className="public-message error">{error}</p> : null}
    </section>
  );
}
