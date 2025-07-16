// Script que se encarga del XML
// Funciones
const saveXmlBtn = document.getElementById('saveXmlBtn');
const loadXmlInput = document.getElementById('loadXmlInput');
const clearFileBtn = document.getElementById('clearFileBtn');

// Generar XML
function generateXML() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<seguros>\n';
    seguros.forEach (s => {
        xml += '  <seguro>\n';
        xml += `    <nombre>${s.nombre}</nombre>\n`;
        xml += `    <oficina>${s.oficina}</oficina>\n`;
        xml += `    <tipo>${s.tipo}</tipo>\n`;
        xml += '  </seguro>\n';
   });
  xml += '</seguros>';
  return xml;
}

// Descargar/guardar XML
saveXmlBtn.addEventListener('click', () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const total = seguros.length;
  const filename = `seguros-${yyyy}${mm}${dd}-${hh}${min}${ss}-filas-${total}.xml`;

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

// Cargar XML
loadXmlInput.addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader(); reader.onload = () => {
    const xml = new DOMParser().parseFromString(reader.result, 'application/xml');
    const items = Array.from(xml.getElementsByTagName('seguro'));
    seguros = items.map(node => ({
      nombre: node.getElementsByTagName('nombre')[0].textContent,
      oficina: node.getElementsByTagName('oficina')[0].textContent,
      tipo: node.getElementsByTagName('tipo')[0].textContent
    }));
    saveStorage(); renderTable();
  };
  reader.readAsText(file);
});

clearFileBtn.addEventListener('click', () => {
  loadXmlInput.value = '';
});