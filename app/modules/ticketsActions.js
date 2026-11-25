import { STORAGE_KEY } from "./constants.js"
import { validateTickets } from "./helpers.js"

export const loadTickets = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const data = JSON.parse(raw)
    return validateTickets(data).ok ? data : []
  } catch (error) {
    console.error("Błąd odczytu localStorage:", error)
    return []
  }
}

export const saveTickets = (tickets) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets))
  } catch (error) {
    console.error("Błąd zapisu do localStorage:", error)
  }
}

export const getFilteredTickets = (tickets) => {
  const filterValue = filter.value

  if (filterValue === "all") {
    return tickets
  }

  return tickets.filter((ticket) => ticket.status === filterValue)
}

export const createTicket = (title, priority) => {
  title = title.trim()

  if (title.length < 3 || title.length > 80) {
    alert("Title must be between 3 and 80 characters")
    return
  }

  const id = String(Math.random()).slice(2)

  const newTicket = {
    id,
    title,
    priority,
    status: "new",
  }

  return newTicket
}

export const changeTicketStatus = (tickets, id, newStatus) => {
  const ticket = tickets.find((ticket) => String(ticket.id) === id)

  if (!ticket) return

  ticket.status = newStatus

  return ticket
}
