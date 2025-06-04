import { useState } from "react";
import { connectWallet } from "../utils/ethereum";

const Header = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleConnect = async () => {
    const result = await connectWallet();
    if (result?.address) {
      setWalletAddress(result.address);
    }
  };

  return (
    <div className="header">
      <div className="header-left">
        <div className="app-icon">⛓</div>
        <h1>BlockTask</h1>
      </div>
      <div className="header-right">
        <button onClick={handleConnect}>
          {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...` : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
};

export default Header;
