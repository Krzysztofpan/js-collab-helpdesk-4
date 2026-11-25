import { handleAddTicket, handleChangeStatus, handleGetPath, handleSelectFile, renderTickets } from "./modules/handleListiners.js";


const form = document.querySelector('#form');
const board = document.querySelector('.board');
const filter = document.querySelector('#filter');
const inputFile = document.querySelector('#inputFile')
const triggerGetFileBtn = document.querySelector('#triggerGetFile')


inputFile.addEventListener('change', handleSelectFile)

triggerGetFileBtn.addEventListener('click',handleGetPath)


form.addEventListener('submit', handleAddTicket);
board.addEventListener('change', handleChangeStatus);
filter.addEventListener('change', renderTickets);

renderTickets();
