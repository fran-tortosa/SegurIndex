// Script que se encarga de los datos
// Datos
let seguros = [];
const STORAGE_KEY = 'segurosDatos';

function saveStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seguros));
}

document.addEventListener('DOMContentLoaded', () => {
  seguros = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  renderTable();
});