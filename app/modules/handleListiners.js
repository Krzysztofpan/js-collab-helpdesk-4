import { changeTicketStatus, createTicket, getFilteredTickets } from "./actions.js";
let tickets = [];

const form = document.querySelector('#form');
const box = document.querySelector('.box');
const filter = document.querySelector('#filter');


export const handleChangeStatus = (e) => {
    if (!e.target.matches('.status-select')) return;

    const id = e.target.dataset.id
    const newStatus = e.target.value;

    const changedTicket = changeTicketStatus(tickets, id, newStatus);

    if(!changedTicket) return;

    tickets = tickets.map((ticket) => ticket.id === changedTicket.id ? changedTicket : ticket)
    
    renderTickets();
}


export const handleAddTicket = (e) => {
    e.preventDefault();

    const title = e.target.title.value;
    const priority = e.target.priority.value;

    const previousLength = tickets.length;

    if (tickets.length >= 1000) {
        alert('Maximum number of tickets reached');
        return;
    }

    const newTicker = createTicket(title, priority);

    tickets.push(newTicker)

    if (tickets.length > previousLength) {
        form.reset();
        filter.value = 'all';
    }

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

                    <option value="doing"
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