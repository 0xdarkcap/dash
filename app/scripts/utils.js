import { component, currentPage } from './stores';
import Home from '../src/components/Home.svelte';
import Trades from '../src/components/Trades.svelte';
import {
  GRAPH_URL,
  ETH,
  PRICE_DENOMINATOR,
  PRODUCTS,
  BTCUSD,
} from './constants';

async function getData(query) {
  const response = await fetch(GRAPH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
    }),
  });
  const json = await response.json();
  return json;
}

export async function getVolumeData() {
  const query = `
                query{
                    dayDatas(orderBy: date, orderDirection: desc, first: 1000){
                        id
                        cumulativeFees
                        cumulativePnl
                        cumulativeVolume
                        openInterest
                        tradeCount
                        positionCount
                    }
                }
              `;
  const json = await getData(query);
  return json.data.dayDatas.reverse();
}
export async function getPrice(product) {
  const url = `https://api.exchange.coinbase.com/products/${product}/ticker`;
  try {
    const response = await fetch(url, { timeout: 10000 });
    const json = await response.json();

    return json.price;
  } catch (e) {
    throw e;
  }
}

export async function getPositionsData(queryOptions) {
  const filter = queryOptions.product
    ? `where:{productId:"${queryOptions.product}"},`
    : '';
  const query = `
                query{
                    positions(${filter} orderBy: ${queryOptions.orderBy}, orderDirection: ${queryOptions.orderDirection}, first: ${queryOptions.first}) {
                        id,
                        productId,
                        currency,
                        leverage,
                        price,
                        margin,
                        size,
                        user,
                        liquidationPrice,
                        isLong,
                        createdAtTimestamp,
                        updatedAtTimestamp
                    }
                }
              `;
  const json = await getData(query);
  return json.data.positions;
}

export async function getTradesData(queryOptions) {
  const filter = queryOptions.product
    ? `where:{productId:"${queryOptions.product}"},`
    : '';
  try {
    const query = `
      query {
        trades(
          ${filter} orderBy: ${queryOptions.orderBy}, orderDirection: ${queryOptions.orderDirection}, first: ${queryOptions.first}
        ) {
          margin
          size
          pnl
          entryPrice
          closePrice
          productId
          isLong
          leverage
          wasLiquidated
          currency
        }
      }
    `;
    const json = await getData(query);
    return json?.data?.trades;
  } catch (err) {
    return [];
  }
}

export function loadRoute(path, isInitial) {
  if (!path || path == '/' || path.includes('/home')) {
    component.set(Home);
    currentPage.set('home');
  } else if (path.includes('/trades')) {
    component.set(Trades);
    currentPage.set('trade');
    document.title = `Trade | CAP`;
  }
}

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var dat = a.getDate();
  var time = dat + ' ' + month + ' ' + year;
  return time;
}
export function formatDate(date) {
  const month = '' + (date.getMonth() + 1);
  const day = '' + date.getDate();
  return `${day}/${month}`;
}

export function priceTickFormatter(num) {
  if (num > 1000000) {
    return parseFloat((num / 1000000).toFixed(0)) + 'M';
  } else if (num > 999 && num < 1000000) {
    return parseFloat((num / 1000).toFixed(1)) + 'K';
  } else {
    return parseFloat(num.toFixed(1));
  }
}

export function priceFormatter(price, currency) {
  const precision = currency == ETH ? 3 : 2;
  return +(price / PRICE_DENOMINATOR).toFixed(precision);
}

export function getPositionXY(position, ethP) {
  return {
    x: +(position.liquidationPrice / PRICE_DENOMINATOR).toFixed(2),
    y: +(
      (position.margin / PRICE_DENOMINATOR) *
      (position.currency == ETH ? ethP : 1)
    ).toFixed(2),
  };
}

export function getPriceImpact(size, _productId, _currency) {
  if (!size || !_productId || !_currency) return 0;

  const productParams = PRODUCTS[_productId == BTCUSD ? 'BTC-USD' : 'ETH-USD'];
  const { baseSpread, maxSlippage, slippageExponent, maxLiquidity } =
    productParams;

  return (
    -1 *
    (baseSpread * 100 +
      maxSlippage *
        (1 -
          Math.exp(
            -1 *
              Math.pow(
                +size / maxLiquidity[_currency == ETH ? 'weth' : 'usdc'],
                slippageExponent
              )
          )))
  );
}

export function getUPL(position, latestPrice) {
  let upl = 0;
  if (position.price * 1 == 0) return undefined;

  let priceImpact = getPriceImpact(
    position.size / PRICE_DENOMINATOR,
    position.productId,
    position.currency
  );
  if (latestPrice) {
    if (position.isLong) {
      latestPrice = latestPrice * (1 + priceImpact / 100);
      upl =
        ((position.size / PRICE_DENOMINATOR) *
          (latestPrice * 1 - (position.price / PRICE_DENOMINATOR) * 1)) /
        (position.price / PRICE_DENOMINATOR);
    } else {
      latestPrice = latestPrice * (1 - priceImpact / 100);
      upl =
        ((position.size / PRICE_DENOMINATOR) *
          ((position.price / PRICE_DENOMINATOR) * 1 - latestPrice * 1)) /
        (position.price / PRICE_DENOMINATOR);
    }
    // TODO: Add interest
    // let interest = await getInterest(position);
    // upl += interest;
  }
  return upl;
}
