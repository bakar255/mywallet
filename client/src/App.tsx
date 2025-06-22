import { BrowserProvider, ethers, Wallet } from 'ethers'
import './App.css'
import './index.css'
import { useState, useEffect } from 'react'
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
// import { QRCode } from 'qrcode.react';
import QRCode from "react-qr-code";
import 'react-toastify/dist/ReactToastify.css';


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
  const [montantBuySwap, setMontantBuySwap] = useState("")
  const [montantSellSwap, setMontantSellSwap] = useState("")
  const [loading, setLoading] = useState(false);
  const [mmbox, setMmbox] = useState ('activités');
  const [account, setAccount] = useState<string | null>(null);
  const [accounts, setAccounts] = useState([]);
  
   const addrslice = (addr) => {
   return addr ? `${addr.slice(0, 4)}...${addr.slice(-3)}` : '';}

   const geremmbox = (tab) => {
  setMmbox(tab)}

  const mmonglets = ['activités', 'jetonsNFT', 'assets']

  const notify = () => toast('Toast');

    // API
   const apiKey = "";


  const getTransactions = async (adresse: string) => {
  try {
    const response = await axios.get("https://api.etherscan.io/api", {
      params: {
        module: "account",
        action: "txlist",
        address: "0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263",
        startblock: 0,
        endblock: 99999999,
        sort: "desc",
        apikey: "GUUTS1ESGKBRYHFT7Y2W5VS16TNNVETHMX"
      },
    });
       console.log("Réponse API :", response.data); 

    if (response.data.status === "1") {
      setTransactions(response.data.result);
      
    } else {
      console.error("Error API :", response.data.message);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions :", error);
  }
};
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
     const getSolde = async (adresseUser: string, provider: BrowserProvider) => {
     const balance = await provider.getBalance(adresseUser);
     const balanceEther = parseFloat(ethers.formatEther(balance));
     const balanceRond = balanceEther.toFixed(4);
     setSolde(balanceRond);
     console.log("Solde ETH :", balanceRond);

  };

   async function handleSwap() {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    if (!montantBuySwap || isNaN(Number(montantBuySwap))) {
      alert('Enter a valid amount');
      return;
    }
   
       setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      await getQuote(provider, montantBuySwap);
      alert('Swap successful!');
    } catch (error) {
      console.error(error);
      alert('Swap failed');
    } finally {
      setLoading(false);
    }
   }

  // Connect my wallet

      const connecterWallet = async () => {
      await new Promise((r) => setTimeout(r, 1000));
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
      setTransactions(txs)
      toast.success("Votre wallet est connecter !")
        }        
  }
   // Disconnect the Wallet
  
    const deconnecterWallet = () => {
    setAdresse("");
    setSolde("");
    setTransactions([]);
    console.log("Déconnecté.")
    setConnecter(false)
    toast.error("Votre Wallet est déconnecter")
    setWalletAddr("");
    setAccount("");

   }
     // Btn Copy-Paste Wallet
     const copyWallet = () => {
      navigator.clipboard.writeText(walletaddr)
        .then(() => {
          toast.success('Adresse copiée dans le presse-papiers !');
        })
        .catch(err => {
          toast.error('Erreur lors de la copie : ', err);
        });
      }

      // Network
    const handleNetworkChange = async (network: string) => {
  try {
    let chainId;
    if (network === "sepolia") {
      chainId = "0xaa36a7"; // Sepolia en hex
    } else if (network === "mainnet") {
      chainId = "0x1"; // Ethereum Mainnet en hex
    }
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (err) {
    console.error("Erreur lors du changement de réseau :", err);
  }
};

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
      setTransactions(txs)
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
  <div className="min-h-screen flex-col bg-sky-800">
    <header>
      <Toaster />
      <nav className="px-4 py-3 navbar navbar-expand-lg navbar-light py-lg-0">
        <div className="mx-auto flex justify-between items-center">
          <div className="text-white text-lg font-bold">Wallet D&R</div>
          <div className="space-x-2">
            <button className="px-2 rounded-lg cursor-pointer"></button>
            <button
              className="buttongreen"
              onClick={estConnecte ? deconnecterWallet : connecterWallet}
            >
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
            onChange={(e) => handleNetworkChange(e.target.value)}
          >
            <option value="sepolia">
              Sepolia
              <img src="arrow.svg" alt="arrow" className="w-10" />
            </option>
            <option value="mainnet">Mainnet</option>
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

          {receiveUp && (
            <div className="popup-touch">
              <div className="popup-receive relative flex flex-col">
                <button onClick={() => setReceiveUp(false)} className="x top-0 right-2">
                  &times;
                </button>
                <p className="text-white">Recevoir</p>
                <div className="qr-container flex flex-col items-center p-5">
                  <QRCode value={walletaddr} size={128} bgColor="#ffffff" fgColor="#000000" level="L" />
                  <p className="address-label mb-4 font-semibold">Adresse:</p>
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
                      <p className="text-gray-500">Buying</p>
                    </div>
                    <select name="" id="" className="bg-gray-700 rounded-lg flex w-20 min-h-[40px]">
                      <option value="">WETH</option>
                      <option value="">USDC</option>
                    </select>
                    <div className="items-center justify-between flex">
                      <input
                        type="text"
                        placeholder="0.00"
                        className="bg-transparent text-right text-2xl outline:none w-70"
                        onChange={(e) => setMontantBuySwap(e.target.value)}
                      />
                    </div>
                  </div>
                  <button className="cursor-pointer">
                    <img src="/swap.svg" alt="" className="w-10 inline-flex rounded-full" />
                  </button>
                  <div className="bg-gray-700 w-100 min-h-[100px] rounded-lg items-center flex space-x-0 relative">
                    <div className="flex absolute top-0 mx-5">
                      <p className="text-gray-500">Selling</p>
                    </div>
                    <select name="" id="" className="bg-gray-800 rounded-lg flex w-20 min-h-[40px]">
                      <option value="">WETH</option>
                      <option value="">USDC</option>
                    </select>
                    <div className="items-center justify-between flex">
                      <input
                        type="text"
                        placeholder="0.00"
                        className="bg-transparent text-right text-2xl outline:none w-70"
                        onChange={(e) => setMontantSellSwap(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSwap}
                    className="flex mx-42 buttongreen bottom-3 absolute px-5 cursor-pointer py-2 outline-2 focus:outline rounded-xl"
                  >
                    Swap
                  </button>
                </div>
              </div>
            </div>
          )}
          <button onClick={() => setOngletUp(true)} className="btnpanel">
            Envoyer
            <img src="send.svg" alt="send" className="imgbtn" />
          </button>
          {Ongletup && (
            <div className="popup-touch">
              <div className="min-h-[250px] mx-auto w-100 lalacolor relative rounded-lg py-3">
                <h2 className="text-xl font-bold mb-4 text-gray-500">Send</h2>
                 <div className="flex flex-col justify-center items-center space-y-6 ">
                  <button onClick={envoyerETH} className="buttongreen absolute bottom-0">
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
                    onChange={(e) => setDestinataire(e.target.value)}
                  />
                  <button onClick={() => setOngletUp(false)} className="x top-0 right-2">
                    &times;
                  </button>
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
              {mmbox === "activités" && (
                <div>
                  <h4>Activité </h4>
                    {transactions.length === 0 ? (
                        <p>Aucune transaction trouvée.</p>
                      ) : (
                        <ul>
                         { transactions.map((tx, index) => (
                            <li key={index}>
                              Hash: {tx.hash} - Montant: {parseFloat(tx.value) / 1e18} ETH
                            </li>
                          ))}
                        </ul>
                      )}
                </div>
              )}
              {mmbox === "jetonsNFT" && (
                <div>
                  <h4>Jetons NFT </h4>
                </div>
              )}
              {mmbox === "assets" && (
                <div>
                  <h4>Assets </h4>
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
