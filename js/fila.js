// js/fila.js

// Espera a que el DOM esté completamente cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {
  // Obtención de referencias a elementos del DOM.
  const addRowBtn = document.getElementById('addRowBtn');
  const filaModal = document.getElementById('filaModal');
  const closeBtn = filaModal.querySelector('.close-button');
  const saveFilaBtn = document.getElementById('saveFilaBtn');

  // Función para abrir el modal de añadir fila. Renombrada para evitar conflictos.
  function openFilaModal() {
    filaModal.classList.add('is-open');
    buildFilaForm();
  }

  // Función para cerrar el modal de añadir fila. Renombrada para evitar conflictos.
  function closeFilaModal() {
    filaModal.classList.remove('is-open');
  }

  // Función para construir dinámicamente el formulario de añadir fila
  // basándose en los encabezados de la tabla existente.
  function buildFilaForm() {
    const container = document.getElementById('filaFormInputs');
    container.innerHTML = '';
    // Obtiene los nombres de las columnas de la tabla, excluyendo la última (asumida como 'Acciones').
    const keys = Array.from(document.querySelectorAll('#segurosTable thead th'))
      .slice(0, -1)
      .map(th => th.textContent.trim());

    // Crea un input para cada columna.
    keys.forEach(key => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('column-input-item');

      const label = document.createElement('label');
      label.textContent = key;

      const input = document.createElement('input');
      input.type = 'text';
      input.name = key;
      input.placeholder = key;

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      container.appendChild(wrapper);
    });
  }

  // Asigna event listeners a los botones. El '?' asegura que no haya errores si el elemento no existe.
  addRowBtn?.addEventListener('click', openFilaModal); // Usa la función renombrada.
  closeBtn?.addEventListener('click', closeFilaModal); // Usa la función renombrada.
  saveFilaBtn?.addEventListener('click', () => {
    const inputs = document.querySelectorAll('#filaFormInputs input');
    const keys = Array.from(inputs).map(input => input.name);
    const nuevo = {};

    // Valida que todos los campos estén llenos y construye el objeto 'nuevo'.
    for (let input of inputs) {
      const val = input.value.trim();
      if (!val) return alert('Todos los campos son obligatorios.');
      nuevo[input.name] = val;
    }

    // Se asume que 'seguros', 'saveStorage' y 'renderTable' están definidos globalmente o importados.
    const pk = keys[0]; // La primera columna se usa como clave primaria para validación.
    // Verifica si ya existe un seguro con el mismo valor en la clave primaria (ignorando mayúsculas/minúsculas).
    if (typeof seguros !== 'undefined' && seguros.some(s => String(s[pk]).toLowerCase() === nuevo[pk].toLowerCase())) {
      return alert(`Ya existe un seguro con ese valor en "${pk}".`);
    }

    // Si 'seguros' está definido, añade el nuevo seguro al array.
    if (typeof seguros !== 'undefined') {
        seguros.push(nuevo);
    }
    // Si 'saveStorage' está definido, guarda los datos.
    if (typeof saveStorage !== 'undefined') {
        saveStorage();
    }
    // Si 'renderTable' está definido, actualiza la tabla.
    if (typeof renderTable !== 'undefined') {
        renderTable();
    }
    // Cierra el modal después de guardar.
    closeFilaModal(); // Usa la función renombrada.
  });
});