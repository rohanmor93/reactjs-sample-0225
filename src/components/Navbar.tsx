// src/components/Navbar.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { connectWallet } from "../utils/wallet";

const Navbar = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const navigate = useNavigate();

  const handleConnect = async () => {
    const wallet = await connectWallet();
    if (wallet) {
      setWalletAddress(wallet.address);
    }
  };

  const handleLogout = () => {
    // Clear any auth logic you have
    navigate("/");
  };

  return (
    <nav style={{ display: "flex", gap: "1rem", padding: "1rem", background: "#eee" }}>
      <Link to="/">Home</Link>
      <Link to="/tasks">TaskBoard</Link>
      {walletAddress ? (
        <span>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
