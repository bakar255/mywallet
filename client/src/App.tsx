import { BrowserProvider, ethers, formatEther, Wallet } from 'ethers'
import './App.css'
import './index.css'
import { useState, useEffect } from 'react'
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
// import { QRCode } from 'qrcode.react';
import QRCode from "react-qr-code";
import 'react-toastify/dist/ReactToastify.css';
import { createSwapTransaction, USDC, WETH, getExchangeRate} from './components/uniswap'
 import { Token } from '@uniswap/sdk-core';
 import { AiOutlineQrcode } from "react-icons/ai";


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
  const [amountIn, setAmountIn] = useState("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [amountOut, setAmountOut] = useState("");
  const [tokenIn, setTokenIn] = useState<Token>(WETH);
  const [tokenOut, setTokenOut] = useState<Token>(USDC)
  const [loading, setLoading] = useState(false);
  const [mmbox, setMmbox] = useState ('activités');
  const [account, setAccount] = useState<string | null>(null);
  const [accounts, setAccounts] = useState([]);
  const [soldeEth, setSoldeEth] = useState("");
  const [soldeSep, setSoldeSep] = useState("");

   const addrslice = (addr) => {
   return addr ? `${addr.slice(0, 4)}...${addr.slice(-3)}` : '';}

   const geremmbox = (tab) => {
  setMmbox(tab)}

  const mmonglets = ['activités', 'jetonsNFT', 'assets']

  const notify = () => toast('Toast');

    // API

   interface EthereumTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string; 
  gas: string;
  gasPrice: string;
  gasUsed: string;
  isError: string;
  txreceipt_status: string;
}


const getTransactions = async (address: string) => {
  try {
    const response = await axios.get("https://api.etherscan.io/api", {
      params: {
        module: "account",
        action: "txlist",
        address: address,
        sort: "desc",
        apikey: "GUUTS1ESGKBRYHFT7Y2W5VS16TNNVETHMX"
      },
    });

    if (response.data.status === "1") {
      setTransactions(response.data.result);
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
};

useEffect(() => {
  getTransactions("0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263");
}, []);
  
        // Dropdown Accounts Effects

        useEffect(() => {
        if (!account) return;

          const fetchBalance = async () => {
          const provider = new ethers.BrowserProvider(window.ethereum);
          getSolde(account, provider); 
        };

        fetchBalance();
      }, [account]);
   
    // Get Solde from Acc

    // Fetch raw Balance
     async function fetchRawBalance(addressUser: string, provider: BrowserProvider): Promise<bigint> {
        if (!addressUser || !provider) throw new Error("Paramètre unvalided") 
          return await provider.getBalance(addressUser) 
      }

      // Set statement and format balance
     const getSolde = async (addressUser: string, provider: BrowserProvider) => {
      try {
        
        const rawBalance = await fetchRawBalance(addressUser, provider)
        const balanceRond = formatEth(rawBalance);
        setSolde(balanceRond);
        console.log("Solde Eth:", balanceRond);
        return balanceRond;

      } catch (error) {
        console.error("", error)     
      }

      function formatEth(balanceWei: bigint, decimals: number = 4): string {
        const balanceEther = parseFloat(ethers.formatEther(balanceWei));
        return balanceEther.toFixed(decimals);
      }  

  };

  // Connect my wallet

      const connecterWallet = async () => {
      await new Promise((r) => setTimeout(r, 200));
      if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const access = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(access[0]);
      setAccounts(access);
      const signer = await provider.getSigner();
      const adresseUser = await signer.getAddress();
      setAdresse(adresseUser);
      setWalletAddr(adresseUser);
      console.log("Adresse connectée :", adresseUser);
      await getSolde(adresseUser, provider);
      setConnecter(true)
      // Api set
      const txs = await getTransactions(adresseUser)
  
      toast.success("Votre wallet est connecter !")
        }        
  }
   // Disconnect the Wallet
  
    const deconnecterWallet = async () => {
    await new Promise((r) => setTimeout(r, 200));
    setAdresse("");
    setSolde("");
    setTransactions([]);
    console.log("Déconnecté.")
    setConnecter(false)
    toast.error("Votre Wallet est déconnecter")
    setWalletAddr("");
    setAccount("");
  
  }

  const handleSwap = async () => {

  if (!window.ethereum) {
    alert("Installez MetaMask !");
    return;
  }

  if (!amountIn || Number(amountIn) <= 0) {
    alert("Entrez un montant valide");
    return;
  }

  try {
    // Initialisation
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    //  (WETH → USDC)
    const tokenIn = WETH;
    const tokenOut = USDC;
    const amountInWei = ethers.parseEther(amountIn); // ETH to wei

    // 3. 
    const tx = await signer.sendTransaction({
      to: "0xE592427A0AEce92De3Edee1F18E0157C05861564", 
      value: amountInWei,
      data: "0x" // 
    });

    console.log("Transaction envoyée :", tx.hash);
    alert("Swap en cours !");

  } catch (error) {
    console.error("Erreur :", error);
    alert("Échec : " + (error instanceof Error ? error.message : "Voir la console"));
  }
}; 
      // Network change by ChainId
    const handleNetworkChange = async (network: string) => {
  try {
    let chainId;
    if (network === "sepolia") {
      chainId = "0xaa36a7"; // Sepolia en hex
      
      toast.error('Disconnected, Changing Network')
    } else if (network === "mainnet") {
      chainId = "0x1"; // Ethereum Mainnet en hex
      
      toast.error('Disconnected, Changing Network')
    }
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });

    toast.dismiss();
    toast.success(``)
  } catch (err) {
    console.error("Erreur lors du changement de réseau :", err);
  }
};

// Intiliation AmountOut

useEffect(() => {
  const estimate = async () => {
    if (!amountIn || !tokenIn || !tokenOut) {
      setAmountOut("");
      return;
    }

    try {
      // Utilisez votre fonction existante ou cette version simplifiée :
      const rate = await getExchangeRate(tokenIn, tokenOut); // À implémenter
      setAmountOut((Number(amountIn) * rate).toFixed(1));
    } catch {
      setAmountOut("Error");
    }
  };

  estimate();
}, [amountIn, tokenIn, tokenOut]);


     // Navigator copy-text wallet
       const copyWallet = () => {
      navigator.clipboard.writeText(walletaddr)
        .then(() => {
          toast.success('Adresse copiée dans le presse-papiers !');
        })
        .catch(err => {
          toast.error('Erreur lors de la copie : ', err);
            });
      }
    // Send funds 

      const envoyerETH = async () => {
    if (!estConnecte) {
      toast.error("Connect Your Wallet")
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
      console.log(`Transaction envoyée ! Hash: ${tx.hash}`)
      const txs = await getTransactions(adresse)
      await getSolde(adresse, provider)

    } catch (error: any) {
      console.error("Erreur en envoyant l'ETH:", error)
      toast.error("Erreur lors de l'envoi : " + error.message)
    }


  const GetAddr = async () => {
  if (!estConnecte) {
    toast.error("Connecte ton wallet d'abord");
    return; 
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    setAdresse(userAddress); 

    
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
 
})}

}
   /////////////////////////////////////////////////////////////

return (
  <div className="min-h-screen flex-col lalacolor">
    <header>
      <Toaster />
      <nav className="px-4 py-3 navbar navbar-expand-lg navbar-light py-lg-0">
        <div className="mx-auto flex justify-between items-center">
          <div className="text-white text-lg font-bold">Wallet D&R</div>
          <div className="space-x-2">
            <button className="px-2 rounded-lg cursor-pointer"></button>
            <button
              className={estConnecte ? 'bg-red-500 cursor-pointer text-white rounded-lg px-3 py-2' : ' cursor-pointer bg-green-700 text-white rounded-lg px-3 py-2' }
              onClick={estConnecte ? deconnecterWallet : connecterWallet} >
              {estConnecte ? "Déconnecter" : "Connecter"}
            </button>
             <select
              value={account ?? ""}
              onChange={(e) => setAccount(e.target.value)}
              className="bg-gray-600 text-white px-2 py-3 rounded-lg font-semibold"
            >
              {accounts.map((addr) => (
                <option key={addr} value={addr} className="">
                  {addrslice(addr)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </nav>
    </header>

    <div>
      <div className="wallet mx-auto p-6 px-3 mt-10 rounded-lg shadow-md text-center bg-gray-800 relative">
        <div className="text-center p-6 rounded-lg ">
          <select
            name=""
            id="network"
            className="absolute top-2 right-3 rounded-lg flex w-20 min-h-[40px] bg-gray-500"
            onChange={(e) => handleNetworkChange(e.target.value)}>
              <img src="arrow.svg" alt="arrow" className="w-10" />
             <option value="mainnet"> Mainnet</option>
            <option value="sepolia">Sepolia</option>
          </select>
          <span className="whitespace-nowrap text-shadow-xs text-gray-500 font-semibold leading-none mt-1">
            {solde}ETH
          </span>

          <div className="mb-10">
            <p className="absolute text-gray-400 mb-5 top-3 left-5 font-semibold">
              Your balance:
            </p>
            <span className="whitespace-nowrap text-4xl font-semibold leading-none ">
              0$
            </span>
            <span className="whitespace-nowrap text-shadow-xs text-gray-500 font-semibold leading-none"></span>
          </div>

          <button onClick={() => setReceiveUp(true)} className="btnpanel">
            Receive
            <img src="/scan-barcode.svg" alt="scan" className="imgbtn" />
          </button>
       {/* Qr Code Container */}
          {receiveUp && (
            <div className="popup-touch">
              <div className="popup-receive relative flex flex-col">
                <button onClick={() => setReceiveUp(false)} className="x top-0 right-2">
                  &times;
                </button>
                <p className="text-white">Receive</p>
                <div className="qr-container flex flex-col items-center p-5">
                  <QRCode value={walletaddr} size={128} bgColor="#ffffff" fgColor="#000000" level="L" />
                  <p className="address-label mb-4 font-semibold">Address:</p>
                  <span className="address font-semibold">{walletaddr}</span>
                  <button onClick={copyWallet} className="min-h[10px] rounded-xl p-3 flex items-center">
                    <img src="copy.svg" alt="copy" className="w-5 mr-2 bg-g cursor-pointer" />
                    <p className="font-bold text-white"> Copy </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          <button onClick={() => setSwapUp(true)} className="btnpanel mx-1">
            Swap
            <img src="swap.svg" alt="swap" className="imgbtn" />
          </button>
          {/* Swap Container */}
          {swapUp && (
            <div className="popup-touch">
              <div className="popup-content relative">
                <h2 className="font-bold mb-15">Swap</h2>
                <button onClick={() => setSwapUp(false)} className="x top-0 right-2">
                  &times;
                </button>
                <div className="justify-center items-center space-y-7">
                  <div className="bg-gray-800 w-100 min-h-[100px] rounded-lg items-center flex space-x-0 relative">
                    <div className="flex absolute top-0 left-0 mx-5 space-x-2">
                      <p className="text-gray-500">Amount:</p>
                    </div>
                    <select name="" id="" className="bg-gray-700 rounded-lg w-20 min-h-[40px]"
                      value={tokenIn.symbol}
                       onChange={(e) => setTokenIn(e.target.value === 'WETH' ? WETH : USDC)}>
                      <option value="">WETH</option>
                     </select>
                     <div className="items-center justify-between flex">
                      <input
                        type="text"
                        placeholder="0.00"
                        className="bg-transparent text-right text-2xl outline:none w-70"
                        value={amountIn}
                        onChange={(e) => setAmountIn(e.target.value)}
                      />
                    </div>
                  </div>
                  <button className="cursor-pointer">
                    <img src="/swap.svg" alt="" className="w-10  rounded-full" />
                  </button>
                  <div className="bg-gray-700 w-100 min-h-[100px] rounded-lg items-center flex space-x-0 relative">
                    <div className="flex absolute top-0 mx-5">
                      <p className="text-gray-500">Amount:</p>
                    </div>
                    <select name="" id="" className="bg-gray-800 rounded-lg flex w-20 min-h-[40px]">
                      <option value="">USDC</option>
                    </select>
                    <div className="items-center justify-between flex">
                      <input
                        type="text"
                        value={amountOut}
                        placeholder='0.00'
                        className="bg-transparent text-right text-2xl outline:none w-70"
                      />
                    </div>
                  </div>
                   <button onClick={handleSwap}disabled={!amountIn} className={`w-25 p-3 rounded-lg  transition-colors ${ amountIn ? 'bg-green-600 ' : 'bg-gray-500 text-white'}`}>Swap</button>
                </div>
              </div>
            </div>
          )}
          <button onClick={() => setOngletUp(true)} className="btnpanel">
            Envoyer
            <img src="send.svg" alt="send" className="imgbtn" />
          </button>
          {/* Sends Container */}
          {Ongletup && (
           <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
            <div className=' w-full p-5 rounded-lg max-w-md bg-gray-800'>
              {/* header sends */}
                <div className='flex items-center justify-between mb-7 relative'>
                <h2 className='font-bold text-white text-2xl'>Send Crypto</h2>
                <button
                 className='dark:text-gray-400 dark:hover:text-gray-200 text-gray-500 hover:text-gray-700  absolute right-0 ' 
                 onClick={() => setOngletUp(false)}>X</button>
              </div>

              <div className='space-y-10'>
               <div className='relative'>
                  <label className='block text-sm font-medium text-white dark:text-gray-300  text-left mb-3'>Recipient Address </label>
                     {/* Oh shyt i might shill i bit*/}
                    <input 
                      type="text"
                       value={destinataire}
                       onChange={(e) => setDestinataire(e.target.value)}
                       className='w-full border border-gray-300 p-4 rounded-lg pr-3'
                        placeholder='Enter wallet address'
                         />
                          <span className='absolute right-0 top-1/4 translate-y-1/2'><AiOutlineQrcode className='w-9 h-9 mx-1'/></span>
           
                        </div>

                         <div className='relative'>
                         <label className="block font-medium text-left text-white dark:text-gray-300 mb-4">Amount</label>
                          <input 
                           type="text" 
                             className='w-full p-4  pr-10 border border-gray-300 outline rounded-lg'
                              placeholder='Amount'
                              onChange={(e) => setMontant(e.target.value)}
                              value={montant}
                               />
                               <span className='absolute right-2 top-1/2
                                text-gray-200 translate-y-1/2'>ETH</span>
                             </div>
                          <div>
                      <button 
                      className='p-5 w-20 bg-green-600 px-4 py-2 text-white rounded-lg font-medium '
                      >Send</button>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="border-2 border-solid border-gray-400 rounded-lg relative"></div>
        <div className="mm-box tabs inline-block">
          <ul className="justify-center tabsul">
            <button onClick={() => geremmbox("activités")} className="tabitem">
              Activity
            </button>
            <button onClick={() => geremmbox("jetonsNFT")} className="tabitem">
              Jetons NFT
            </button>
            <button onClick={() => geremmbox("assets")} className="tabitem">
              Assets
            </button>
          </ul>
        </div>
        <div>
          <span>
            <div className="onglet-container shadow bg-gray-700">
                { mmbox === "activités" && (
                    <div className='flex  items-center'>
                      <h2>History : </h2>
                       <div className='justitfy-between items-center w-full'>
                         <div  className='bg-blue-600 rounded-lg '>
                         </div>
                         </div>
                      </div>
                )}
              {mmbox === "jetonsNFT" && (
                <div>
                  <h4>Jetons NFT </h4>
                </div>
              )}
              {mmbox === "assets" && (
                <div>
                  <h4>Assets</h4>
                  <div className='flex-col container-assets p-4 mb-4 '>
                    <div className='flex items-center justify-between'>
                       <div className='flex items-center space-x-3'> 
                         <img src="eth_logo.svg" alt="ethlogo" className='w-10' />
                        <a className=''>Ethereum</a>
                         </div>
                        <span className='text-right'>{solde}</span>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </span>
        </div>
      </div>

      <div className="rounded-lg mb-10">
        <h2 className="font semi-bold leading-none text-2xl"></h2>
        <ul className="text-sm text-white space-y-2 max-h-48 overflow-y-auto"></ul>
      </div>
    </div>
  </div>

     )}

export default App;
