// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTBadge is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    constructor() ERC721("NFTBadge", "NB") Ownable(msg.sender) {
        tokenCounter = 0;
    }

    function awardBadge(address user, string memory tokenURI) public onlyOwner {
        uint256 newTokenId = tokenCounter;
        _safeMint(user, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        tokenCounter++;
    }
}
