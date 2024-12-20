# Generador de Certificados PDF

Este proyecto es una aplicación web que permite generar certificados en formato PDF a partir de un formulario, combinando datos ingresados por el usuario y datos obtenidos desde un archivo Excel.

## Funcionalidades

- Validación de VIN según posiciones específicas.
- Obtención de información vehicular desde un archivo Excel.
- Generación de un PDF personalizado basado en una plantilla existente.
- Descarga automática del certificado generado.

## Tecnologías Utilizadas

- **HTML5**: Estructura del sitio.
- **CSS3**: Estilos y diseño.
- **JavaScript**: Lógica de validación y generación de PDF.
- **Librerías**:
  - [PDFLib.js](https://pdf-lib.js.org/): Para manipulación de PDFs.
  - [SheetJS (XLSX)](https://github.com/SheetJS/sheetjs): Para lectura y procesamiento de archivos Excel.

## Requisitos Previos

Antes de usar este proyecto, asegúrate de tener lo siguiente:

- Un navegador moderno compatible con JavaScript.
- Un archivo Excel con los datos necesarios, siguiendo el formato esperado:
  - **Columna 3**: Contiene el VIN.
  - **Columna 1**: Tipo de vehículo.
  - **Columna 4**: Nombre del modelo.
  - **Columna 8**: Cilindrada (cc).

## Estructura del Proyecto

```plaintext
/
├── index.html          # Archivo HTML principal.
├── script.js           # Archivo JavaScript con la lógica del proyecto.
├── styles.css          # Estilos de la aplicación.
├── certificado_template.pdf  # Plantilla base para los certificados.
├── base_datos.xlsx     # Archivo Excel con los datos vehiculares.
├── README.md           # Este archivo.
