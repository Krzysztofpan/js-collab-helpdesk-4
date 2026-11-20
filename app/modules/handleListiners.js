import { changeTicketStatus, createTicket, getFilteredTickets } from "./actions.js";
import { isValidTicket, jsonValidation } from "./helpers.js";
import { loadTickets, saveTickets } from "./localstorage.js";

let tickets = loadTickets();

const form = document.querySelector('#form');
const box = document.querySelector('.box');
const filter = document.querySelector('#filter');
let isLockedScreen = false

export const handleChangeStatus = (e) => {
    if (!e.target.matches('.status-select')) return;

    const id = e.target.dataset.id
    const newStatus = e.target.value;

    const changedTicket = changeTicketStatus(tickets, id, newStatus);

    if(!changedTicket) return;

    tickets = tickets.map((ticket) => ticket.id === changedTicket.id ? changedTicket : ticket)
    
    saveTickets(tickets);
    renderTickets();
}


export const handleAddTicket = (e) => {
    e.preventDefault();
    if(isLockedScreen) {
        return
    }

    const title = e.target.title.value;
    const priority = e.target.priority.value;

    const previousLength = tickets.length;

    if (tickets.length >= 1000) {
        alert('Maximum number of tickets reached');
        return;
    }

    const newTicket = createTicket(title, priority);

    if (!newTicket) return;

    tickets.push(newTicket)

    if (tickets.length > previousLength) {
        form.reset();
        filter.value = 'all';
    }

    saveTickets(tickets);
    renderTickets();
}

export const renderTickets = () => {
    const filteredTickets = getFilteredTickets(tickets);

    if (filteredTickets.length === 0) {
        box.innerHTML = 'No matching elements';
    } else {
        box.innerHTML = filteredTickets.map(ticket => `
            <div class="quest">
                <p class="quest-title">${ticket.title}</p>

                <p class="quest-priority">
                    ${ticket.priority}
                </p>

                <select
                    class="status-select"
                    data-id="${ticket.id}"
                >
                    <option value="new"
                        ${ticket.status === 'new' ? 'selected' : ''}>
                        new
                    </option>

                    <option  value="doing"
                        ${ticket.status === 'doing' ? 'selected' : ''}>
                        doing
                    </option>

                    <option value="done"
                        ${ticket.status === 'done' ? 'selected' : ''}>
                        done
                    </option>
                </select>
            </div>
        `).join('');
    }

    counter.textContent = `${filteredTickets.length}/${tickets.length}`;
};


export const handleSelectFile = async (e) => {
    const file = e.target.files[0]
    
    console.log(file);
    if (!file) return;
    
    isLockedScreen = true
    try {
        const text = await file.text();
        const data = JSON.parse(text);

        if(!Array.isArray(data)) {
            throw new Error('Expected Array')
        }

        if(!data.every(ticket => ticket.id &&  isValidTicket(ticket))) {
            throw new Error('Some ticket has invalid structure')
        }

        const validationResults = jsonValidation(data)

        if(!validationResults.ok) {
            throw new Error(validationResults.errorMessage)
        }

        tickets = data
        saveTickets(tickets);
    } catch (error) {
        console.error('Błąd parsowania JSON:', error);
    } finally {
      isLockedScreen = false
    }

    renderTickets();
}

export const handleGetPath = async () => {
    
    const path = prompt("Wpisz ścieżkę pliku")
    
    if(!path) return;

    isLockedScreen = true
    try {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        jsonValidation(data)

        const validationResults = jsonValidation(data)

        if(!validationResults.ok) {
            throw new Error(validationResults.errorMessage)
        }

        tickets = data
        saveTickets(tickets);
    } catch (error) {
        console.error('Błąd:', error);
    } finally {
      isLockedScreen = false
    }

     renderTickets();
}
