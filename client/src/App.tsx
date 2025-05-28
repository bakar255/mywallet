import { ethers } from 'ethers'
import './App.css'
import { useState } from 'react'


const [solde, setSolde] = useState("0.00");





 const App: React.FC = () => {

  return (
   
  <div className="max-w-sm mx-auto  p-8 rounded-lg shadow-xl bg-gray-800">
    <div className="flex justify-center"> 
     <img src="/wallet.png" alt="Portefeuille" className="h-17 w-17 h-center" />
       </div>
           <div className="ml-4 pt-5">
           <h2 className="text-xl text-white-400 leading-tight mb-3 "> Ton Montant :</h2>
           <div className=''>  
           <h4 className='text-xl rounded-lg mb-3' id='balance'>{solde} ETH</h4>

            </div>
           <button className= "tailwind-button">Deposer</button>
           <button className="tailwind-button mx-4">Ajouter</button>
           <div className='flex items-center p-5 mb-1'>
            <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-5 px-4 rounded-l'>Envoyer</button>
           <input type="text" placeholder="Montant ethereum" className="border border-gray-300 rounded p-2 focus:outline-none mx-2 "/>
           </div>
           
       </div> 
  </div>

  )
}

export default App
