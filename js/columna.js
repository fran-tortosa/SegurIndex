// js/columna.js

// Espera a que el DOM esté completamente cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {
    const editColumnsBtn = document.getElementById('editColumnsBtn');
    const columnModal = document.getElementById('columnModal');
    const closeButton = document.querySelector('.modal .close-button');
    const columnNameInputsContainer = document.getElementById('columnNameInputs');
    const saveColumnChangesBtn = document.getElementById('saveColumnChanges');
    const segurosTable = document.getElementById('segurosTable');

    // Estado interno para la gestión de columnas en el modal
    let currentColumnNamesSnapshot = [];
    let modalColumnDataState = [];

    let addColumnBtn;
    let removeColumnBtn;

    columnModal.classList.remove('is-open');

    // Función que abre el modal de edición de columnas y prepara los controles
    const openModal = () => {
        columnModal.classList.add('is-open');
        const existingActions = columnModal.querySelector('.column-actions');
        if (existingActions) existingActions.remove();

        // Crea contenedor y botones para añadir/quitar columnas dentro del modal
        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('column-actions');

        addColumnBtn = document.createElement('button');
        addColumnBtn.id = 'addColumnBtn';
        addColumnBtn.classList.add('button');
        addColumnBtn.textContent = 'Añadir columna';
        addColumnBtn.addEventListener('click', handleAddColumn);
        actionsContainer.appendChild(addColumnBtn);

        removeColumnBtn = document.createElement('button');
        removeColumnBtn.id = 'removeColumnBtn';
        removeColumnBtn.classList.add('button');
        removeColumnBtn.textContent = 'Quitar última columna';
        removeColumnBtn.addEventListener('click', handleRemoveColumn);
        actionsContainer.appendChild(removeColumnBtn);

        columnModal.querySelector('.modal-content').insertBefore(actionsContainer, columnNameInputsContainer);

        // Obtiene los nombres actuales de las columnas (sin incluir "Acciones")
        const headers = segurosTable.querySelectorAll('thead th');
        currentColumnNamesSnapshot = Array.from(headers)
            .slice(0, headers.length - 1)
            .map(th => th.textContent.trim());

        modalColumnDataState = [...currentColumnNamesSnapshot];

        // Genera dinámicamente los inputs para editar el nombre de cada columna
        populateColumnInputs();
        updateModalButtonsState();
    };

    const closeModal = () => columnModal.classList.remove('is-open');
    editColumnsBtn.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);

    const populateColumnInputs = () => {
        columnNameInputsContainer.innerHTML = '';
        modalColumnDataState.forEach((colName, index) => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('column-input-item');

            const label = document.createElement('label');
            const id = `edit-col-${index}`;
            label.htmlFor = id;
            label.textContent = `Nombre de "${colName}" (Columna de datos):`;

            const input = document.createElement('input');
            input.type = 'text';
            input.id = id;
            input.value = colName;
            input.dataset.colIndex = index;
            input.addEventListener('input', e => modalColumnDataState[index] = e.target.value.trim());

            wrapper.append(label, input);
            columnNameInputsContainer.appendChild(wrapper);
        });

        // Añade campo fijo para la columna "Acciones", no editable
        const actionsWrapper = document.createElement('div');
        actionsWrapper.classList.add('column-input-item');

        const actionsLabel = document.createElement('label');
        actionsLabel.htmlFor = 'edit-col-actions';
        actionsLabel.textContent = 'Columna "Acciones" (inamovible):';

        const actionsInput = document.createElement('input');
        actionsInput.type = 'text';
        actionsInput.id = 'edit-col-actions';
        actionsInput.disabled = true;
        actionsInput.value = 'Acciones';

        actionsWrapper.append(actionsLabel, actionsInput);
        columnNameInputsContainer.appendChild(actionsWrapper);
    };

    // Añade una nueva columna editable al modal
    const handleAddColumn = () => { modalColumnDataState.push('Nombre de columna'); populateColumnInputs(); updateModalButtonsState(); };

    // Elimina la última columna editable del modal (si hay más de una)
    const handleRemoveColumn = () => {
        if (modalColumnDataState.length > 1) {
            modalColumnDataState.pop();
            populateColumnInputs();
            updateModalButtonsState();
        }
    };

    const updateModalButtonsState = () => {
        if (removeColumnBtn) removeColumnBtn.disabled = modalColumnDataState.length <= 1;
    };

    // Al guardar cambios en el modal, reconstruye la tabla si hay cambios y borra los datos
    saveColumnChangesBtn.addEventListener('click', () => {
        const newNames = Array.from(
            columnNameInputsContainer.querySelectorAll('input[type="text"]:not(:disabled)')
        ).map(i => i.value.trim());

        const structuralChange = newNames.length !== currentColumnNamesSnapshot.length;
        const nameChange = !structuralChange && newNames.some((name, i) => name !== currentColumnNamesSnapshot[i]);

        if (structuralChange || nameChange) {
            if (!confirm("Este cambio de nombres o estructura de la tabla realizará un borrado de los datos guardados. ¿Está de acuerdo?")) return;
            // Limpiar datos y persistir
            window.seguros = [];
            if (typeof window.saveStorage === 'function') window.saveStorage();
        }

        // Reconstruir cabecera
        const thead = segurosTable.querySelector('thead');
        thead.innerHTML = '';
        const tr = document.createElement('tr');
        modalColumnDataState.forEach(name => {
            const th = document.createElement('th');
            th.textContent = name;
            tr.appendChild(th);
        });
        const actionsTh = document.createElement('th');
        actionsTh.textContent = 'Acciones';
        tr.appendChild(actionsTh);
        thead.appendChild(tr);

        // Renderizar la tabla vacía con la nueva estructura
        if (typeof window.renderTable === 'function') window.renderTable();
        
        closeModal();
    });
});