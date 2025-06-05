// src/utils/mintNFT.ts
import { ethers } from "ethers";
import { NFT_BADGE_ADDRESS, NFT_BADGE_ABI } from "../constants/contract";

export const mintNFTBadge = async (signer: ethers.Signer) => {
  try {
    const contract = new ethers.Contract(NFT_BADGE_ADDRESS, NFT_BADGE_ABI, signer);
    const tx = await contract.mintBadge(); // Assumes mintBadge is the function name
    await tx.wait();
    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error("Minting failed:", error);
    return { success: false, error };
  }
};
