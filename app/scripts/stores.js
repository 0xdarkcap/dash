import { writable, derived } from 'svelte/store';

export const currentPage = writable();

export const component = writable();

export const toast = writable(null);

export const dayDataETH = writable([]);

export const dayDataUSDC = writable([]);

export const ETHprice = writable();

export const BTCprice = writable();
