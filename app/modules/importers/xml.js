import { ticketFields } from '../constants.js';

function hasUnexpectedText(element) {
    return Array.from(element.childNodes).some(node =>
        (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE) &&
        node.textContent.trim() !== ''
    );
}

export function parseXml(text) {
    const xml = new DOMParser().parseFromString(text, 'application/xml');
    const root = xml.documentElement;
    if (xml.doctype || xml.querySelector('parsererror') || root?.tagName !== 'tickets' ||
        hasUnexpectedText(root)) {
        throw new Error('XML wymaga poprawnego elementu głównego <tickets>.');
    }

    return Array.from(root.children, ticket => {
        const fields = Array.from(ticket.children);
        if (ticket.tagName !== 'ticket' || hasUnexpectedText(ticket) || fields.length !== ticketFields.length ||
            !ticketFields.every(name => fields.some(field => field.tagName === name)) ||
            fields.some(field => field.children.length > 0)) {
            throw new Error('Każdy element <ticket> wymaga pól id, title, priority i status.');
        }

        return Object.fromEntries(fields.map(field => [field.tagName, field.textContent.trim()]));
    });
}
