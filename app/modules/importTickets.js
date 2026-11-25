import { detectFormat, validateTickets } from "./helpers.js"
import { parseCsv } from "./importers/csv.js"
import { parseXml } from "./importers/xml.js"

function createImporter(format) {
  switch (format) {
    case "json":
      return { parse: JSON.parse }
    case "csv":
      return { parse: parseCsv }
    case "xml":
      return { parse: parseXml }
    default:
      throw new Error("Obsługiwane formaty to JSON, CSV i XML.")
  }
}

function parseTickets(importer, text) {
  const tickets = importer.parse(text)
  const validation = validateTickets(tickets)
  if (!validation.ok) throw new Error(validation.errorMessage)
  return tickets
}

export async function importFromFile(file) {
  const importer = createImporter(detectFormat(file.name, file.type))
  return parseTickets(importer, await file.text())
}

export async function importFromUrl(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const path = new URL(response.url || url, document.baseURI).pathname
  const name = path.split("/").pop()
  const importer = createImporter(detectFormat(name, response.headers.get("content-type") ?? ""))
  return parseTickets(importer, await response.text())
}
