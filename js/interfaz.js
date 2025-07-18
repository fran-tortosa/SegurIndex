// Script que se encarga de la interfaz
// Funciones
const tableBody = document.querySelector('#segurosTable tbody');
const searchInput = document.getElementById('searchInput');
const addForm = document.getElementById('addForm');
const inputNombre = document.getElementById('inputNombre');
const inputOficina = document.getElementById('inputOficina');
const inputTipo = document.getElementById('inputTipo');
const contadorFilas = document.getElementById('contadorFilas');

// Tabla y filtros
function renderTable() {
  const filtro = searchInput.value.trim().toLowerCase();
  tableBody.innerHTML = '';
  let contador = 0;
  seguros.forEach((s, index) => {
      if (filtro && !s.nombre.toLowerCase().includes(filtro)) return;

      const row = document.createElement('tr');

      // Crear y añadir la celda del nombre
      const tdNombre = document.createElement('td');
      tdNombre.textContent = s.nombre; // Asigna como texto plano
      row.appendChild(tdNombre);

      // Crear y añadir la celda de la oficina
      const tdOficina = document.createElement('td');
      tdOficina.textContent = s.oficina; // Asigna como texto plano
      row.appendChild(tdOficina);

      // Crear y añadir la celda del tipo
      const tdTipo = document.createElement('td');
      tdTipo.textContent = s.tipo; // Asigna como texto plano
      row.appendChild(tdTipo);

      // Crear y añadir la celda con el botón de eliminar
      const tdAcciones = document.createElement('td');
      const deleteButton = document.createElement('button');
      deleteButton.className = 'button delete';
      deleteButton.dataset.index = index;
      deleteButton.textContent = 'Eliminar';
      tdAcciones.appendChild(deleteButton);
      row.appendChild(tdAcciones);

      tableBody.appendChild(row);
      contador++;
  });
  contadorFilas.textContent = `Número de filas/seguros: ${contador}`;
}

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

tableBody.addEventListener('click', e => {
  if (e.target.classList.contains('delete')) {
    const idx = parseInt(e.target.dataset.index, 10);
    if (confirm(`¿Eliminar seguro "${seguros[idx].nombre}"?`)) {
      seguros.splice(idx, 1); saveStorage(); renderTable();
    }
  }
});