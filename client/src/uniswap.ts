import { ethers } from 'ethers';
import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import { Trade, Route, SwapRouter } from '@uniswap/v3-sdk';

// Configure les tokens (exemple ETH -> USDC)
const USDC = new Token(
  1,
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  6,
  'USDC',
  'USD Coin'
);

const WETH = new Token(
  1,
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  18,
  'WETH',
  'Wrapped Ether'
);

export async function swapETHUSDC(provider: ethers.Provider.Web3Provider, signer: ethers.Signer, amountIn: string) {

  const amountInWei = ethers.utils.parseEther(amountIn);
  const amountInCurrency = CurrencyAmount.fromRawAmount(WETH, amountInWei.toString());

  
  const route = new Route([], WETH, USDC); 

  const trade = await Trade.fromRoute(route, amountInCurrency, TradeType.EXACT_INPUT);

  const slippageTolerance = new Percent(50, 10000); // 0.5%
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
  const swapTransaction = SwapRouter.swapCallParameters(trade, {
    slippageTolerance,
    deadline,
    recipient: await signer.getAddress(),
  });

  const txResponse = await signer.sendTransaction({
    to: SwapRouter.ADDRESS,
    data: swapTransaction.calldata,
    value: swapTransaction.value,
    gasLimit: ethers.utils.hexlify(300000),
  });

  await txResponse.wait();
}