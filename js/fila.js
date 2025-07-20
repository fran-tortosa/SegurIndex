// js/fila.js

// Espera a que el DOM esté completamente cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {
  const addRowBtn = document.getElementById('addRowBtn');
  const filaModal = document.getElementById('filaModal');
  const closeBtn = filaModal.querySelector('.close-button');
  const saveFilaBtn = document.getElementById('saveFilaBtn');

  function openFilaModal() {
    filaModal.classList.add('is-open');
    buildFilaForm();
  }

  function closeFilaModal() {
    filaModal.classList.remove('is-open');
  }

  function buildFilaForm() {
    const container = document.getElementById('filaFormInputs');
    container.innerHTML = '';
    const keys = Array.from(document.querySelectorAll('#segurosTable thead th'))
      .slice(0, -1)
      .map(th => th.textContent.trim());

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

  saveFilaBtn?.addEventListener('click', () => {
    const inputs = document.querySelectorAll('#filaFormInputs input');
    const nuevo = {};
    let allFieldsFilled = true;

    for (let input of inputs) {
      const val = input.value.trim();
      if (!val) {
        allFieldsFilled = false;
        break;
      }
      nuevo[input.name] = val;
    }

    if (!allFieldsFilled) {
      return alert('Todos los campos son obligatorios.');
    }

    const pk = Object.keys(nuevo)[0];
    const pkValue = nuevo[pk];

    if (seguros.some(s => String(s[pk]).toLowerCase() === pkValue.toLowerCase())) {
      return alert(`Ya existe un seguro con ese valor en "${pk}".`);
    }

    seguros.push(nuevo);
    saveStorage?.();
    renderTable?.();
    closeFilaModal();
  });

  addRowBtn?.addEventListener('click', openFilaModal);
  closeBtn?.addEventListener('click', closeFilaModal);
});