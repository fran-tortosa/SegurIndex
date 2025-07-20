// js/interfaz.js

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'segurosDatos';
  // NOTA: 'window.seguros' es ahora la única fuente de verdad, gestionada por xml.js.

  const tableBody = document.querySelector('#segurosTable tbody');
  const searchInput = document.getElementById('searchInput');
  const addForm = document.getElementById('addForm');
  const inputNombre = document.getElementById('inputNombre');
  const inputOficina = document.getElementById('inputOficina');
  const inputTipo = document.getElementById('inputTipo');
  const contadorFilas = document.getElementById('contadorFilas');

  const addRowBtn = document.getElementById('addRowBtn');
  const filaModal = document.getElementById('filaModal');
  const closeBtn = filaModal?.querySelector('.close-button');
  const saveFilaBtn = document.getElementById('saveFilaBtn');

  // Asegurarse de que window.seguros esté disponible (inicializado por xml.js).
  if (!Array.isArray(window.seguros)) {
    window.seguros = [];
  }

  // Función auxiliar para obtener los encabezados actuales de la tabla (desde el THEAD)
  function getCurrentTableHeaders() {
    return Array.from(document.querySelectorAll('#segurosTable thead th'))
      .filter(th => th.textContent.trim() !== 'Acciones')
      .map(th => th.textContent.trim());
  }

  function handleAddFormSubmit(e) {
    e.preventDefault();
    const nombre = inputNombre.value.trim();
    const oficina = inputOficina.value.trim();
    const tipo = inputTipo.value.trim();

    if (!nombre || !oficina || !tipo) return alert('Todos los campos son obligatorios.');

    const currentHeaders = getCurrentTableHeaders();
    const nuevoSeguro = {};

    currentHeaders.forEach(header => {
      if (header === 'Nombre') nuevoSeguro[header] = nombre;
      else if (header === 'Oficina') nuevoSeguro[header] = oficina;
      else if (header === 'Tipo') nuevoSeguro[header] = tipo;
      else nuevoSeguro[header] = '';
    });

    if (nuevoSeguro.Nombre && window.seguros.some(s => s.Nombre && String(s.Nombre).toLowerCase() === nuevoSeguro.Nombre.toLowerCase())) {
      return alert('Ya existe un seguro con ese nombre.');
    }

    window.seguros.push(nuevoSeguro);

    if (typeof window.saveStorage === 'function') {
      window.saveStorage();
    }
    if (typeof window.renderTable === 'function') {
      window.renderTable();
    }
    addForm.reset();
  }

  function handleFilterInput() {
    const filtro = searchInput.value.trim().toLowerCase();
    let dataToDisplay = [];

    if (filtro) {
      dataToDisplay = window.seguros.filter(s => {
        for (const key in s) {
          if (s.hasOwnProperty(key) && String(s[key]).toLowerCase().includes(filtro)) {
            return true;
          }
        }
        return false;
      });
    } else {
      dataToDisplay = window.seguros;
    }

    if (typeof window.renderTable === 'function') {
      window.renderTable(dataToDisplay);
    } else {
      console.warn("window.renderTable no está disponible. Asegúrate de que xml.js esté cargado correctamente.");
    }

    if (contadorFilas) contadorFilas.textContent = `Número de filas/seguros: ${dataToDisplay.length}`;
  }

  addForm?.addEventListener('submit', handleAddFormSubmit);
  searchInput?.addEventListener('input', handleFilterInput);

  // Modal para añadir fila personalizada
  function openFilaModal() {
    filaModal?.classList.add('is-open');
    buildFilaForm();
  }

  function closeFilaModal() {
    filaModal?.classList.remove('is-open');
    const inputs = document.querySelectorAll('#filaFormInputs input');
    inputs.forEach(input => input.value = '');
  }

  function buildFilaForm() {
    const container = document.getElementById('filaFormInputs');
    container.innerHTML = '';
    const currentHeaders = getCurrentTableHeaders();

    if (currentHeaders.length === 0) {
      alert("No se pudo determinar la estructura de la tabla para añadir una fila personalizada. Asegúrese de que la tabla tenga encabezados o datos existentes.");
      closeFilaModal();
      return;
    }

    currentHeaders.forEach(key => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('column-input-item');

      const label = document.createElement('label');
      label.textContent = key;

      const input = document.createElement('input');
      input.type = 'text';
      input.name = key;
      input.placeholder = `Introducir ${key}`;

      if (key === currentHeaders[0]) {
        input.required = true;
      }

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      container.appendChild(wrapper);
    });
  }

  saveFilaBtn?.addEventListener('click', () => {
    const inputs = document.querySelectorAll('#filaFormInputs input');
    const nuevo = {};
    let allRequiredFieldsFilled = true;

    const currentHeaders = getCurrentTableHeaders();

    // Inicializar el objeto 'nuevo' con todas las columnas actuales, vacías por defecto
    currentHeaders.forEach(header => {
      nuevo[header] = '';
    });

    for (let input of inputs) {
      const val = input.value.trim();
      if (input.required && !val) {
        allRequiredFieldsFilled = false;
        break;
      }
      nuevo[input.name] = val;
    }

    if (!allRequiredFieldsFilled) {
      return alert('Todos los campos obligatorios deben ser rellenados.');
    }

    const pk = currentHeaders[0];
    const pkValue = nuevo[pk];

    if (pkValue && window.seguros.some(s => s[pk] && String(s[pk]).toLowerCase() === pkValue.toLowerCase())) {
      return alert(`Ya existe un seguro con ese valor en "${pk}".`);
    }

    window.seguros.push(nuevo);

    if (typeof window.saveStorage === 'function') {
      window.saveStorage();
    }
    if (typeof window.renderTable === 'function') {
      window.renderTable();
    }
    closeFilaModal();
  });

  addRowBtn?.addEventListener('click', openFilaModal);
  closeBtn?.addEventListener('click', closeFilaModal);
});