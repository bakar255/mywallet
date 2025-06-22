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
const WETH = new Token(
  1,
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  18,
  'WETH',
  'Wrapped Ether'
);
const USDC = new Token(
  1,
  '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  6,
  'USDC',
  'USD Coin'
);

const POOL_ADDRESS = '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8';

const POOL_ABI = [
  'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  'function liquidity() external view returns (uint128)',
];

export async function getPoolData(provider: ethers.providers.Provider) {
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
  amountInEther: string,
  slippageTolerancePercent = 0.5
) {
  const provider = signer.provider;
  if (!provider) throw new Error('Signer must be connected to a provider');

  // 1. Récupère les datas pool
  const { sqrtPriceX96, tick, liquidity } = await getPoolData(provider);

  // 2. Crée la pool Uniswap SDK
  const pool = new Pool(
    WETH,
    USDC,
    3000,
    sqrtPriceX96.toString(),
    liquidity.toString(),
    tick
  );

  // 3. Crée la route swap
  const route = new Route([pool], WETH, USDC);

  // 4. (swap EXACT_INPUT)
  const amountIn = ethers.utils.parseEther(amountInEther);
  const trade = await Trade.fromRoute(
    route,
    CurrencyAmount.fromRawAmount(WETH, amountIn.toString()),
    TradeType.EXACT_INPUT
  );

  // 5. Prépare les paramètres du swap
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

  // 6. Construis et renvoie la tx
  return signer.sendTransaction({
    to: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // SwapRouter V3
    data: methodParameters.calldata,
    value: methodParameters.value,
    gasLimit: 300000,
  });
}