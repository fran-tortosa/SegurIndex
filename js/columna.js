// js/columna.js

document.addEventListener('DOMContentLoaded', () => {
    const editColumnsBtn = document.getElementById('editColumnsBtn');
    const columnModal = document.getElementById('columnModal');
    const closeButton = document.querySelector('.modal .close-button');
    const columnNameInputsContainer = document.getElementById('columnNameInputs');
    const saveColumnChangesBtn = document.getElementById('saveColumnChanges');
    const segurosTable = document.getElementById('segurosTable');

    // Referencias a los inputs del formulario de añadir seguro
    const inputNombre = document.getElementById('inputNombre');
    const inputOficina = document.getElementById('inputOficina');
    const inputTipo = document.getElementById('inputTipo');

    // Estado interno para la gestión de columnas en el modal
    let currentColumnNamesSnapshot = []; // Almacena el estado de los nombres de las columnas de datos cuando se abre el modal
    let modalColumnDataState = []; // Almacena el estado actual de los nombres de las columnas de datos manipulados en el modal

    // Referencias a los botones de añadir/quitar columna (se crearán dinámicamente)
    let addColumnBtn;
    let removeColumnBtn;

    // Asegurar que al cargar la página esté oculto
    columnModal.classList.remove('is-open');

    const openModal = () => {
        columnModal.classList.add('is-open');

        // Eliminar botones existentes si se reabre el modal para evitar duplicados
        const existingColumnActions = columnModal.querySelector('.column-actions');
        if (existingColumnActions) {
            existingColumnActions.remove();
        }

        // Crear contenedor para los botones de acciones de columna
        const columnActionsContainer = document.createElement('div');
        columnActionsContainer.classList.add('column-actions');

        // Crear el botón "Añadir Columna"
        addColumnBtn = document.createElement('button');
        addColumnBtn.id = 'addColumnBtn';
        addColumnBtn.classList.add('button');
        addColumnBtn.textContent = 'Añadir columna';
        addColumnBtn.addEventListener('click', handleAddColumn);
        columnActionsContainer.appendChild(addColumnBtn);

        // Crear el botón "Quitar última columna"
        removeColumnBtn = document.createElement('button');
        removeColumnBtn.id = 'removeColumnBtn';
        removeColumnBtn.classList.add('button');
        removeColumnBtn.textContent = 'Quitar última columna';
        removeColumnBtn.addEventListener('click', handleRemoveColumn);
        columnActionsContainer.appendChild(removeColumnBtn);

        // Insertar los botones antes del contenedor de inputs de nombres de columna
        // Asumiendo que `columnNameInputsContainer` es el contenedor de los inputs
        columnModal.querySelector('.modal-content').insertBefore(columnActionsContainer, columnNameInputsContainer);


        // Capturar los nombres de las columnas de datos actuales (excluyendo 'Acciones')
        const headers = segurosTable.querySelectorAll('thead th');
        currentColumnNamesSnapshot = Array.from(headers)
            .slice(0, headers.length - 1) // Excluir la columna 'Acciones'
            .map(th => th.textContent.trim());

        // Inicializar el estado del modal con los nombres actuales
        modalColumnDataState = [...currentColumnNamesSnapshot];

        populateColumnInputs(); // Rellenar los inputs del modal
        updateModalButtonsState(); // Actualizar el estado de los botones de añadir/quitar
    };

    const closeModal = () => {
        columnModal.classList.remove('is-open');
    };

    editColumnsBtn.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);

    const populateColumnInputs = () => {
        columnNameInputsContainer.innerHTML = '';

        // Renderizar inputs para las columnas de datos basándose en modalColumnDataState
        modalColumnDataState.forEach((colName, index) => {
            const inputWrapper = document.createElement('div');
            inputWrapper.classList.add('column-input-item');

            const label = document.createElement('label');
            const uniqueId = `edit-col-${index}`;
            label.htmlFor = uniqueId;
            label.textContent = `Nombre de "${colName}" (Columna de datos):`;

            const input = document.createElement('input');
            input.type = 'text';
            input.id = uniqueId;
            input.value = colName;
            input.dataset.colIndex = index;
            input.addEventListener('input', (e) => {
                modalColumnDataState[index] = e.target.value.trim();
            });

            inputWrapper.append(label, input);
            columnNameInputsContainer.appendChild(inputWrapper);
        });

        // Renderizar el input de la columna fija "Acciones"
        const actionsInputWrapper = document.createElement('div');
        actionsInputWrapper.classList.add('column-input-item');

        const actionsLabel = document.createElement('label');
        const actionsUniqueId = `edit-col-actions`;
        actionsLabel.htmlFor = actionsUniqueId;
        actionsLabel.textContent = `Columna "Acciones" (inamovible):`;

        const actionsInput = document.createElement('input');
        actionsInput.type = 'text';
        actionsInput.id = actionsUniqueId;
        actionsInput.disabled = true; // La columna Acciones no es editable
        actionsInput.value = 'Acciones';

        actionsInputWrapper.append(actionsLabel, actionsInput);
        columnNameInputsContainer.appendChild(actionsInputWrapper);
    };

    const handleAddColumn = () => {
        // MODIFICACIÓN AQUÍ: Ahora el nuevo nombre predeterminado es "Nombre de columna"
        const newColName = `Nombre de columna`;
        modalColumnDataState.push(newColName);
        populateColumnInputs();
        updateModalButtonsState();
    };

    const handleRemoveColumn = () => {
        // Asegurar que al menos una columna de datos permanezca
        if (modalColumnDataState.length > 1) {
            modalColumnDataState.pop();
            populateColumnInputs();
            updateModalButtonsState();
        }
    };

    const updateModalButtonsState = () => {
        // Deshabilitar el botón de quitar si solo queda una columna de datos
        if (removeColumnBtn) { // Asegurarse de que el botón exista antes de intentar deshabilitarlo
            removeColumnBtn.disabled = modalColumnDataState.length <= 1;
        }
    };


    saveColumnChangesBtn.addEventListener('click', () => {
        const newNamesFromInputs = Array.from(columnNameInputsContainer.querySelectorAll('input[type="text"]:not(:disabled)'))
            .map(input => input.value.trim());

        let structuralChange = newNamesFromInputs.length !== currentColumnNamesSnapshot.length;

        let nameChange = false;
        if (!structuralChange) {
            for (let i = 0; i < newNamesFromInputs.length; i++) {
                if (newNamesFromInputs[i] !== currentColumnNamesSnapshot[i]) {
                    nameChange = true;
                    break;
                }
            }
        }

        const hasChanges = structuralChange || nameChange;

        if (hasChanges) {
            const confirmado = confirm(
                "Este cambio de nombres o estructura de la tabla realizará un borrado de los datos guardados. ¿Está de acuerdo?"
            );
            if (!confirmado) {
                return;
            }
            const tbody = segurosTable.querySelector('tbody');
            if (tbody) tbody.innerHTML = '';
        }

        const thead = segurosTable.querySelector('thead');
        thead.innerHTML = '';

        modalColumnDataState.forEach(name => {
            const th = document.createElement('th');
            th.textContent = name;
            thead.appendChild(th);
        });

        const actionsTh = document.createElement('th');
        actionsTh.textContent = 'Acciones';
        thead.appendChild(actionsTh);

        updateAddFormPlaceholders();
        closeModal();
    });

    const updateAddFormPlaceholders = () => {
        const headers = segurosTable.querySelectorAll('thead th');
        [
            { element: inputNombre, colIndex: 0 },
            { element: inputOficina, colIndex: 1 },
            { element: inputTipo, colIndex: 2 },
        ].forEach(({ element, colIndex }) => {
            if (element && headers[colIndex]) {
                element.placeholder = headers[colIndex].textContent.trim();
            } else if (element) {
                element.placeholder = `Columna ${colIndex + 1} no disponible`;
            }
        });
    };

    updateAddFormPlaceholders();
});