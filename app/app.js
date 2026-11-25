import {
    handleAddTicket,
    handleChangeStatus,
    handleDragEnd,
    handleDragLeave,
    handleDragOver,
    handleDragStart,
    handleDrop,
    handleGetPath,
    handleSelectFile,
    renderTickets,
} from "./modules/handleListiners.js";


const form = document.querySelector('#form');
const board = document.querySelector('.board');
const filter = document.querySelector('#filter');
const inputFile = document.querySelector('#inputFile')
const triggerGetFileBtn = document.querySelector('#triggerGetFile')


inputFile.addEventListener('change', handleSelectFile)

triggerGetFileBtn.addEventListener('click',handleGetPath)


form.addEventListener('submit', handleAddTicket);
board.addEventListener('change', handleChangeStatus);
board.addEventListener('dragstart', handleDragStart);
board.addEventListener('dragover', handleDragOver);
board.addEventListener('dragleave', handleDragLeave);
board.addEventListener('drop', handleDrop);
board.addEventListener('dragend', handleDragEnd);
filter.addEventListener('change', renderTickets);

renderTickets();
