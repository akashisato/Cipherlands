import { ConnectButton } from '@rainbow-me/rainbowkit';
import '../styles/Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">Cipherlands</h1>
            <p className="header-description">
              Encrypted exploration on a shared 20 × 20 map. Join the world, decrypt your tile, and choose when to make it public.
            </p>
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
