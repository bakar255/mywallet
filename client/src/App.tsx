import { BrowserProvider, ethers, Wallet } from 'ethers'
import './App.css'
import { useState } from 'react'
import axios from 'axios';

const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;

const App: React.FC = () => {

  const [transactions, setTransactions] = useState<any[]>([]);
  const [adresse, setAdresse] = useState<string>("");
  const [solde, setSolde] = useState<string>("");
  const [estConnecte, setConnecter] = useState(false);
  const [montant, setMontant] = useState<string>("")
  const [destinataire, setDestinataire] = useState<string>("")
  const [Ongletup, setOngletUp] = useState(false);
    
const getTransactions = async (adresse: string) => {
  try {
    const apiKey = "CNPFJ4M9XJ1E22668DE748A2XQP5JBXQI4"; 
    const response = await axios.get(`https://api.etherscan.io/api`, {
      params: {
        module: "account",
        action: "txlist",
        address: adresse,
        startblock: 0,
        endblock: 99999999,
        sort: "desc",
        apikey: apiKey
      }
    });

    return response.data.result; // tableau des transactions
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions :", error);
    return [];
  }
};

  const getSolde = async (adresseUser: string, provider: BrowserProvider) => {
    const balance = await provider.getBalance(adresseUser);
    setSolde(ethers.formatEther(balance));
     console.log("Solde ETH :", ethers.formatEther(balance));
  }

  const connecterWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new BrowserProvider(window.ethereum);
      // 
      await window.ethereum.request({ method: 'eth_requestAccounts', params: [{ eth_accounts: {} }] });
      // Signer pour interagir avec la blockchain
      const signer = await provider.getSigner();
      const adresseUser = await signer.getAddress();
      // Utiliser l'adresseUser
      setAdresse(adresseUser);
      console.log("Adresse connectée :", adresseUser);
      // Afficher le solde UI
      await getSolde(adresseUser, provider);
      setConnecter(true)
      // Api set
      const txs = await getTransactions(adresseUser)
      setTransactions(txs)
      
        }
  }

    const deconnecterWallet = () => {
    setAdresse("");
    setSolde("");
    setTransactions([]);
    console.log("Déconnecté.")
    setConnecter(false)
   }
    
//
      const envoyerETH = async () => {
    if (!estConnecte) {
      alert("Connecte ton wallet d'abord")
      return
    }

    if (!ethers.isAddress(destinataire)) {
      alert("Adresse de destination invalide")
      return
    }

    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const tx = await signer.sendTransaction({
        to: destinataire,
        value: ethers.parseEther(montant)
      })

      alert(`Transaction envoyée ! Hash: ${tx.hash}`)

      const txs = await getTransactions(adresse)
      setTransactions(txs)
      await getSolde(adresse, provider)

    } catch (error: any) {
      console.error("Erreur en envoyant l'ETH:", error)
      alert("Erreur lors de l'envoi : " + error.message)
    }

  }
   /////////////////////////////////////////////////////////////
     return (

<div className="bg-gray-900 min-h-screen flex flex-col">
  <nav className= "px-4 py-3">
    <div className="max-w-7xl mx-auto flex justify-between items-center"> 
      <div className="text-white text-lg font-bold">Wallet D&R</div>
      <div className="space-x-2">   
        <button 
          onClick={estConnecte ? deconnecterWallet : connecterWallet} 
          className="bg-gray-500 hover:bg-gray-500 text-amber-100 px-3 py-1 rounded cursor-pointer"> 
          {estConnecte ? "Déconnecter" : "Connecter"}
        </button>
        <button  className="bg-gray-500 hover:bg-gray-500 text-amber-100 px-3 py-1 rounded cursor-pointer">
          Mywallet 
        </button>
      </div>
    </div>
  </nav>

 <div className="mx-70 px-3 p-10 mt-10 rounded-lg shadow-md text-center bg-gray-800">
    <div className="text-center p-6 rounded-lg">
        <div>
         <span className="whitespace-nowrap text-4xl font-semibold leading-none">{solde}0.00$</span>
        </div>
        

              <button className='btnpanel'>Swap</button>
            <button
                onClick={() => setOngletUp(true)}
                className="btnpanel gap-4 mx-4"
            >
                Send
            </button>

            {Ongletup && (
              <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white rounded-xl p-6 w-96 shadow-xl relative">
               <h2 className="text-xl font-bold mb-4 text-gray-500">Envoyer des ETH</h2>
                <div className="flex justify-center items-center space-x-2">                      <button onClick={envoyerETH}
                  className="bg-gray-500 text-amber-100 px-4 py-2 rounded cursor-pointer" >
                     Envoyer
                     </button>

              <input
                type="text"    
               placeholder="Montant Eth"
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none bg-gray-700 text-white"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                 />
                <input         
                type="text"
                placeholder="Adresse"
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none bg-gray-700 text-white"
                value={destinataire}
                onChange={(e) => setDestinataire(e.target.value)} />

          <button
         onClick={() => setOngletUp(false)}
         className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                 >
              &times;
       </button>
       </div>
     </div>
                </div>
            )}
        </div>
    </div>
  
    <div className=' bg-gray-900 rounded-lg mx-60'>
    <h2 className='font semi-bold leading-none text-2xl'>Transactions : </h2>
        <ul className="text-sm text-white space-y-2 max-h-48 overflow-y-auto">
            {transactions.slice(0, 5).map(tx => (
                <li key={tx.hash}>
                    Vers : {tx.to.slice(0, 6)}… • {ethers.formatEther(tx.value)} ETH
                </li>
            ))}
        </ul>
        </div>
</div>


  
      
          

     )}

export default App;