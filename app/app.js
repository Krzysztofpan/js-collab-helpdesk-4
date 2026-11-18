
const form = document.querySelector('#form');
const box = document.querySelector('.box');
const filter = document.querySelector('#filter');
const counter = document.querySelector('#counter');

let tickets = [];
let nextId = 1;

// 1. CREATE TICKET
const addTicket = (title, priority) => {
    title = title.trim();

    if (tickets.length >= 1000) {
        alert('Maximum number of tickets reached');
        return;
    }

    if (title.length < 3 || title.length > 80) {
        alert('Title must be between 3 and 80 characters');
        return;
    }

    const newTicket = {
        id: nextId++,
        title,
        priority,
        status: 'new'
    };

    tickets.push(newTicket);
};

// 2. CHANGE TICKET STATUS
const changeStatus = (id, newStatus) => {
    const ticket = tickets.find(ticket => ticket.id === id);

    if (!ticket) return;

    ticket.status = newStatus;

    renderTickets();
};

// 3. FILTER TICKETS
const getFilteredTickets = () => {
    const filterValue = filter.value;

    if (filterValue === 'all') {
        return tickets;
    }

    return tickets.filter(ticket => ticket.status === filterValue);
};

// 4. RENDER TICKETS
const renderTickets = () => {
    const filteredTickets = getFilteredTickets();

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

// 5. HANDLE FORM SUBMISSION
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = e.target.title.value;
    const priority = e.target.priority.value;

    const previousLength = tickets.length;

    addTicket(title, priority);

    // Only clear the form if a ticket was successfully added
    if (tickets.length > previousLength) {
        form.reset();
        filter.value = 'all';
    }

    renderTickets();
});

// 6. HANDLE STATUS CHANGES
// Event delegation: one listener handles all ticket selects.
box.addEventListener('change', (e) => {
    if (!e.target.matches('.status-select')) return;

    const id = Number(e.target.dataset.id);
    const newStatus = e.target.value;

    changeStatus(id, newStatus);
});

// 7. HANDLE FILTER CHANGES
filter.addEventListener('change', renderTickets);
