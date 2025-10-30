import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';
import { Header } from './Header';
import { MapGrid } from './MapGrid';
import { PlayerPanel } from './PlayerPanel';
import { PublicPlayers } from './PublicPlayers';
import '../styles/CipherlandsApp.css';

export function CipherlandsApp() {
  const { address } = useAccount();
  const [myTile, setMyTile] = useState<number | null>(null);
  const [publicTiles, setPublicTiles] = useState<Record<string, number>>({});

  const handleMyTile = useCallback((tile: number | null) => {
    setMyTile(tile);
  }, []);

  const handlePublicTile = useCallback((player: Address, tile: number | null) => {
    setPublicTiles((prev) => {
      if (tile === null) {
        const updated = { ...prev };
        delete updated[player];
        return updated;
      }
      return { ...prev, [player]: tile };
    });
  }, []);

  const handlePublicRoster = useCallback((players: Address[]) => {
    setPublicTiles((prev) => {
      const next: Record<string, number> = {};
      for (const player of players) {
        if (player in prev) {
          next[player] = prev[player];
        }
      }
      return next;
    });
  }, []);

  const publicTileValues = Object.values(publicTiles);

  return (
    <div className="cipherlands-app">
      <Header />
      <main className="cipherlands-main">
        <section className="cipherlands-map-card">
          <MapGrid
            mapSize={20}
            myTile={myTile}
            publicTiles={publicTileValues}
          />
        </section>

        <section className="cipherlands-panels">
          <PlayerPanel
            address={address}
            onPositionDecrypted={handleMyTile}
          />
          <PublicPlayers
            currentAccount={address}
            onDecrypt={handlePublicTile}
            onRosterChange={handlePublicRoster}
          />
        </section>
      </main>
    </div>
  );
}
