// js/xml.js

// Espera a que el DOM esté completamente cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'segurosDatos';
  const saveXmlBtn = document.getElementById('saveXmlBtn');
  const loadXmlInput = document.getElementById('loadXmlInput');
  const clearFileBtn = document.getElementById('clearFileBtn');
  const segurosTable = document.getElementById('segurosTable');
  const tableBody = segurosTable.querySelector('tbody');

  // Asegurarse de que window.seguros sea un array, inicializándolo si es necesario.
  if (!Array.isArray(window.seguros)) {
    window.seguros = [];
  }

  // Exponer funciones globales para que interfaz.js pueda usarlas
  window.saveStorage = saveStorage;
  window.renderTable = renderTable; // Exponer renderTable globalmente

  // 1) Define almacenamiento y renderizado localmente
  function saveStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.seguros));
  }

  /**
   * Renderiza la tabla con los datos proporcionados o con window.seguros si no se especifica.
   * También actualiza el THEAD para reflejar la estructura de los datos.
   * @param {Array} [dataToRender=window.seguros] Los datos a renderizar en la tabla.
   */
  function renderTable(dataToRender = window.seguros) {
    tableBody.innerHTML = ''; // Limpiar cuerpo de la tabla

    // Obtener los encabezados.
    let currentHeaders = [];
    if (dataToRender.length > 0) {
      const allKeys = new Set();
      dataToRender.forEach(obj => {
        Object.keys(obj).forEach(key => allKeys.add(key));
      });
      currentHeaders = Array.from(allKeys);
    } else {
      currentHeaders = Array.from(segurosTable.querySelectorAll('thead th'))
        .filter(th => th.textContent.trim() !== 'Acciones')
        .map(th => th.textContent.trim());
    }

    // --- Reconstruir el THEAD correctamente para evitar duplicación ---
    let thead = segurosTable.querySelector('thead');
    if (!thead) {
      thead = document.createElement('thead');
      segurosTable.prepend(thead);
    }
    thead.innerHTML = '';

    const theadRow = document.createElement('tr');
    currentHeaders.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      theadRow.appendChild(th);
    });
    const thAcc = document.createElement('th');
    thAcc.textContent = 'Acciones';
    theadRow.appendChild(thAcc);
    thead.appendChild(theadRow);

    // --- Renderizar el TBODY ---
    dataToRender.forEach((obj, idx) => {
      const tr = document.createElement('tr');
      currentHeaders.forEach(key => {
        const td = document.createElement('td');
        td.textContent = obj[key] || '';
        tr.appendChild(td);
      });
      const tdAcc = document.createElement('td');
      const btn = document.createElement('button');
      btn.textContent = 'Eliminar';
      btn.className = 'button delete';

      // Lógica de eliminación directamente en el botón creada por xml.js
      btn.addEventListener('click', () => {
        const pkKey = currentHeaders[0]; // Asume que la primera columna es la clave primaria
        const pkValue = obj[pkKey];

        if (confirm(`¿Eliminar seguro "${pkValue || 'este elemento'}"?`)) {
          const actualIndex = window.seguros.findIndex(item => item[pkKey] === pkValue);
          if (actualIndex > -1) {
            window.seguros.splice(actualIndex, 1);
            saveStorage();
            renderTable(); // Re-renderiza toda la tabla con los datos actualizados de window.seguros
          }
        }
      });
      tdAcc.appendChild(btn);
      tr.appendChild(tdAcc);
      tableBody.appendChild(tr);
    });

    // Actualizar contador si existe
    const contador = document.getElementById('contadorFilas');
    if (contador) contador.textContent = `Número de filas/seguros: ${dataToRender.length}`;
  }

  // 2) Inicializa window.seguros leyendo localStorage O la tabla HTML
  if (!Array.isArray(window.seguros) || window.seguros.length === 0) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      window.seguros = JSON.parse(stored);
    } else {
      const headersFromHtmlTable = Array.from(segurosTable.querySelectorAll('thead th'))
        .filter(th => th.textContent.trim() !== 'Acciones')
        .map(th => th.textContent.trim());

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

  // 3) Funciones auxiliares para XML
  function escapeXml(str) {
    return str.replace(/[<>&'"]/g, c => ({
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '\'': '&apos;',
      '"': '&quot;'
    })[c]);
  }

  function getXmlExportHeaders() {
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

  function sanitizeXmlTag(label) {
    let sanitized = label
      .replace(/[^a-zA-Z0-9_]/g, '')
      .replace(/^(\d|[-.])/, '_$1');
    if (!sanitized) {
      sanitized = 'campo_desconocido';
    }
    return sanitized;
  }

  function generateXML() {
    const originalHeaders = getXmlExportHeaders();
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<seguros>\n';

    xml += '  <column_structure>\n';
    originalHeaders.forEach(label => {
      xml += `    <column_name>${escapeXml(label)}</column_name>\n`;
    });
    xml += '  </column_structure>\n';

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

  // 4) Descarga de XML
  saveXmlBtn.addEventListener('click', () => {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const count = window.seguros.length;
    const filename =
      `seguros-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}` +
      `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}` +
      `-filas-${count}.xml`;

    const blob = new Blob([generateXML()], {
      type: 'application/xml'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // 5) Carga de XML
  loadXmlInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) {
      loadXmlInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const xmlDoc = new DOMParser().parseFromString(reader.result, 'application/xml');

        const errorNode = xmlDoc.querySelector('parsererror');
        if (errorNode) {
          alert('Error al parsear el XML. El archivo podría estar corrupto o no ser un XML válido.');
          console.error('XML parsing error:', errorNode.textContent);
          loadXmlInput.value = '';
          return;
        }

        const segurosEl = Array.from(xmlDoc.getElementsByTagName('seguro'));
        const structEl = xmlDoc.getElementsByTagName('column_structure')[0];

        let loadedHeaders = [];
        let xmlTags = [];

        if (segurosEl.length > 0) {
          xmlTags = Array.from(segurosEl[0].children).map(c => c.tagName);
          if (structEl) {
            const originalNames = Array.from(structEl.getElementsByTagName('column_name'))
              .map(cn => cn.textContent.trim());
            if (originalNames.length === xmlTags.length &&
              originalNames.every((name, i) => sanitizeXmlTag(name) === xmlTags[i])) {
              loadedHeaders = originalNames;
            } else {
              loadedHeaders = xmlTags;
            }
          } else {
            loadedHeaders = xmlTags;
          }
        } else if (structEl) {
          loadedHeaders = Array.from(structEl.getElementsByTagName('column_name'))
            .map(cn => cn.textContent.trim());
          xmlTags = loadedHeaders.map(name => sanitizeXmlTag(name));
        } else {
          alert('El archivo XML no contiene datos válidos ni una estructura de columnas definida.');
          loadXmlInput.value = '';
          return;
        }

        let thead = segurosTable.querySelector('thead');
        if (!thead) {
          thead = document.createElement('thead');
          segurosTable.prepend(thead);
        }
        thead.innerHTML = '';

        const newTheadRow = document.createElement('tr');
        loadedHeaders.forEach(header => {
          const th = document.createElement('th');
          th.textContent = header;
          newTheadRow.appendChild(th);
        });
        const thAcc = document.createElement('th');
        thAcc.textContent = 'Acciones';
        newTheadRow.appendChild(thAcc);
        thead.appendChild(newTheadRow);

        window.seguros.length = 0;
        segurosEl.forEach(node => {
          const obj = {};
          loadedHeaders.forEach((originalHeader, i) => {
            const tagToFind = xmlTags[i] || sanitizeXmlTag(originalHeader);
            obj[originalHeader] = node.getElementsByTagName(tagToFind)[0]?.textContent || '';
          });
          window.seguros.push(obj);
        });

        saveStorage();
        renderTable();

        loadXmlInput.value = '';
      } catch (error) {
        alert('Ocurrió un error al procesar el archivo XML. Asegúrate de que es un XML bien formado.');
        console.error('Error durante la carga del XML:', error);
        loadXmlInput.value = '';
      }
    };
    reader.readAsText(file);
  });

  // 6) Limpiar la carga del archivo
  clearFileBtn.addEventListener('click', () => {
    loadXmlInput.value = '';
  });

  renderTable();
});