import '../styles/MapGrid.css';

interface MapGridProps {
  mapSize: number;
  myTile: number | null;
  publicTiles: number[];
}

export function MapGrid({ mapSize, myTile, publicTiles }: MapGridProps) {
  const totalTiles = mapSize * mapSize;
  const tiles = Array.from({ length: totalTiles }, (_, index) => index + 1);

  const publicTileSet = new Set(publicTiles);

  return (
    <div className="map-card">
      <div className="map-header">
        <div>
          <h2 className="map-title">Cipherlands Map</h2>
          <p className="map-subtitle">20 × 20 grid — 400 total tiles</p>
        </div>
        <div className="map-legend">
          <span className="legend-item">
            <span className="legend-swatch legend-self" />
            <span>Your tile</span>
          </span>
          <span className="legend-item">
            <span className="legend-swatch legend-public" />
            <span>Public tile</span>
          </span>
        </div>
      </div>

      <div className="map-grid" style={{ gridTemplateColumns: `repeat(${mapSize}, 1fr)` }}>
        {tiles.map((tile) => {
          const isMine = myTile === tile;
          const isPublic = publicTileSet.has(tile);
          const className = [
            'map-tile',
            isMine ? 'map-tile-self' : '',
            !isMine && isPublic ? 'map-tile-public' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div key={tile} className={className}>
              <span>{tile}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
