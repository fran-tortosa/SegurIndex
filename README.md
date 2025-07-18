# 🛡️ Base de Datos Local de Seguros

**Proyecto para tener de manera local, mediante `localStorage`, una base de datos de seguros donde buscar de forma ágil y sencilla una gran lista de registros.**

---

## 📌 Características principales

✅ **Interfaz rápida y local:**  
Toda la aplicación funciona directamente en tu navegador, sin necesidad de conexión a internet ni servidor.  

✅ **Búsqueda instantánea:**  
Filtrado y búsqueda dinámica de seguros en tiempo real.

✅ **Prevención de duplicados:**  
El sistema detecta automáticamente si se intenta registrar un seguro con un nombre ya existente.

✅ **Confirmación antes de eliminar:**  
Cada acción de eliminación requiere confirmación para evitar pérdidas accidentales de datos.

✅ **Exportación / Importación de datos en XML:**  
- Exporta todos los seguros a un archivo `.xml` que incluye:
  - Todas las filas con la información completa de los seguros.
- Importa el archivo `.xml` fácilmente para restaurar o trasladar tu base de datos a otro navegador/dispositivo.

✅ **Portabilidad sin pérdida de datos:**  
Gracias al uso de XML y `localStorage`, puedes llevar tu base de datos donde quieras y restaurarla en segundos.

✅ **Conteo de seguros:**  
El número total de seguros registrados se muestra dinámicamente en el pie de página (footer).

---

## 🚀 ¿Cómo usar?

1. Abre el archivo `index.html` en tu navegador.
2. Empieza a registrar, buscar, importar o exportar seguros sin preocuparte por perder los datos.
3. Los datos se guardan automáticamente en tu navegador a través de `localStorage`.

---

## 🔐 Licencia

Este proyecto está licenciado bajo **AGPLv3 con cláusula adicional de no uso comercial**.  
Consulta el archivo `LICENSE.txt` para más detalles.

---

## 👤 Autor

Desarrollado por **Francisco Antonio Tortosa López**.

