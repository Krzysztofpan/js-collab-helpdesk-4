import { changeTicketStatus, createTicket, getFilteredTickets, loadTickets, saveTickets } from "./ticketsActions.js"
import { MAX_TICKETS, statusOptions } from "./constants.js"
import { importFromFile, importFromUrl } from "./importTickets.js"

let tickets = loadTickets()

const form = document.querySelector("#form")
const board = document.querySelector(".board")
const columns = board.querySelectorAll(".board-column")
const filter = document.querySelector("#filter")
const counter = document.querySelector("#counter")
const importError = document.querySelector("#importError")
const inputFile = document.querySelector("#inputFile")
const urlImportButton = document.querySelector("#triggerGetFile")
let isImporting = false

export const handleChangeStatus = (e) => {
  if (isImporting || !e.target.matches(".status-select")) return

  const id = e.target.dataset.id
  const newStatus = e.target.value

  const changedTicket = changeTicketStatus(tickets, id, newStatus)

  if (!changedTicket) return

  tickets = tickets.map((ticket) => (ticket.id === changedTicket.id ? changedTicket : ticket))

  saveTickets(tickets)
  renderTickets()
}

export const handleAddTicket = (e) => {
  e.preventDefault()
  if (isImporting) return

  const title = e.target.title.value
  const priority = e.target.priority.value

  const previousLength = tickets.length

  if (tickets.length >= MAX_TICKETS) {
    alert("Maximum number of tickets reached")
    return
  }

  const newTicket = createTicket(title, priority)

  if (!newTicket) return

  tickets.push(newTicket)

  if (tickets.length > previousLength) {
    form.reset()
    filter.value = "all"
  }

  saveTickets(tickets)
  renderTickets()
}

export const renderTickets = () => {
  const filterValue = filter.value
  const filteredTickets = getFilteredTickets(tickets, filterValue)
  const cardsByStatus = new Map(statusOptions.map((status) => [status, document.createDocumentFragment()]))

  for (const ticket of filteredTickets) {
    const card = document.createElement("article")
    card.className = "quest"

    const title = document.createElement("h3")
    title.className = "quest-title"
    title.textContent = ticket.title

    const priority = document.createElement("p")
    priority.className = "quest-priority"
    priority.dataset.priority = ticket.priority
    priority.textContent = ticket.priority

    const status = document.createElement("select")
    status.className = "status-select"
    status.append(...statusOptions.map((value) => new Option(value, value)))
    status.setAttribute("aria-label", `Status zgłoszenia: ${ticket.title}`)
    status.dataset.id = ticket.id
    status.value = ticket.status
    status.disabled = isImporting

    card.append(title, priority, status)
    cardsByStatus.get(ticket.status).append(card)
  }

  for (const column of columns) {
    const status = column.dataset.status
    const cards = cardsByStatus.get(status)
    column.hidden = filterValue !== "all" && filterValue !== status
    column.querySelector(".board-empty").hidden = cards.hasChildNodes()
    column.querySelector(".board-cards").replaceChildren(cards)
  }

  counter.textContent = `${filteredTickets.length}/${tickets.length}`
}

function setImporting(importing) {
  isImporting = importing
  inputFile.disabled = importing
  urlImportButton.disabled = importing
  for (const control of form.elements) control.disabled = importing
  for (const status of board.querySelectorAll(".status-select")) status.disabled = importing
}

async function replaceTickets(load) {
  if (!confirm("Zastąpić bieżącą listę zgłoszeń danymi z importu?")) return

  importError.textContent = ""
  setImporting(true)
  try {
    tickets = await load()
    saveTickets(tickets)
    renderTickets()
  } catch (error) {
    importError.textContent = `Błąd importu: ${error.message}`
  } finally {
    setImporting(false)
  }
}

export const handleSelectFile = (e) => {
  const input = e.currentTarget
  const file = input.files[0]
  input.value = ""
  if (file && !isImporting) return replaceTickets(() => importFromFile(file))
}

export const handleGetPath = () => {
  if (isImporting) return

  const path = prompt("Wpisz ścieżkę do pliku JSON, CSV lub XML")?.trim()
  if (path) return replaceTickets(() => importFromUrl(path))
}
