document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('certificadoForm');
    const anoModeloInput = document.getElementById('anoModelo');
    const generateBtn = document.getElementById('generateBtn');

    // Variable para almacenar las referencias de VIN extraídas del archivo Excel
    let excelReferences = [];

    // Función para cargar las referencias del archivo Excel
    async function loadExcelReferences() {
        try {
            const response = await fetch('base_datos.xlsx');  // Ruta al archivo Excel
            const data = await response.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];  // Primer hoja del Excel
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });  // Convertir a array de filas

            // Extraer las referencias del VIN (suponiendo que están en la columna 4, ajusta si es diferente)
            excelReferences = rows.map(row => row[3]?.toString().trim()); // Suponiendo que el VIN está en la columna 3 (índice 3)
            console.log('Referencias cargadas:', excelReferences);  // Mostrar en consola las referencias
        } catch (error) {
            console.error('Error al cargar las referencias del Excel:', error);
        }
    }

    // Llamar a la función para cargar las referencias cuando la página se carga
    loadExcelReferences();

    // Evento para validar la entrada del año modelo y permitir solo números
    anoModeloInput.addEventListener('input', function () {
        // Reemplazar cualquier carácter que no sea un número
        this.value = this.value.replace(/[^0-9]/g, '');
    // Validación del año modelo
        const anoModelo = parseInt(anoModeloInput.value.trim(), 10);
        const currentYear = new Date().getFullYear();

        if (anoModelo < currentYear - 2 || anoModelo > currentYear) {
            anoModeloInput.setCustomValidity(`Por favor ingrese un año entre ${currentYear - 2} y ${currentYear}.`);
        } else {
            anoModeloInput.setCustomValidity('');
        }

        anoModeloInput.reportValidity();
    });

    // Función para habilitar el botón de generar certificado cuando todos los campos son completados
    function checkFormCompletion() {
        const anoModelo = document.getElementById('anoModelo').value.trim();
        const currentYear = new Date().getFullYear();
        const numeroMotor = document.getElementById('numeroMotor').value.trim();
        const vin = document.getElementById('codigoModelo').value.trim();

        if (numeroMotor && vin && anoModelo >= currentYear - 2 && anoModelo <= currentYear) {
            generateBtn.disabled = false;  // Habilita el botón si todos los campos están completos  
            
        } else {
            generateBtn.disabled = true;   // Deshabilita el botón si falta algún campo
        }
    }

    // Escuchar cambios en el formulario para habilitar/deshabilitar el botón
    form.addEventListener('input', checkFormCompletion);

    // Función para verificar si el VIN es válido según las posiciones 3-7 y su comparación con las referencias de Excel
    function isVinValid(vin) {
        if (vin && vin.length >= 8) {
            const vinSubstr = vin.substring(3, 8).toString().trim().toUpperCase();  // Asegurar que el VIN se convierte a cadena y está en mayúsculas
            console.log('Subcadena extraída del VIN:', vinSubstr);
            console.log('Referencias de Excel:', excelReferences);
            console.log('Comprobando VIN...');

            // Comparar con todas las referencias posibles
            const matchFound = excelReferences.some(ref => ref.toString().trim().toUpperCase() === vinSubstr);  // Asegurarse de que las referencias están en formato de texto

            if (matchFound) {
                console.log('¡Coincide con una referencia de Excel!');
                return true;  // Si el VIN es válido
            } else {
                console.log('No coincide con ninguna referencia de Excel.');
                return false;  // Si no coincide con ninguna referencia
            }
        }
        return false;  // Si el VIN no cumple con la longitud mínima
    }

    // Función para obtener los datos del Excel basado en el VIN
    async function getVehicleDataFromExcel(vin) {
        const response = await fetch('base_datos.xlsx');  // Ruta al archivo Excel
        const data = await response.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];  // Usamos la primera hoja del Excel
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });  // Convertir a array de filas

        // Verificar que los datos cargados están correctos
        console.log('Datos del Excel:', rows);

        // Buscar la fila correspondiente al VIN ingresado
        for (const row of rows) {
            const rowVin = row[3] ? row[3].toString().trim().toUpperCase() : '';  // Suponiendo que la columna 3 tiene el VIN
            const vinSubstr = vin.substring(3, 8).toString().trim().toUpperCase();  // Asegurar que todo esté en formato de cadena

            console.log('Comparando VIN:', vinSubstr, 'con:', rowVin);

            // Si encontramos una coincidencia con la subcadena del VIN, extraemos los datos
            if (rowVin === vinSubstr) {
                console.log('Datos encontrados para el VIN:', vinSubstr);
                return {
                    MARCA: row[0], //MARCA
                    TIPODEVEHICULO: row[1],  // TIPO DE VEHÍCULO
                    NOMBREMODELO: row[4],    // NOMBRE MODELO
                    CILINDRADA: row[8],      // CILINDRADA (cc)
                };
            }
        }

        console.log('No se encontraron datos para el VIN:', vinSubstr);
        return null;  // Retorna null si no encuentra el VIN
    }

    // Función para generar el PDF
    generateBtn.addEventListener('click', async function () {
        // Obtener todos los valores del formulario
        const anoModelo = document.getElementById('anoModelo').value.trim();
        const numeroMotor = document.getElementById('numeroMotor').value.trim();
        const vin = document.getElementById('codigoModelo').value.trim();

        if (isVinValid(vin)) {
            // Obtener los datos del Excel basados en el VIN
            const vehicleData = await getVehicleDataFromExcel(vin);
            if (vehicleData) {
                const { MARCA, TIPODEVEHICULO, NOMBREMODELO, CILINDRADA } = vehicleData;

                // Si el VIN es válido y se encontraron los datos, procedemos a generar el PDF

                const file = 'certificado_template.pdf';  // Aquí debes poner la ruta correcta a tu plantilla PDF

                fetch(file)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error al cargar el archivo PDF: ' + response.statusText);
                        }
                        return response.arrayBuffer();
                    })
                    .then(data => {
                        const { PDFDocument } = PDFLib;
                        return PDFDocument.load(data);
                    })
                    .then(pdfDoc => {
                        return pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica)
                            .then(font => {
                                const page = pdfDoc.getPages()[0];

                                // Definir las posiciones ajustadas para escribir los datos en el PDF
                                const positions = {
                                    MARCA: { x: 150, y: 680 },
                                    TIPODEVEHICULO: { x: 150, y: 660 },
                                    NOMBREMODELO: { x: 150, y: 640 },
                                    anoModelo: { x: 150, y: 620 },
                                    CILINDRADA: { x: 150, y: 600 },
                                    vin: { x: 150, y: 580 },
                                    numeroMotor: { x: 150, y: 560 },
                                    tiempos: { x: 150, y: 540 }
                                };

                                // Tamaño de fuente
                                const fontSize = 12;
                            
                                // Crear la tabla con la información
                            const tableHeaders = ['', ''];
                            const tableData = [
                                ['Marca', String(MARCA)],
                                ['Clase', String(TIPODEVEHICULO)],
                                ['Nombre del modelo', String(NOMBREMODELO)],
                                ['Año Modelo', String(anoModelo)],
                                ['Cilindraje', String(CILINDRADA)],
                                ['VIN o Serial', String(vin)],
                                ['Número de Motor', String(numeroMotor)],
                                ['Número de Tiempos', String("Cuatro (4)")]
                            ];

                            const rowHeight = 17.5;  // Alto de cada fila
                            const columnWidth = 170;  // Ancho de cada columna
                            const startX = positions.MARCA.x; // Comenzamos desde la posición definida
                            let startY = positions.MARCA.y - 0;  // Deja espacio antes de la tabla

                            // Escribir encabezados de la tabla
                            page.drawText(tableHeaders[0], { x: startX, y: startY, font, size: 12, lineHeight: rowHeight });
                            page.drawText(tableHeaders[1], { x: startX + columnWidth, y: startY, font, size: 12, lineHeight: rowHeight });

                            startY -= rowHeight;  // Mover hacia abajo para las filas de la tabla

                            // Escribir las filas de la tabla
                            tableData.forEach(row => {
                                page.drawText(row[0], { x: startX, y: startY, font, size: 12, lineHeight: rowHeight });
                                page.drawText(row[1], { x: startX + columnWidth, y: startY, font, size: 12, lineHeight: rowHeight });
                                startY -= rowHeight;  // Mover hacia abajo para la siguiente fila
                            });

                                // Guardar el PDF generado
                                pdfDoc.save().then(pdfBytes => {
                                    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
                                    const pdfUrl = URL.createObjectURL(pdfBlob);
                                    const link = document.createElement('a');
                                    link.href = pdfUrl;
                                    link.download = 'CERTIFICADO DE CUMPLIMIENTO DE LOS LIMITES MAX DE EMISIONES.pdf';
                                    link.click();
                                });
                            });
                    })
                    .catch(error => {
                        console.error('Error al generar el PDF:', error);
                    });
            } else {
                alert('No se encontraron datos para el VIN proporcionado.');
            }
        } else {
            alert('VIN no válido.');
        }
    });
});