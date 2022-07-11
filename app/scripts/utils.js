import { component, currentPage, toast } from "./stores";

export function setRoute(path, isInitial) {
    if (!path || path == '/' || path.includes('/home')) {
        component.set('home');
        currentPage.set('home');
        document.title("CAP | dashboard")
    }
    else if (path.includes('./pools')) {
        component.set('pools');
        currentPage.set('pools');
        document.title('CAP | pool stats');
    }
    else if (path.includes('./trades')) {
        component.set('trades');
        currentPage.set('trades');
        document.title('CAP | trades');
    }
}