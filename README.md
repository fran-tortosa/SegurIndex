# 🛡️ Base de datos local de Seguros

**Proyecto para tener de manera local, mediante `localStorage`, una base de datos de seguros donde buscar de forma ágil y sencilla una gran lista de registros.**

<img width="936" height="397" alt="image" src="https://github.com/user-attachments/assets/8f0d3442-93c6-4fb3-9a60-16586eeab772" />

---

## 📌 Características principales

✅ **Gestión dinámica de la tabla**

- ✏️ Edita, añade y elimina columnas: Personaliza por completo la estructura de tu tabla. Puedes cambiar el nombre de las columnas, añadir nuevas o eliminar las que no necesites. El sistema te advertirá antes de realizar cambios que impliquen borrar los datos existentes.
<img width="537" height="447" alt="image" src="https://github.com/user-attachments/assets/eeb1df70-9e34-452a-8f72-b08531cc6ee5" />

- ➕ Añade filas fácilmente: Un nuevo formulario modal te permite añadir seguros rellenando los campos que se corresponden con la estructura de columnas que tengas en ese momento.
<img width="508" height="329" alt="image" src="https://github.com/user-attachments/assets/1ccf8099-9ecc-4060-a55f-90139b396c40" />

✅ **Interfaz rápida y local:**  
Toda la aplicación funciona directamente en tu navegador, sin necesidad de conexión a internet ni servidor.  

✅ **Búsqueda instantánea:**  
Filtra y busca en toda la tabla de forma dinámica y en tiempo real.

✅ **Prevención de duplicados:**  
El sistema detecta automáticamente si se intenta registrar un seguro con un nombre ya existente.

✅ **Confirmación antes de eliminar:**  
Cada acción de eliminación requiere confirmación para evitar pérdidas accidentales de datos.

✅ **Exportación / Importación de datos en XML:**  
- Exporta un archivo .xml que no solo guarda los datos de cada seguro, sino también la estructura exacta de las columnas.
- Importa archivos .xml y la tabla se reconstruirá para coincidir con la estructura del archivo. El sistema pedirá confirmación previa si la estructura es diferente a la actual, evitando así la pérdida accidental de datos.

✅ **Seguridad y robustez**
- 🛡️ Protección Anti-DoS: La aplicación ahora rechaza la carga de archivos .xml excesivamente grandes para proteger a tu navegador de posibles bloqueos o congelamientos.
- 🔒 Seguro por diseño: El código está protegido contra vulnerabilidades comunes como Cross-Site Scripting (XSS) al gestionar y mostrar los datos de forma segura en todo momento.

✅ **Conteo de seguros:**  
Visualiza el número total de seguros registrados de un vistazo, actualizado al instante junto a los controles de la tabla.

---

## 🚀 ¿Cómo usar?

1. Abre el archivo `Seguros.html` en tu navegador.
2. Empieza a registrar, buscar y gestionar tus seguros.
- Usa los botones "Añadir fila" y "Editar columnas" para personalizar la tabla a tu gusto.
- Usa los controles de XML para exportar tus datos y tu estructura o para importar un respaldo.
3. Los datos se guardan automáticamente en tu navegador a través de `localStorage`.

---

## 🔐 Licencia

Este proyecto está licenciado bajo **AGPLv3 con cláusula adicional de no uso comercial**.  
Consulta el archivo `LICENSE.txt` para más detalles.

---

## 👤 Autor

Desarrollado por **Francisco Antonio Tortosa López**.
