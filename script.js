let seguros = [];
const STORAGE_KEY = 'segurosDatos';
// Constantes y referencias
const tableBody = document.querySelector('#segurosTable tbody');
const searchInput = document.getElementById('searchInput');
const addForm = document.getElementById('addForm');
const saveXmlBtn = document.getElementById('saveXmlBtn');
const loadXmlInput = document.getElementById('loadXmlInput');
const clearFileBtn = document.getElementById('clearFileBtn');
const inputNombre = document.getElementById('inputNombre');
const inputOficina = document.getElementById('inputOficina');
const inputTipo = document.getElementById('inputTipo');

// Carga inicial del "cache"
document.addEventListener('DOMContentLoaded', () => {
  seguros = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  renderTable();
});

function saveStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seguros));
}

function renderTable() {
  const filtro = searchInput.value.trim().toLowerCase();
  tableBody.innerHTML = '';
  let contador = 0;
  seguros.forEach((s, index) => {
    if (!s.nombre.toLowerCase().includes(filtro)) return;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${s.nombre}</td>
      <td>${s.oficina}</td>
      <td>${s.tipo}</td>
      <td><button class="button delete" data-index="${index}">Eliminar</button></td>
    `;
    tableBody.appendChild(row);
    contador++;
  });
  contadorFilas.textContent = `Número de filas/seguros: ${contador}`;
}

// Añadir seguro
addForm.addEventListener('submit', e => {
  e.preventDefault();
  const nombre = inputNombre.value.trim();
  const oficina = inputOficina.value.trim();
  const tipo = inputTipo.value.trim();
  if (!nombre || !oficina || !tipo) return alert('Todos los campos son obligatorios.');
  if (seguros.some(s => s.nombre.toLowerCase() === nombre.toLowerCase())) return alert('Ya existe un seguro con ese nombre.');
  seguros.push({ nombre, oficina, tipo });
  saveStorage(); renderTable(); addForm.reset();
});

searchInput.addEventListener('input', renderTable);

// Eliminar seguro
tableBody.addEventListener('click', e => {
  if (e.target.classList.contains('delete')) {
    const idx = parseInt(e.target.dataset.index, 10);
    if (confirm(`¿Eliminar seguro "${seguros[idx].nombre}"?`)) {
      seguros.splice(idx, 1); saveStorage(); renderTable();
    }
  }
});

function generateXML() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<seguros>\n';
  seguros.forEach(s => {
    xml += '  <seguro>\n';
    xml += `    <nombre>${s.nombre}</nombre>\n`;
    xml += `    <oficina>${s.oficina}</oficina>\n`;
    xml += `    <tipo>${s.tipo}</tipo>\n`;
    xml += '  </seguro>\n';
  });
  xml += '</seguros>';
  return xml;
}

// Descargar archivo XML
saveXmlBtn.addEventListener('click', () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const total = seguros.length;
  const filename = `seguros-${yyyy}${mm}${dd}-${hh}${min}${ss}-filas-${total}.xml`;

  const blob = new Blob([generateXML()], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Cargar XML
loadXmlInput.addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader(); reader.onload = () => {
    const xml = new DOMParser().parseFromString(reader.result, 'application/xml');
    const items = Array.from(xml.getElementsByTagName('seguro'));
    seguros = items.map(node => ({
      nombre: node.getElementsByTagName('nombre')[0].textContent,
      oficina: node.getElementsByTagName('oficina')[0].textContent,
      tipo: node.getElementsByTagName('tipo')[0].textContent
    }));
    saveStorage(); renderTable();
  };
  reader.readAsText(file);
});

// Limpiar archivo cargado
clearFileBtn.addEventListener('click', () => {
  loadXmlInput.value = '';
});