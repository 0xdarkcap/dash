import { writable, derived } from 'svelte/store';

export const currentPage = writeable()

export const component = writable()

export const toast = writable(null);