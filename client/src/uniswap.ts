import { ethers } from 'ethers';
import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import { Route, Trade } from '@uniswap/v3-sdk';

// Tokens WETH et USDC mainnet
const WETH = new Token(1, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', 18, 'WETH', 'Wrapped Ether');
const USDC = new Token(1, '0x07865c6e87b9f70255377e024ace6630c1eaa37f', 6, 'USDC', 'USD Coin');

export async function getQuote(provider: ethers.BrowserProvider, amountIn: string) {
  const quoterAddress = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';

  const amountInWei = ethers.parseEther(amountIn);
  const amountInCurrency = CurrencyAmount.fromRawAmount(WETH, amountInWei.toString());

  const quoter = new ethers.Contract(quoterAddress, [
    'function quoteExactInputSingle(address,address,uint24,uint256,uint160) external returns (uint256)'
  ], provider);

  const fee = 3000;

  const amountOutRaw = await quoter.quoteExactInputSingle(
    WETH.address,
    USDC.address,
    fee,
    amountInWei.toString(),
    0
  );

  const amountOutCurrency = CurrencyAmount.fromRawAmount(USDC, amountOutRaw.toString());

  // Route
  const route = new Route([], WETH, USDC);

  const trade = Trade.createUncheckedTrade({
    route,
    inputAmount: amountInCurrency,
    outputAmount: amountOutCurrency,
    tradeType: TradeType.EXACT_INPUT,
  });

  return trade;
}