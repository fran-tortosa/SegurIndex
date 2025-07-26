// js/xml.js

// Espera a que el DOM esté completamente cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'segurosDatos';
  const saveXmlBtn = document.getElementById('saveXmlBtn');
  const loadXmlInput = document.getElementById('loadXmlInput');
  const segurosTable = document.getElementById('segurosTable');
  const tableBody = segurosTable.querySelector('tbody');

    // Asegurarse de que window.seguros sea un array, inicializándolo si es necesario.
    if (!Array.isArray(window.seguros)) {
      window.seguros = [];
    }

    // Exponer funciones globales para que otros scripts puedan usarlas
    window.saveStorage = saveStorage;
    window.renderTable = renderTable;

    // Funciones de almacenamiento y de obtención de cabeceras
    function saveStorage() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(window.seguros));
    }
    
    function getHeaders() {
      let headers = [];
      if (window.seguros.length > 0) {
        // Usa las claves de todos los objetos para construir una lista completa de cabeceras
        const allKeys = new Set();
        window.seguros.forEach(obj => {
          Object.keys(obj).forEach(key => allKeys.add(key));
        });
        headers = Array.from(allKeys);
      } else {
        // Si no hay datos, usa la cabecera actual de la tabla HTML
        headers = Array.from(segurosTable.querySelectorAll('thead th'))
          .filter(th => th.textContent.trim() !== 'Acciones')
          .map(th => th.textContent.trim());
      }
      return headers;
    }

    // Renderizado de la tabla
    function renderTable(dataToRender = window.seguros) {
      // La estructura de la cabecera SIEMPRE se basa en los datos completos o la tabla original
      const currentHeaders = getHeaders();
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

      // El cuerpo de la tabla se renderiza con los datos proporcionados (filtrados o completos)
      tableBody.innerHTML = '';
      dataToRender.forEach((obj) => {
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

        btn.addEventListener('click', () => {
          const pkKey = currentHeaders[0]; // Asume que la primera columna es la clave primaria
          const pkValue = obj[pkKey];

          if (confirm(`¿Eliminar seguro "${pkValue || 'este elemento'}"?`)) {
            const actualIndex = window.seguros.findIndex(item => item[pkKey] === pkValue);
            if (actualIndex > -1) {
              window.seguros.splice(actualIndex, 1);
              saveStorage();
              renderTable(); // Re-renderiza con los datos actualizados
            }
          }
        });
        tdAcc.appendChild(btn);
        tr.appendChild(tdAcc);
        tableBody.appendChild(tr);
      });

      const contador = document.getElementById('contadorFilas');
      if (contador) contador.textContent = `Número de filas/seguros: ${window.seguros.length}`;
    }

    // Inicialización de datos al cargar la página
    if (!Array.isArray(window.seguros) || window.seguros.length === 0) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        window.seguros = JSON.parse(stored);
      } else {
        // Si no hay localStorage, lee la tabla HTML inicial
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

    // Función para exportar a XML
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

    // Función para descargar el XML
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

    // Función para cargar un XML
    loadXmlInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
  	
  	// Parche de seguridad memoria
  	const tamaño_max = 30 * 1024 * 1024 // Tamaño máximo del archivo .XML en 30MB
  	// Comprobar tamaño del archivo
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
          const structEl = xmlDoc.getElementsByTagName('column_structure')[0];
          if (!structEl) {
              alert('El archivo XML no es válido, no contiene la etiqueta <column_structure>.');
              loadXmlInput.value = '';
              return;
          }
          
          const loadedHeaders = Array.from(structEl.getElementsByTagName('column_name')).map(cn => cn.textContent.trim());
          const xmlTags = loadedHeaders.map(sanitizeXmlTag);

          if (loadedHeaders.length === 0) {
              alert('El XML no define una estructura de columnas.');
              loadXmlInput.value = '';
              return;
          }

          // Pide confirmación si la estructura de la tabla cambia
          const currentHeaders = getHeaders();
          const structureHasChanged = JSON.stringify(currentHeaders) !== JSON.stringify(loadedHeaders);
          
          if (structureHasChanged) {
              if (!confirm("La estructura de columnas del XML es diferente a la tabla actual. Si continúas, se reemplazarán las columnas y todos los datos actuales se borrarán. ¿Deseas continuar?")) {
                  loadXmlInput.value = ''; // Resetea el input
                  return; // Aborta la operación
              }
          }

          // Procede a cargar los datos
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
          renderTable(); // Renderiza con la nueva estructura y datos
          
        } catch (error) {
          alert('Ocurrió un error al procesar el archivo XML.');
          console.error('Error durante la carga del XML:', error);
        } finally {
          loadXmlInput.value = ''; // Limpia el input en cualquier caso
        }
      };
      reader.readAsText(file);
    });

    // Renderizado inicial al cargar la página
    renderTable();
  });