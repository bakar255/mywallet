import { BrowserProvider, ethers, Wallet } from 'ethers'
import './App.css'
import './index.css'
import { useState } from 'react'
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
// import { QRCode } from 'qrcode.react';
import QRCode from "react-qr-code";
import 'react-toastify/dist/ReactToastify.css';
import { swapETHUSDC } from './uniswap';



const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;


const App: React.FC = () => { 

  const [transactions, setTransactions] = useState<any[]>([]);
  const [adresse, setAdresse] = useState<string>("");
  const [solde, setSolde] = useState<string>('0');
  const [walletaddr, setWalletAddr] = useState('0x0000000000000000000000000000000000000000');
  const [estConnecte, setConnecter] = useState(false);
  const [montant, setMontant] = useState<string>("")
  const [destinataire, setDestinataire] = useState<string>("")
  const [Ongletup, setOngletUp] = useState(false);
  const [swapUp, setSwapUp] = useState(false);
  const [MenuUp, setMenuUp] = useState(false);
  const [receiveUp, setReceiveUp] = useState(false);
  const [montantSwap, setMontantSwap] = useState("")

  const [mmbox, setMmbox] = useState <'activités' |'jetons'|'assets'>('activités');

 

  //  TEST
   const receiv = () => {
    setReceiveUp(true);
  };

  const notify = () => toast('Toast');

    
  const getTransactions = async (adresse: string) => {
  try {
   
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

    return response.data.result; 
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions :", error);
    return [];
  }
};

     const getSolde = async (adresseUser: string, provider: BrowserProvider) => {
     const balance = await provider.getBalance(adresseUser);
     const balanceEther = parseFloat(ethers.formatEther(balance));
     const balanceRond = balanceEther.toFixed(4);
     setSolde(balanceRond);
     console.log("Solde ETH :", balanceRond);

  };

  const connecterWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts'});
      // Signer pour interagir avec la blockchain
      const signer = await provider.getSigner();
      const adresseUser = await signer.getAddress();
      // Utiliser l'adresseUser
      setAdresse(adresseUser);
      setWalletAddr(adresseUser);
      console.log("Adresse connectée :", adresseUser);
      // Afficher le solde UI
      await getSolde(adresseUser, provider);
      setConnecter(true)
      // Api set
      const txs = await getTransactions(adresseUser)
      setTransactions(txs)

       toast.success("Votre wallet est connecter !")
        }
  }


    const deconnecterWallet = () => {
    setAdresse("");
    setSolde("");
    setTransactions([]);
    console.log("Déconnecté.")
    setConnecter(false)
    toast.error("Votre Wallet est déconnecter")
    setWalletAddr("");

   }

     const copyWallet = () => {
      navigator.clipboard.writeText(walletaddr)
        .then(() => {
          toast.success('Adresse copiée dans le presse-papiers !');
        })
        .catch(err => {
          toast.error('Erreur lors de la copie : ', err);
        });
      }
   
   
//
      const envoyerETH = async () => {
    if (!estConnecte) {
      toast.error("Connecte ton wallet d'abord")
      return
    }

    if (!ethers.isAddress(destinataire)) {
      toast.error("Adresse de destination invalide")
      return
    }

    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const tx = await signer.sendTransaction({
        to: destinataire,
        value: ethers.parseEther(montant)
      })

      toast.success(`Transaction envoyée ! Hash: ${tx.hash}`)

      const txs = await getTransactions(adresse)
      setTransactions(txs)
      await getSolde(adresse, provider)

    } catch (error: any) {
      console.error("Erreur en envoyant l'ETH:", error)
      toast.error("Erreur lors de l'envoi : " + error.message)
    }

  const GetAddr = async () => {
  if (!estConnecte) {
    toast.error("Connecte ton wallet d'abord");
    return; // On arrête la fonction ici si pas connecté
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    setAdresse(userAddress); // Met à jour l’état avec l’adresse récupérée

    // Ici tu peux ouvrir ta popup ou faire ce que tu veux avec l’adresse
  } catch (error) {
    toast.error("Erreur lors de la récupération de l'adresse");
    console.error(error);
  }
  }
     {transactions.slice(0, 5).map((tx, index) => {
  const toAddress = typeof tx?.to === 'string' ? `${tx.to.slice(0, 6)}…` : 'Adresse inconnue';

  let amount = 'Montant inconnu';
  try {
    if (tx?.value != null) {
      amount = `${ethers.formatEther(tx.value)} ETH`;
    }
  } catch (e) {
    console.error('Erreur lors du formatage de la valeur:', e);
  }

  return (
    <li key={tx?.hash || index}>
      Vers : {toAddress} • {amount}
    </li>
  );
})}

    

  };

   /////////////////////////////////////////////////////////////
     return (
 
    
  <div className="bg-linear-to-t from-sky-600 to-indigo-500 min-h-screen flex-col">
  <header>
  <Toaster />
  <nav className= " lalacolor px-4 py-3 navbar navbar-expand-lg navbar-light py-lg-0">
    <div className=" mx-auto flex justify-between items-center"> 
      <div className="text-white text-lg font-bold">Wallet D&R</div>
      <div className="space-x-2 ">   
        <button  className=" px-2 rounded-lg cursor-pointer">
          <img src="/notification.svg" alt='notif' className='w-8 cursor-pointer'/>
        </button>
        <button  className="buttongreen"  onClick={estConnecte ? deconnecterWallet : connecterWallet} > 
          {estConnecte ? "Déconnecter" : "Connecter"}
          </button>
        </div>
        </div>
      </nav>
      </header>
    
          <div>
          <div className=" max-w-max mx-auto p-6  px-3  mt-10 rounded-lg shadow-md text-center bg-gray-800 relative">
          <div>
          </div>
          <div className="text-center p-6 rounded-lg">
          <div className='mb-7'>
              <h2 className='text-4xl absolute  top-1 font-semibold text-gray-500'></h2>
              <p className=" absolute text-gray-400 mb-5 top-3 left-5 font-semibold">Your balance:</p>
              <span className="whitespace-nowrap text-4xl font-semibold leading-none">{solde}$</span>
                </div>
                           <button onClick={() => setReceiveUp(true)} className="btnpanel">
                          Receive
                        <img src="/scan-barcode.svg" alt="scan" className="imgbtn" />
                      </button>
                    {receiveUp && (
                      <div className="popup-touch">
                        <div className="popup-content">
                            
                            <p className=" text-white ">Recevoir</p>
                              <div className="qr-container flex flex-col items-center p-5">
                             <QRCode
                              value={walletaddr}
                              size={128}
                              bgColor="#ffffff"
                              fgColor="#000000"
                              level="L"
                            />
                          </div>
                          <button onClick={() => setReceiveUp(false)} className="x">x</button>
                          <p className="address-label mb-4 font-semibold">Adresse:</p>
                          <span className="address font-semibold">{walletaddr}</span>
                          <button onClick={copyWallet} className="copy-btn bg-gray-500 rounded-xl p-3">
                            Copier l'URL
                          </button>
                        </div>
                      </div>
                    )}    
              <button onClick={() => setSwapUp(true)} className='btnpanel mx-1'>
                Swap
                 <img src="swap.svg" alt="swap" className='imgbtn'/>
                    </button>
                   { swapUp && (
                     <div className=' popup-touch'>
                       <div className= 'popup-content relative'>             
                       <h2 className=" font-bold">Swap</h2>
                        <button
                         onClick= {() => setSwapUp(false) } className='x'>
                              x 
                              </button>
                            <div className=''>
                            <a className='font-semibold text-gray-500 leading-none flex whitespace-nowrap '> Pay: </a>
                              <input type="text" placeholder='0.00$' className='border-2 border-gray-300 rounded px-3 py-2 bg-gray-700 text-white text-right'
                              />
                              </div>
                              <div className='flex justify-center'>
                              <button className='cursor-pointer' >
                              <img src="/swap.svg" alt="" className='w-10 h-10 inline-flex rounded-full'/>
                              </button>
                                <button className=' buttongreen bottom-3 absolute px-5 cursor-pointer py-2 outline-2 focus:outline rounded-xl'>
                              Swap  
                              </button>
                              </div>   

                            <div className=''>
                            <a className=' text-gray-500 font-semibold leading-none flex whitespace-nowrap'> Receive: </a>
                            <input type="text" placeholder='0.00$' className='border-2 border-gray-300 p-4 rounded text-white mb-10 text-right py-2 px-3 bg-gray-700'
                            onChange={(e) => setMontantSwap(e.target.value)}
                            />
              
                          <button
                          onClick= {() => setSwapUp(false) } className='x'>
                              x
                          </button>
                         
                            </div>
                          </div>      
                      </div>
                        )}
                      <button
                          onClick={() => setOngletUp(true)} className="btnpanel">
                          Envoyer
                          <img src="send.svg" alt="send" className='imgbtn' />
                      </button>
            {Ongletup && (
                <div className=" fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
                <div className="lalacolor rounded-xl p-6 mx-auto shadow-xl relative">
                <h2 className="text-xl font-bold mb-4 text-gray-500">Envoyer des ETH</h2>
                  <div className="flex justify-center items-center space-x-2 ">      
                  <button onClick={envoyerETH}
                      
                  className="bg-gray-500 px-4 py-2 rounded cursor-pointer" >
                     Envoyer
                     </button>
              <input
                type="text"    
               placeholder="Montant Eth"
                className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none bg-gray-700 text-white "
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                 />
                <input         
                type="text"
                placeholder="Adresse"
                className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none bg-gray-700 text-white"
                value={destinataire}
                onChange={(e) => setDestinataire(e.target.value)} />
              <button
            onClick={() => setOngletUp(false)}
            className="x" >
            &times;
          </button>
          </div>
        </div>
        </div>
            )}
        </div>
         <div className='border-2 border-solid border-gray-400 rounded-lg'>
            </div>
        <div className='mm-box tabs'>
              <ul className='justify-center space-x-8 tabsul'>
                <li className='tabitem'>Activity</li>
                <li className='tabitem'>Jetons NFT</li>
                <li className='tabitem'>Assets</li>
              </ul>
            </div>
        </div>  
        </div>
       <div className='rounded-lg mb-10'>
         <h2 className='font semi-bold leading-none text-2xl'></h2>
         <ul className="text-sm text-white space-y-2 max-h-48 overflow-y-auto">
      </ul>
     </div>
   </div>      

     )}

export default App;
