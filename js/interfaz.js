// js/interfaz.js

document.addEventListener('DOMContentLoaded', () => {
  // NOTA: 'window.seguros' es la única fuente de verdad, gestionada por xml.js.

  const searchInput = document.getElementById('searchInput');
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

  // Gestiona el filtrado de la tabla en base a la entrada del usuario
  function handleFilterInput() {
    const filtro = searchInput.value.trim().toLowerCase();
    
    // La decisión sobre qué mostrar se basa en el array global window.seguros
    const dataToDisplay = filtro ? window.seguros.filter(s => 
        Object.values(s).some(val => String(val).toLowerCase().includes(filtro))
    ) : window.seguros;

    // Llama a renderTable (de xml.js) para actualizar SOLO el cuerpo de la tabla visualmente.
    // La cabecera no se verá afectada gracias a las optimizaciones en xml.js.
    if (typeof window.renderTable === 'function') {
      window.renderTable(dataToDisplay);
    }
    
    // El contador total de filas no cambia con el filtro, siempre muestra el total.
    if (contadorFilas) contadorFilas.textContent = `Número de filas/seguros: ${window.seguros.length}`;
  }

  searchInput?.addEventListener('input', handleFilterInput);

  // --- Lógica para el Modal de "Añadir Fila" ---
  
  function openFilaModal() {
    if (filaModal) {
        filaModal.classList.add('is-open');
        buildFilaForm();
    }
  }

  function closeFilaModal() {
    if (filaModal) {
        filaModal.classList.remove('is-open');
    }
  }

  // Construye el formulario del modal dinámicamente basado en las cabeceras actuales
  function buildFilaForm() {
    const container = document.getElementById('filaFormInputs');
    container.innerHTML = '';
    const currentHeaders = getCurrentTableHeaders();

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
        input.required = true; // El primer campo es obligatorio
      }
      wrapper.append(label, input);
      container.appendChild(wrapper);
    });
  }

  // Guarda la nueva fila introducida en el modal
  saveFilaBtn?.addEventListener('click', () => {
    const inputs = document.querySelectorAll('#filaFormInputs input');
    const nuevoSeguro = {};
    const currentHeaders = getCurrentTableHeaders();
    
    // Rellena el objeto con los datos del formulario
    inputs.forEach(input => {
        nuevoSeguro[input.name] = input.value.trim();
    });

    const pkKey = currentHeaders[0]; // La primera columna es la clave primaria
    const pkValue = nuevoSeguro[pkKey];

    if (!pkValue) {
      return alert(`El campo "${pkKey}" es obligatorio.`);
    }

    if (window.seguros.some(s => s[pkKey] && String(s[pkKey]).toLowerCase() === pkValue.toLowerCase())) {
      return alert(`Ya existe un seguro con el valor "${pkValue}" en la columna "${pkKey}".`);
    }

    window.seguros.push(nuevoSeguro);

    if (typeof window.saveStorage === 'function') window.saveStorage();
    if (typeof window.renderTable === 'function') window.renderTable();
    
    closeFilaModal();
  });

  addRowBtn?.addEventListener('click', openFilaModal);
  closeBtn?.addEventListener('click', closeFilaModal);
});