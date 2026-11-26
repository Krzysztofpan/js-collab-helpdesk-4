import { createTicket, getFilteredTickets, loadTickets, saveTickets, updateTicket } from "./ticketsActions.js"
import { MAX_TICKETS, priorityOptions, statusOptions } from "./constants.js"
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
let draggedCard = null
let dropTarget = null

function updateTicketPriority(id, priority) {
  if (isImporting || !priorityOptions.includes(priority)) return
  if (!updateTicket(tickets, id, { priority })) return

  saveTickets(tickets)
  renderTickets()
  return true
}

export const handleChangeTicket = (e) => {
  const control = e.target
  const card = control.closest(".quest")
  if (isImporting || !card) return

  const { id } = card.dataset
  const { value } = control
  if (control.matches(".status-select") && statusOptions.includes(value)) {
    if (updateTicket(tickets, id, { status: value })) saveTickets(tickets)
  }

  if (control.matches(".priority-select")) {
    const hadFocus = control === document.activeElement
    if (!updateTicketPriority(id, value) || !hadFocus) return

    const updatedCard = Array.from(board.querySelectorAll(".quest")).find((card) => card.dataset.id === id)
    const nextControl = updatedCard?.querySelector(".priority-select") ?? filter
    nextControl.focus()
  }
}

function setDropTarget(column) {
  if (dropTarget === column) return
  dropTarget?.classList.remove("is-drop-target")
  dropTarget = column
  dropTarget?.classList.add("is-drop-target")
}

export function handleDragEnd() {
  setDropTarget(null)
  draggedCard?.classList.remove("is-dragging")
  draggedCard = null
}

export function handleDragStart(e) {
  const card = e.target.closest(".quest")
  if (!card?.draggable || !e.dataTransfer) return

  handleDragEnd()
  draggedCard = card
  card.classList.add("is-dragging")
  e.dataTransfer.setData("application/x-helpdesk-ticket", card.dataset.id)
  e.dataTransfer.effectAllowed = "move"
}

function getDropColumn(target) {
  if (!draggedCard) return null

  const column = target.closest(".board-column")
  return column && column !== draggedCard.closest(".board-column") ? column : null
}

export function handleDragOver(e) {
  const column = getDropColumn(e.target)
  setDropTarget(column)
  if (!column) return

  e.preventDefault()
  e.dataTransfer.dropEffect = "move"
}

export function handleDragLeave(e) {
  if (dropTarget?.contains(e.target) && !dropTarget.contains(e.relatedTarget)) setDropTarget(null)
}

export function handleDrop(e) {
  const column = getDropColumn(e.target)
  if (!column) return

  e.preventDefault()
  updateTicketPriority(draggedCard.dataset.id, column.dataset.priority)
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
  handleDragEnd()
  const filterValue = filter.value
  const filteredTickets = getFilteredTickets(tickets, filterValue)
  const cardsByPriority = new Map(priorityOptions.map((priority) => [priority, document.createDocumentFragment()]))

  for (const ticket of filteredTickets) {
    const card = document.createElement("article")
    card.className = "quest"
    card.dataset.id = ticket.id
    card.draggable = !isImporting && filterValue === "all"

    const title = document.createElement("h3")
    title.className = "quest-title"
    title.textContent = ticket.title

    const priority = document.createElement("select")
    priority.className = "priority-select"
    priority.dataset.priority = ticket.priority
    priority.append(...Array.from(form.elements.priority.options, (option) => new Option(option.text, option.value)))
    priority.setAttribute("aria-label", `Priorytet zgłoszenia: ${ticket.title}`)
    priority.value = ticket.priority
    priority.disabled = isImporting

    const status = document.createElement("select")
    status.className = "status-select"
    status.append(...statusOptions.map((value) => new Option(value, value)))
    status.setAttribute("aria-label", `Status zgłoszenia: ${ticket.title}`)
    status.value = ticket.status
    status.disabled = isImporting

    card.append(title, priority, status)
    cardsByPriority.get(ticket.priority).append(card)
  }

  for (const column of columns) {
    const priority = column.dataset.priority
    const cards = cardsByPriority.get(priority)
    column.hidden = filterValue !== "all" && filterValue !== priority
    column.querySelector(".board-empty").hidden = cards.hasChildNodes()
    column.querySelector(".board-cards").replaceChildren(cards)
  }

  counter.textContent = `${filteredTickets.length}/${tickets.length}`
}

function setImporting(importing) {
  if (importing) handleDragEnd()
  isImporting = importing
  inputFile.disabled = importing
  urlImportButton.disabled = importing
  for (const control of form.elements) control.disabled = importing
  for (const control of board.querySelectorAll(".priority-select, .status-select")) control.disabled = importing
  for (const card of board.querySelectorAll(".quest")) card.draggable = !importing && filter.value === "all"
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
