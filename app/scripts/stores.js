import { writable, derived } from 'svelte/store';

export const currentPage = writable();

export const component = writable();

export const toast = writable(null);

export const dayData = writable([]);

export const positionsDataETH = writable([]);

export const positionsDataBTC = writable([]);

export const tradeData = writable([]);

export const ETHprice = writable();

export const BTCprice = writable();
