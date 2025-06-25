import { ethers } from 'ethers';

import {
  Token,
  CurrencyAmount,
  TradeType,
  Percent,
  Price,
} from '@uniswap/sdk-core';
import {
  Pool,
  Route,
  Trade,
  SwapRouter,
} from '@uniswap/v3-sdk';

// MainNet Tokens 
const USDC_ADDRESS = ethers.getAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
const WETH_ADDRESS = ethers.getAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');

export const USDC = new Token(
  1, // chainId
  USDC_ADDRESS, 
  6, 
  'USDC',
  'USD Coin'
);

export const WETH = new Token(
  1, 
  WETH_ADDRESS,
  18,
  'WETH',
  'Wrapped Ether'
);

const POOL_ADDRESS = '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8';

const POOL_ABI = [
  'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  'function liquidity() external view returns (uint128)',
];

export async function getPoolData(provider: ethers.Provider) {
  const poolContract = new ethers.Contract(POOL_ADDRESS, POOL_ABI, provider);
  const [slot0, liquidity] = await Promise.all([
    poolContract.slot0(),
    poolContract.liquidity(),
  ]);
  return {
    sqrtPriceX96: slot0.sqrtPriceX96,
    tick: slot0.tick,
    liquidity,
  };
}

export async function createSwapTransaction(
  
  signer: ethers.Signer,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
  slippage = 0.5
) {
  const provider = signer.provider;
  if (!provider) throw new Error('Signer must be connected to a provider');

  // 1.  datas pool
  const { sqrtPriceX96, tick, liquidity } = await getPoolData(provider);

  // 2.  pool Uniswap SDK
  const pool = new Pool(
    WETH,
    USDC,
    3000,
    sqrtPriceX96.toString(),
    liquidity.toString(),
    tick
  );

  // 3.  route swap
  const route = new Route([pool], WETH, USDC);


  const trade = await Trade.fromRoute(
    route,
    CurrencyAmount.fromRawAmount(WETH, amountIn.toString()),
    TradeType.EXACT_INPUT
  );

  // 5. 
  const slippageTolerance = new Percent(
    Math.round(slippageTolerancePercent * 100),
    10_000
  ); // ex: 0.5% = 50/10000

  const options = {
    slippageTolerance,
    recipient: await signer.getAddress(),
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
  };

  const methodParameters = SwapRouter.swapCallParameters([trade], options);

  // 6. return tx
  return signer.sendTransaction({
    to: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // SwapRouter V3
    data: methodParameters.calldata,
    value: methodParameters.value,
    gasLimit: 300000,    
  }
  
);

}

export async function getExchangeRate(tokenA: Token, tokenB: Token) {

  return 1800; //  1 ETH = 1800 USDC
}

 {/* export async function getRealRate(tokenIn: Token, tokenOut: Token, provider: ethers.Provider) {
  const poolAddress = '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6d8';
  
  const poolContract = new ethers.Contract(poolAddress, [
    'function slot0() view returns (uint160 sqrtPriceX96, int24 tick)'
  ], provider);
  const { sqrtPriceX96 } = await poolContract.slot0();
  const price = (Number(sqrtPriceX96) / 2 ** 96) ** 2;
  return tokenIn === WETH ? price : 1 / price;
}  */}