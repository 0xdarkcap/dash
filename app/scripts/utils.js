import { component, currentPage, toast } from "./stores";
import { ethers } from 'ethers';
import Home from '../src/components/Home.svelte';
const graph_url = 'https://api.thegraph.com/subgraphs/name/0xcap/cap3';
export const ETH = "0x0000000000000000000000000000000000000000";
export const USDC = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";

export async function getData(isETH) {
    const provider = new ethers.providers.JsonRpcProvider('https://arb-mainnet.g.alchemy.com/v2/P3ZqdKIrgefOzk-vQqiuXxmlq-FNfFAp');
    const block = (await provider.getBlock()).timestamp;
    const dayId = Math.round(block / 86400);

    const response = await fetch(graph_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query{
                    dayDatas(id:"${isETH ? ETH : USDC}-${dayId}", orderBy: date, orderDirection: desc, first: 1000){
                        id
                        cumulativeFees
                        cumulativePnl
                        cumulativeVolume
                        openInterest
                        tradeCount
                        positionCount
                    }
                }
            `
        })
    });
    const json = await response.json();
    return json.data.dayDatas.reverse()
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