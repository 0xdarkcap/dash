import { component, currentPage } from './stores';
import { ethers } from 'ethers';
import Home from '../src/components/Home.svelte';
import { GRAPH_URL, ETH, USDC } from './constants';

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

export async function getPositionsData() {
  const query = `
                query{
                  positions(orderBy: liquidationPrice, orderDirection: asc, first: 1000) {
                    size
                    createdAtTimestamp
                    currency
                    liquidationPrice
                    leverage
                  }
                }
              `;
  const json = await getData(query);
  console.log(json);
  return json;
}

export function loadRoute(path, isInitial) {
  if (!path || path == '/' || path.includes('/home')) {
    component.set(Home);
    currentPage.set('home');
  }
  /*
      else if (path.includes('./pools')) {
          component.set('pools');
          currentPage.set('pools');
          document.title('CAP | pool stats');
      }
      else if (path.includes('./trades')) {
          component.set('trades');
          currentPage.set('trades');
          document.title('CAP | trades');
      }*/
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
