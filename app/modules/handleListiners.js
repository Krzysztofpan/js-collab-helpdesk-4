import { changeTicketStatus, createTicket, getFilteredTickets, loadTickets, saveTickets } from "./ticketsActions.js"
import { MAX_TICKETS, statusOptions } from "./constants.js"
import { importFromFile, importFromUrl } from "./importTickets.js"

let tickets = loadTickets()

const form = document.querySelector("#form")
const box = document.querySelector(".box")
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
  const filteredTickets = getFilteredTickets(tickets)

  if (filteredTickets.length === 0) {
    box.textContent = "No matching elements"
  } else {
    const rows = document.createDocumentFragment()
    for (const ticket of filteredTickets) {
      const row = document.createElement("div")
      row.className = "quest"

      const title = document.createElement("p")
      title.className = "quest-title"
      title.textContent = ticket.title

      const priority = document.createElement("p")
      priority.className = "quest-priority"
      priority.textContent = ticket.priority

      const status = document.createElement("select")
      status.className = "status-select"
      status.append(...statusOptions.map((value) => new Option(value, value)))
      status.dataset.id = ticket.id
      status.value = ticket.status
      status.disabled = isImporting

      row.append(title, priority, status)
      rows.append(row)
    }
    box.replaceChildren(rows)
  }

  counter.textContent = `${filteredTickets.length}/${tickets.length}`
}

function setImporting(importing) {
  isImporting = importing
  inputFile.disabled = importing
  urlImportButton.disabled = importing
  for (const control of form.elements) control.disabled = importing
  for (const status of box.querySelectorAll(".status-select")) status.disabled = importing
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
