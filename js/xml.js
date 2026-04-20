// js/xml.js
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'segurosDatos';
  const saveXmlBtn = document.getElementById('saveXmlBtn');
  const loadXmlInput = document.getElementById('loadXmlInput');
  const segurosTable = document.getElementById('segurosTable');
  const tableBody = segurosTable.querySelector('tbody');

  // VARIABLES PARA PODER MODIFICAR FILAS
  let indiceEdicionActual = -1;
  const editModal = document.getElementById('editRowModal');
  const closeEditModalBtn = document.getElementById('closeEditModal');
  const saveEditBtn = document.getElementById('saveEditRowBtn');
  const editRowInputsContainer = document.getElementById('editRowInputs');

  if (!Array.isArray(window.seguros)) { window.seguros = []; }

  window.saveStorage = saveStorage;
  window.renderTable = renderTable;

  function saveStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.seguros));
  }
  
  function getHeaders() {
    let headers = [];
    if (window.seguros.length > 0) {
      const allKeys = new Set();
      window.seguros.forEach(obj => {
        Object.keys(obj).forEach(key => allKeys.add(key));
      });
      headers = Array.from(allKeys);
    } else {
      headers = Array.from(segurosTable.querySelectorAll('thead th'))
        .filter(th => th.textContent.trim() !== 'Acciones')
        .map(th => th.textContent.trim());
    }
    return headers;
  }

  function renderTable(dataToRender = window.seguros) {
    const currentHeaders = getHeaders();
    let thead = segurosTable.querySelector('thead');
    if (!thead) { thead = document.createElement('thead'); segurosTable.prepend(thead); }
    thead.innerHTML = '';

    const theadRow = document.createElement('tr');
    currentHeaders.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      theadRow.appendChild(th);
    });
    const thAcc = document.createElement('th');
    thAcc.textContent = 'Acciones';
    thAcc.style.display = 'none'; //
    theadRow.appendChild(thAcc);
    thead.appendChild(theadRow);

    tableBody.innerHTML = '';
    dataToRender.forEach((obj, index) => {
      const tr = document.createElement('tr');
      currentHeaders.forEach(key => {
        const td = document.createElement('td');
        td.textContent = obj[key] || '';
        tr.appendChild(td);
      });

      const tdAcc = document.createElement('td');
      tdAcc.style.display = 'none'; //
      
      // BOTÓN MODIFICAR
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Modificar';
      editBtn.className = 'button edit';
      editBtn.style.marginRight = "5px";
      editBtn.onclick = () => abrirModalEdicion(index);
      
      // BOTÓN ELIMINAR
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Eliminar';
      deleteBtn.className = 'button delete';
      deleteBtn.onclick = () => {
        const pkKey = currentHeaders[0];
        const pkValue = obj[pkKey];
        if (confirm(`¿Eliminar seguro "${pkValue || 'este elemento'}"?`)) {
          const actualIndex = window.seguros.findIndex(item => item[pkKey] === pkValue);
          if (actualIndex > -1) {
            window.seguros.splice(actualIndex, 1);
            saveStorage();
            renderTable();
          }
        }
      };

      tdAcc.appendChild(editBtn);
      tdAcc.appendChild(deleteBtn);
      tr.appendChild(tdAcc);
      tableBody.appendChild(tr);
    });

    const contador = document.getElementById('contadorFilas');
    if (contador) contador.textContent = `Número de filas: ${window.seguros.length}`;
  }

  // LÓGICA DE EDICIÓN
  function abrirModalEdicion(index) {
    indiceEdicionActual = index;
    const registro = window.seguros[index];
    const headers = getHeaders();
    editRowInputsContainer.innerHTML = '';

    headers.forEach(key => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('column-input-item');
      const label = document.createElement('label');
      label.textContent = key;
      const input = document.createElement('input');
      input.type = 'text';
      input.value = registro[key] || '';
      input.dataset.key = key;
      wrapper.append(label, input);
      editRowInputsContainer.appendChild(wrapper);
    });

    editModal.classList.add('is-open');
  }

  closeEditModalBtn.onclick = () => editModal.classList.remove('is-open');

  saveEditBtn.onclick = () => {
    if (indiceEdicionActual > -1) {
      const inputs = editRowInputsContainer.querySelectorAll('input');
      inputs.forEach(input => {
        const key = input.dataset.key;
        window.seguros[indiceEdicionActual][key] = input.value.trim();
      });
      saveStorage();
      renderTable();
      editModal.classList.remove('is-open');
    }
  };

    // INICIALIZAR DATOS AL CARGAR PÁGINA
    if (!Array.isArray(window.seguros) || window.seguros.length === 0) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        window.seguros = JSON.parse(stored);
      } else {
        // SI NO HAY LOCALSTORAGE, CARGA LA TABLA HTML
        const headersFromHtmlTable = getHeaders();
        Array.from(tableBody.rows).forEach(row => {
          const obj = {};
          headersFromHtmlTable.forEach((key, i) => {
            obj[key] = row.cells[i]?.textContent.trim() || '';
          });
          window.seguros.push(obj);
        });
        saveStorage();
      }
    }

    // PARA EXPORTAR EN XML
    function escapeXml(str) {
      return String(str).replace(/[<>&'"]/g, c => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', '\'': '&apos;', '"': '&quot;'
      })[c]);
    }

    function sanitizeXmlTag(label) {
      let sanitized = label.replace(/[^a-zA-Z0-9_]/g, '').replace(/^(\d|[-.])/, '_$1');
      return sanitized || 'campo_desconocido';
    }

function generateXML() {
      const originalHeaders = getHeaders();
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<seguros>\n';
      xml += '  <estructura>\n';
      originalHeaders.forEach(label => {
        xml += `    <nombre_columna>${escapeXml(label)}</nombre_columna>\n`;
      });
      xml += '  </estructura>\n';
      window.seguros.forEach(obj => {
        xml += '  <seguro>\n';
        originalHeaders.forEach(originalHeader => {
          const tag = sanitizeXmlTag(originalHeader);
          const val = obj[originalHeader] || '';
          xml += `    <${tag}>${escapeXml(val)}</${tag}>\n`;
        });
        xml += '  </seguro>\n';
      });
      xml += '</seguros>';
      return xml;
    }

    // PARA DESCARGAR EL XML
    saveXmlBtn.addEventListener('click', () => {
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const filename = `seguros-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}-filas-${window.seguros.length}.xml`;
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

    // PARA CARGAR UN XML
    loadXmlInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
  	
  	// PARCHE SEGURIDAD DE MEMORIA
  	const tamaño_max = 30 * 1024 * 1024 // TAMAÑO MAXIMO DEL ARCHIVO .XML EN 30MB
  	// COMPROBAR TAMAÑO DEL ARCHIVO
  	if (file.size > tamaño_max) {
  		alert('El archivo es demasiado grande, contacte con el administrador.');
  		return;
  	}

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const xmlDoc = new DOMParser().parseFromString(reader.result, 'application/xml');
          const errorNode = xmlDoc.querySelector('parsererror');
          if (errorNode) {
            alert('Error al parsear el XML. El archivo podría estar corrupto.');
            loadXmlInput.value = '';
            return;
          }

          const segurosEl = Array.from(xmlDoc.getElementsByTagName('seguro'));
          const structEl = xmlDoc.getElementsByTagName('estructura')[0];
          if (!structEl) {
              alert('El archivo XML no es válido, no contiene la etiqueta <estructura>.');
              loadXmlInput.value = '';
              return;
          }
          
          const loadedHeaders = Array.from(structEl.getElementsByTagName('nombre_columna')).map(cn => cn.textContent.trim());
          const xmlTags = loadedHeaders.map(sanitizeXmlTag);

          if (loadedHeaders.length === 0) {
              alert('El XML no define una estructura de columnas.');
              loadXmlInput.value = '';
              return;
          }

          // CONFIRMAR SI LA TABLA ES DIFERENTE
          const currentHeaders = getHeaders();
          const structureHasChanged = JSON.stringify(currentHeaders) !== JSON.stringify(loadedHeaders);
          
          if (structureHasChanged) {
              if (!confirm("La estructura de columnas del XML es diferente a la tabla actual. Si continúas, se reemplazarán las columnas y todos los datos actuales se borrarán. ¿Deseas continuar?")) {
                  loadXmlInput.value = '';
                  return;
              }
          }

          // CARGA LOS DATOS
          const newSeguros = [];
          segurosEl.forEach(node => {
            const obj = {};
            loadedHeaders.forEach((originalHeader, i) => {
              const tagToFind = xmlTags[i];
              obj[originalHeader] = node.getElementsByTagName(tagToFind)[0]?.textContent || '';
            });
            newSeguros.push(obj);
          });
          
          window.seguros = newSeguros;
          saveStorage();
          renderTable();
          
        } catch (error) {
          alert('Ocurrió un error al procesar el archivo XML.');
          console.error('Error durante la carga del XML:', error);
        } finally {
          loadXmlInput.value = '';
        }
      };
      reader.readAsText(file);
    });

    // RENDERIZADO INICIAL DE LA TABLA
    renderTable();
  });