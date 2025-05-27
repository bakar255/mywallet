// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SimpleWallet {

address public owner;

constructor() {
    owner = msg.sender;
}

//Recevoir des ETH directement, dans un coffre par exemple.

receive() external payable {}

// Voir le solde du contrat en uint256

function VoirSolde() public view returns(uint256){
    return address(this).balance;
}

// Retirer des fonds (Par le Owner seulement)

function Retirer(uint256 montant) public {
    require (owner == msg.sender, "Tu n'est pas autoriser !");
    require (address(this).balance >= 0, "Tu peux pas retirer ce montant !");
    payable(owner).transfer(montant);
} 


}