
export const createTicket = (title, priority) => {
    title = title.trim();
    
    if (title.length < 3 || title.length > 80) {
        alert('Title must be between 3 and 80 characters');
        return;
    }

    const id = String(Math.random()).slice(2)

    const newTicket = {
        id,
        title,
        priority,
        status: 'new'
    };

    return newTicket
};

export const changeTicketStatus = (tickets, id, newStatus) => {
    const ticket = tickets.find(ticket => String(ticket.id) === id);

    if (!ticket) return;

    ticket.status = newStatus;

    return ticket
};

export const getFilteredTickets = (tickets) => {
    const filterValue = filter.value;

    if (filterValue === 'all') {
        return tickets;
    }

    return tickets.filter(ticket => ticket.status === filterValue);
};
