import { STORAGE_KEY } from "./constants.js";
import { validateTickets } from "./helpers.js";

export const loadTickets = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const data = JSON.parse(raw);
        return validateTickets(data).ok ? data : [];
    } catch (error) {
        console.error('Błąd odczytu localStorage:', error);
        return [];
    }
};

export const saveTickets = (tickets) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch (error) {
        console.error('Błąd zapisu do localStorage:', error);
    }
};
