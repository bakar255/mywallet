# MyWallet    

## Description

MyWallet D&R is a React web application that allows you to manage an Ethereum wallet.
It lets you connect your wallet, view your balance, receive funds via QR code, send ETH, and perform simple token swaps.


## Fonctionnalités

- Connect / disconnect wallet with Metamask🔐
- Display ETH balance 🌐
- Generate a QR code to receive funds 💰
- Send ETH to a specific address ✔️
- Simple token swaps (WETH, USDC) 🔁
- Switch networks (Sepolia, Mainnet) ⚡

<img src="walletview.PNG" alt="alt text" width="600"/>

## Installation

1. Clone the repository

git clone

2. Install dependencies

npm install

3. Run the app locally

npm run dev

## Introduction

MyWallet is a dapp applications where you can sends funds, swap tokens in ethereum blockhain and metamask. I made a couple features to switch to mainnet and testnet via chain ID and more.
This applications was made with the framework react and a plugin-vite and tailwindcss for the frontend interfaces. 

## Features

- Ability to switch between Ethereum Mainnet and popular testnets (Sepolia) directly from the interface.
Detection of current chain via window.ethereum.chainId and dynamic chainChanged handling.

- Swapping ETH to USDC using the Uniswap SDK (@uniswap/sdk-core, @uniswap/v3-sdk) with fictif pool.

- TH transfers to any valid Ethereum address using ethers.js with notifications and tx-hash.

- Fully responsive frontend using Tailwind CSS.

- Connect your wallet with `window.ethereum.request({ method: 'eth_requestAccounts' })` and Changing Accounts from interfaces.


## 🛠️ Tech Stack

- React + TypeScript
- Vite
- TailwindCSS
- Ethers.js
- Uniswap SDK (v3)
- QR Code Generator (qrcode.react)

## 🔮 Ongoing Improvement

- Connect backend intefaces (history tx, etc.)
- Integration of real swaps via Uniswap router"
- Support NFT (envoi)
- Dark mode / Light mode automatique

## Licence

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white)
![Ethers.js](https://img.shields.io/badge/-Ethers.js-purple?logo=ethereum)


  




