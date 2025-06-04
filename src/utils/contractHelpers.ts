import { ethers } from "ethers";
import NFTBadgeABI from "../abis/NFTBadge.json"; // You'll generate this in the next step

const CONTRACT_ADDRESS = "your_deployed_contract_address_here"; // paste address from previous step

export async function getContractWithSigner() {
  if (!window.ethereum) throw new Error("MetaMask not detected");

  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTBadgeABI.abi, signer);
  
  return contract;
}
