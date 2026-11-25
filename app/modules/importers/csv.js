import { ticketFields } from '../constants.js';

function readRows(text, separator) {
    const rows = [];
    let row = [];
    let offset = 0;
    const csvField = separator === ';'
        ? /(?:"((?:[^"]|"")*)"|([^";\r\n]*))(?=$|[;\r\n])/y
        : /(?:"((?:[^"]|"")*)"|([^",\r\n]*))(?=$|[,\r\n])/y;

    while (offset <= text.length) {
        csvField.lastIndex = offset;
        const match = csvField.exec(text);
        if (!match) throw new Error('Nieprawidłowe pole CSV.');

        const [, quoted, unquoted] = match;
        row.push(quoted === undefined ? unquoted : quoted.replaceAll('""', '"'));
        offset = csvField.lastIndex;

        if (text[offset] === separator) {
            offset += 1;
            continue;
        }

        if (row.length > 1 || match[0] !== '') rows.push(row);
        row = [];
        offset += text.startsWith('\r\n', offset) ? 2 : 1;
    }

    return rows;
}

export function parseCsv(text) {
    const firstLine = text.split(/\r\n|\r|\n/, 1)[0];
    const separator = firstLine.includes(';') ? ';' : ',';
    const [header = [], ...rows] = readRows(text, separator);
    const columns = header.map(field => field.trim());

    if (columns.length !== ticketFields.length || !ticketFields.every(field => columns.includes(field))) {
        throw new Error('CSV wymaga kolumn id, title, priority i status.');
    }

    return rows.map(row => {
        if (row.length !== columns.length) throw new Error('Nieprawidłowa liczba pól w wierszu CSV.');

        return Object.fromEntries(columns.map((column, index) => [
            column, column === 'title' ? row[index] : row[index].trim(),
        ]));
    });
}
