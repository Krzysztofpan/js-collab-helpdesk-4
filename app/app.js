import { handleAddTicket, handleChangeStatus, renderTickets } from "./modules/handleListiners.js";

const form = document.querySelector('#form');
const box = document.querySelector('.box');
const filter = document.querySelector('#filter');

form.addEventListener('submit', handleAddTicket);
box.addEventListener('change', handleChangeStatus);
filter.addEventListener('change', renderTickets);
