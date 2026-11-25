import { MAX_TICKETS, priorityOptions, statusOptions } from "./constants.js"

export function detectFormat(name, contentType = "") {
  const extension = name.split(".").pop().toLowerCase()
  if (name.includes(".") && ["json", "csv", "xml"].includes(extension)) return extension

  const mimeType = contentType.split(";", 1)[0].trim().toLowerCase()
  if (mimeType === "application/json" || mimeType.endsWith("+json")) return "json"
  if (mimeType === "text/csv" || mimeType === "application/csv") return "csv"
  if (["text/xml", "application/xml"].includes(mimeType) || mimeType.endsWith("+xml")) return "xml"
}

function isValidTicket(ticket) {
  if (!ticket || typeof ticket !== "object") return false

  const validId = (typeof ticket.id === "string" && ticket.id.trim() !== "") || Number.isFinite(ticket.id)
  return validId && typeof ticket.title === "string" && ticket.title.trim() !== "" && priorityOptions.includes(ticket.priority) && statusOptions.includes(ticket.status)
}

export function validateTickets(tickets) {
  if (!Array.isArray(tickets)) return { ok: false, errorMessage: "Oczekiwano listy zgłoszeń." }
  if (tickets.length > MAX_TICKETS) {
    return { ok: false, errorMessage: `Maksymalna liczba zgłoszeń to ${MAX_TICKETS}.` }
  }
  if (!tickets.every(isValidTicket)) {
    return { ok: false, errorMessage: "Co najmniej jedno zgłoszenie ma nieprawidłowe dane." }
  }

  const ids = new Set(tickets.map((ticket) => String(ticket.id)))
  if (ids.size !== tickets.length) {
    return { ok: false, errorMessage: "Identyfikatory zgłoszeń muszą być unikalne." }
  }

  return { ok: true }
}
