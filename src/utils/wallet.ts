// src/utils/wallet.ts
import { ethers } from "ethers";

export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("MetaMask is not installed!");
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return { provider, signer, address };
  } catch (err) {
    console.error(err);
    return null;
  }
};
