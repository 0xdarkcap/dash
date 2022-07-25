export const GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/0xcap/cap3';
export const ETH = '0x0000000000000000000000000000000000000000';
export const USDC = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8';
export const ETHUSD =
  '0x4554482d55534400000000000000000000000000000000000000000000000000';
export const BTCUSD =
  '0x4254432d55534400000000000000000000000000000000000000000000000000';
export const PRICE_DENOMINATOR = 100000000;
export const PRODUCTS = {
  'ETH-USD': {
    hours: '24/7',
    logo: '/logos/ETH.svg',
    baseSpread: 0.00025,
    maxSlippage: 5,
    slippageExponent: 2.5,
    maxLiquidity: {
      weth: 800,
      usdc: 2500000,
    },
  },
  'BTC-USD': {
    hours: '24/7',
    logo: '/logos/BTC.svg',
    baseSpread: 0.00025,
    maxSlippage: 5,
    slippageExponent: 2.5,
    maxLiquidity: {
      weth: 800,
      usdc: 2500000,
    },
  },
};
