import { BrowserProvider, ethers } from 'ethers'
import './App.css'
import { useState } from 'react'
import axios from 'axios';




const App: React.FC = () => {


  const [transactions, setTransactions] = useState<any[]>([]);

  const [adresse, setAdresse] = useState<string>("");
  const [solde, setSolde] = useState<string>("");

  const getSolde = async (adresseUser: string, provider: BrowserProvider) => {
    const balance = await provider.getBalance(adresseUser);
    setSolde(ethers.formatEther(balance));
  }

  const connecterWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new BrowserProvider(window.ethereum);

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const signer = await provider.getSigner();

      const adresseUser = await signer.getAddress();
      setAdresse(adresseUser);

      await getSolde(adresseUser, provider);
    } else {
      console.log("MetaMask n'est pas installé.");
    }

  
  }

  const deconnecterWallet = () => {
    setAdresse("");
    setSolde("");
    console.log("Votre Wallet a été déconnecté.");
  }

  return (
     
 <div className="bg-gray-900 min-h-screen min-w-screen">
            
            <nav className="bg-gray-800 p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="text-white text-lg font-bold">Wallet D&R</div>
                    <div>
                <button onClick={connecterWallet} className="text-white mx-2">Connecter</button>
                <button onClick={deconnecterWallet} className="text-white mx-2">Deconnecter</button>

                <button className="text-white mx-2">Acceuil</button>
                    </div>
                </div>
                </nav>
                
            <div className="max-w-sm mx-auto p-8 rounded-lg shadow-xl bg-gray-800 mt-10">
                <div className="flex justify-center">
                    <img src="/wallet.png" alt="Portefeuille" className="h-17 w-17 h-center" />
                </div>
                <div className="ml-4 pt-5">
                    <h2 className="text-xl text-white-400 leading-tight mb-3">Ton Montant :</h2>
                    <div><h4 className="text-xl rounded-lg mb-3" id="balance">{solde} ETH</h4>
                    </div>
                    <button className="tailwind-button">Déposer</button>
                    <button className="tailwind-button mx-4">Ajouter</button>
                    <div className="flex items-center p-5 mb-1">
                        <button className="">Envoyer</button>
                        <input type="text" placeholder="Montant ethereum" className="border border-gray-300 rounded p-2 focus:outline-none mx-2" />   </div>
                       
                </div>
            </div>
            <div className='mt-10 bg-white '>
              <h3 className="text-white font-semibold">Dernières transactions :</h3>
              <ul className="text-sm text-white space-y-2 max-h-48 overflow-y-auto">
   

              </ul>
 
            </div>
        </div>
    

  )
}

export default App
