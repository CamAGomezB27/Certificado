document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('certificadoForm');
    const generateBtn = document.getElementById('generateBtn');
    
    // Función para habilitar el botón de generar certificado cuando todos los campos son completados
    function checkFormCompletion() {
        const anoModelo = document.getElementById('anoModelo').value.trim();
        const modelo = document.getElementById('modelo').value.trim();
        const numeroMotor = document.getElementById('numeroMotor').value.trim();
        const vin = document.getElementById('codigoModelo').value.trim();
        
        if (anoModelo && modelo && numeroMotor && vin) {
            generateBtn.disabled = false;  // Habilita el botón si todos los campos están completos
        } else {
            generateBtn.disabled = true;   // Deshabilita el botón si falta algún campo
        }
    }

    // Escuchar cambios en el formulario para habilitar/deshabilitar el botón
    form.addEventListener('input', checkFormCompletion);
    
    // Función para verificar si el VIN es válido
    function isVinValid(vin) {
        return vin && /^[A-Za-z0-9]+$/.test(vin) && vin.length >= 8;  // Validación VIN: al menos 8 caracteres alfanuméricos
    }

    generateBtn.addEventListener('click', async function () {
        // Obtener todos los valores del formulario
        const anoModelo = document.getElementById('anoModelo').value.trim();
        const modelo = document.getElementById('modelo').value.trim();
        const numeroMotor = document.getElementById('numeroMotor').value.trim();
        const vin = document.getElementById('codigoModelo').value.trim();

        if (isVinValid(vin)) {
            // Si el VIN es válido, procedemos a generar el PDF

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
                                marca: { x: 220, y: 580 },        // Ajustada para el espacio adecuado
                                clase: { x: 220, y: 560 },        // Ajustada para el espacio adecuado
                                nombreModelo: { x: 220, y: 540 }, // Ajustada para el espacio adecuado
                                anoModelo: { x: 220, y: 520 },    // Ajustada para el espacio adecuado
                                cilindraje: { x: 220, y: 500 },   // Ajustada para el espacio adecuado
                                vin: { x: 220, y: 480 }           // Ajustada para el espacio adecuado
                            };

                            // Escribir los datos en el PDF en las posiciones especificadas
                            page.drawText(`Marca: MARCA`, { x: positions.marca.x, y: positions.marca.y, font, size: 12 });
                            page.drawText(`Clase: TIPO DE VEHICULO`, { x: positions.clase.x, y: positions.clase.y, font, size: 12 });
                            page.drawText(`Nombre del modelo: ${modelo}`, { x: positions.nombreModelo.x, y: positions.nombreModelo.y, font, size: 12 });
                            page.drawText(`Año Modelo: ${anoModelo}`, { x: positions.anoModelo.x, y: positions.anoModelo.y, font, size: 12 });
                            page.drawText(`Cilindraje: CILINDRADA(cc)`, { x: positions.cilindraje.x, y: positions.cilindraje.y, font, size: 12 });
                            page.drawText(`VIN o Serial: ${vin}`, { x: positions.vin.x, y: positions.vin.y, font, size: 12 });

                            // Guardar el documento y descargarlo
                            return pdfDoc.save();
                        });
                })
                .then(pdfBytesModified => {
                    const blob = new Blob([pdfBytesModified], { type: 'application/pdf' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `certificado_${vin}.pdf`;  // Descarga el archivo con el nombre correcto
                    link.click();
                })
                .catch(error => {
                    console.error('Error al procesar el archivo PDF:', error);
                    alert('Ocurrió un error al generar el PDF.');
                });
        } else {
            alert('Por favor, ingrese un VIN válido que tenga al menos 8 caracteres alfanuméricos.');
        }
    });
});
