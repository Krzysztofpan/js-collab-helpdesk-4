import { priorityOptions, statusOptions } from "./constants.js"



export const jsonValidation = (data) => {
    if(!Array.isArray(data)) {
        return {ok: false, errorMessage: 'Expected Array'}
    }

    if(!data.every(ticket => ticket.id &&  isValidTicket(ticket))) {
        return  {ok: false, errorMessage: 'Some ticket has invalid structure'}
    }

    return {ok: true}
}

export const isValidTicket = (ticket) => {
    if(!ticket['id'] && !ticket['title']) return false

    if(!ticket['priority'] && !priorityOptions.some(ticket.priority)) 
        return false

    if(!ticket['status'] && !statusOptions.some(ticket.status)) 
        return false

    return true
}