import { component, currentPage, toast } from "./stores";
import Home from '../src/components/Home.svelte';

export function loadRoute(path, isInitial) {
    if (!path || path == '/' || path.includes('/home')) {
        component.set(Home);
        currentPage.set('home');
        document.title("CAP | dashboard")
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