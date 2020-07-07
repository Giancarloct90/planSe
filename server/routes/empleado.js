const express = require('express');
const app = express();
const sql = require("mssql");
const PDF = require('pdfkit');
const pdfmake = require('pdfmake');
const doc = new PDF();
const fs = require('fs');
const path = require('path');
const blobStream = require('blob-stream');
var open = require('open');

const {
    isAuth
} = require('../utils/utils');

app.get('/', async (req, res) => {
    res.render('login', {
        layout: false
    });
});

app.get('/home', isAuth, async (req, res) => {
    try {
        let empleado = await sql.query('getTotalEmpleados');
        res.render('home', {
            empleado: empleado.recordset,
            totalEmpleado: empleado.rowsAffected
        })
    } catch (error) {
        console.log("Error obtener empleados", error);
    }
})

app.get('/detalles/:id', isAuth, async (req, res) => {
    let fonts = {
        Roboto: {
            normal: 'node_modules/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf',
            bold: 'node_modules/roboto-font/fonts/Roboto/roboto-bold-webfont.ttf',
            italics: 'node_modules/roboto-font/fonts/Roboto/roboto-italic-webfont.ttf',
            bolditalics: 'node_modules/roboto-font/fonts/Roboto/roboto-bolditalic-webfont.ttf'
        }
    };

    var deduciones;
    var deduc;
    var id;
    var detalleDeducciones = [],
        detalleDeduccionesFinal = [],
        codigo, nombreEmpleado, sueldoNominal, totalDeducciones, totalSueldoNeto, dia, mes, anio, fechaIngreso, antiguedad, puesto, asignado, salarioLetras, result;
    try {
        id = req.params.id;
        result = await sql.query(`EXECUTE getConstancia ${id}`);
        result.recordset.map((element) => {
            codigo = element.codigo
            nombreEmpleado = element.nombreEmpleado
            sueldoNominal = element.sueldoNominal
            totalDeducciones = element.totalDeducciones
            totalSueldoNeto = element.totalSueldoNeto
            dia = element.dia
            mes = element.mes
            anio = element.anio
            fechaIngreso = element.fechaIngreso
            antiguedad = element.antiguedad
            puesto = element.puesto
            asignado = element.asignado
            salarioLetras = element.salarioLetras
        });

    } catch (e) {
        console.log('Error para obtener las constancia', e);
    }
    deduc = await getDeducionesFN(id);
    console.log(deduc);
    if (deduc.rowsAffected[0] >= 1) {
        deduc.recordset.map((element) => {
            detalleDeducciones = [];
            detalleDeducciones.push(element.nombreDeduc);
            detalleDeducciones.push({
                text: element.monto,
                alignment: 'right'
            });
            detalleDeduccionesFinal.push(detalleDeducciones);
        });
    }
    if (deduc.rowsAffected[0] == 0) {
        detalleDeducciones.push('Mensaje');
        detalleDeducciones.push('El empleado no tiene deducciones o no se ha generado la planilla BD');
        detalleDeduccionesFinal.push(detalleDeducciones);
        console.log(detalleDeduccionesFinal);
    }

    var data = {
        content: [
            // PRIMERA IMAGEN
            {
                image: path.join(__dirname, `../../public/img/titulo.JPG`),
                width: 520,
                height: 80,
                margin: [0, 0, 0, 0]
            },

            // TITULO
            {
                text: '\nCONSTANCIA\n\n',
                style: 'header',
                fontSize: 16,
                alignment: 'center'
            },

            // TEXTO INICIO
            {
                text: 'EL SUSCRITO JEFE DEL DEPARTAMENTO DE COMPUTO DE LA PAGADURIA GENERAL DE LAS FUERZAS ARMADAS POR ESTE MEDIO HACE CONSTAR QUE:\n\n',
                fontSize: 11,
                alignment: 'justify'
            },

            // NOMBRE CARGO DONDE SE DESEMPENIA
            {
                text: [{
                        text: `${nombreEmpleado} `,
                        fontSize: 11,
                        bold: true
                    },
                    {
                        text: `ES MIEMBRO ACTIVO DE LAS FUERZAS ARMADAS DESEMPEÑANDOSE EN EL PUESTO DE:`,
                        fontSize: 11,
                    },
                    {
                        text: ` ${puesto},`,
                        //bold: true,
                        fontSize: 11,
                    },
                    {
                        text: ` ASIGNADO EN: ${asignado}\n\n`,
                        // bold: true,
                        fontsize: 11
                    }
                ],
                alignment: 'justify'
            },

            // SUELDO
            {
                text: `DEVENGANDO UN SUELDO DE:  ${sueldoNominal} LEMPIRAS\n`,
                fontSize: 11,
            },
            {
                text: `${salarioLetras}\n\n`,
                fontSize: 11
            },

            // TITULO DETALLE
            {
                text: 'DETALLADOS EN LA FORMA SIGUIENTE: \n\n',
                fontSize: 11,
            },
            // Detalle de SUELDO
            {
                layout: 'noBorders',
                table: {
                    body: [
                        ['SUELDO NOMINAL', {
                            text: `${sueldoNominal}`,
                            alignment: 'right'
                        }],
                        ['TOTAL DEDCUCCIONES', {
                            text: `${totalDeducciones}`,
                            alignment: 'right'
                        }],
                        ['SUELDO NETO', {
                            text: `${totalSueldoNeto}`,
                            alignment: 'right'
                        }]
                    ]
                },
                fontSize: 11,
                margin: [60, 0, 0, 0]
            },

            // SUELDO DETALLE DEDUCC
            {
                text: '\nDETALLE DE DEDUCCIONES:\n',
                fontSize: 11,
                margin: [60, 0, 0, 0]
            },

            // TABLA DEDUCCIONES
            {
                layout: 'noBorders',
                table: {
                    body: detalleDeduccionesFinal
                },
                margin: [60, 0, 0, 0],
            },

            // CODIGO EMPLEADO
            {
                text: `\nCODIGO EMPLEADO: ${codigo}\n`,
                fontSize: 11,
                margin: [60, 0, 0, 0]

            },

            // FECHA INGRESO
            {
                text: `FECHA DE INGRESO: ${fechaIngreso.toUpperCase()}\n`,
                fontSize: 11,
                margin: [60, 0, 0, 0]

            },

            // ANIOS DE SERVICIOS
            {
                text: `AÑOS DE SERVICIO: ${antiguedad} AÑOS \n\n`,
                fontSize: 11,
                margin: [60, 0, 0, 0]

            },

            // TEXTO FINAL
            {
                text: `Y PARA LOS FINES QUE EL INTERESADO(A) CONVENGA, SE EXTIENDE LA PRESENTE CONSTANCIA EN LA CIUDAD DE COMAYAGÜELA, M.D.C. A LOS ${dia} DIAS DEL MES DE ${mes.toUpperCase()} DEL AÑO ${anio}\n\n\n\n\n`,
                fontSize: 11,
                alignment: 'justify'
            },

            //  DIRECTOR DEL DEPTO
            {
                text: `CORONEL DE ADMON. FAUSTO ISABEL ZAMBRANO CARRASCO\n`,
                fontSize: 11,
                alignment: 'center'
            },

            // FIRMA FINAL
            {
                text: `JEFE DEL DEPTO. COMPUTO`,
                fontSize: 11,
                alignment: 'center'
            },
        ]
    }

    var data2 = {
        content: [
            // PRIMERA IMAGEN
            {
                image: path.join(__dirname, `../../public/img/titulo.JPG`),
                width: 520,
                height: 80,
                margin: [0, 0, 0, 0]
            },

            // TITULO
            {
                text: '\nCONSTANCIA\n\n',
                style: 'header',
                fontSize: 16,
                alignment: 'center'
            },

            // TEXTO INICIO
            {
                text: 'EL SUSCRITO JEFE DEL DEPARTAMENTO DE COMPUTO DE LA PAGADURIA GENERAL DE LAS FUERZAS ARMADAS POR ESTE MEDIO HACE CONSTAR QUE:\n\n',
                fontSize: 11,
                alignment: 'justify'
            },

            // NOMBRE CARGO DONDE SE DESEMPENIA
            {
                text: [{
                        text: `${nombreEmpleado} `,
                        fontSize: 11,
                        bold: true
                    },
                    {
                        text: `ES MIEMBRO ACTIVO DE LAS FUERZAS ARMADAS DESEMPEÑANDOSE EN EL PUESTO DE:`,
                        fontSize: 11,
                    },
                    {
                        text: ` ${puesto},`,
                        //bold: true,
                        fontSize: 11,
                    },
                    {
                        text: ` ASIGNADO EN: ${asignado}\n\n`,
                        // bold: true,
                        fontsize: 11
                    }
                ],
                alignment: 'justify'
            },

            // SUELDO
            {
                text: `DEVENGANDO UN SUELDO DE:  56,107.00 LEMPIRAS\n`,
                fontSize: 11,
            },
            {
                text: `CINCUENTA Y SEIS MIL CIENTO SIETE LEMPIRAS CON 0/100 LEMPIRAS\n\n`,
                fontSize: 11
            },

            // TITULO DETALLE
            {
                text: 'DETALLADOS EN LA FORMA SIGUIENTE: \n\n',
                fontSize: 11,
            },
            // Detalle de SUELDO
            {
                layout: 'noBorders',
                table: {
                    body: [
                        ['SUELDO NOMINAL', {
                            text: `56,107.00`,
                            alignment: 'right'
                        }],
                        ['TOTAL DEDCUCCIONES', {
                            text: `13,039.76`,
                            alignment: 'right'
                        }],
                        ['SUELDO NETO', {
                            text: `43,067.24`,
                            alignment: 'right'
                        }]
                    ]
                },
                fontSize: 11,
                margin: [60, 0, 0, 0]
            },

            // SUELDO DETALLE DEDUCC
            {
                text: '\nDETALLE DE DEDUCCIONES:\n',
                fontSize: 11,
                margin: [60, 0, 0, 0]
            },

            // TABLA DEDUCCIONES
            {
                layout: 'noBorders',
                table: {
                    body: [
                        ['PRESTAMOS IPM', {
                            text: `56,107.00`,
                            alignment: 'right'
                        }],
                        ['PRESTAMOS IPM', {
                            text: `1,310.46`,
                            alignment: 'right'
                        }],
                        ['COTIZACION IPM ', {
                            text: `5,791.14`,
                            alignment: 'right'
                        }],
                        ['APORTACION HOSPITAL MILITAR', {
                            text: `3366.42`,
                            alignment: 'right'
                        }],
                        ['CUENTAS X PAGAR PAG. GRAL. FA', {
                            text: `1,000.00`,
                            alignment: 'right'
                        }],
                        ['COOPERATIVA MIXTA F.A.H. LTDA', {
                            text: `565.00`,
                            alignment: 'right'
                        }],
                        ['COOPERATIVA GENERACIONAL 92', {
                            text: `1,006.74`,
                            alignment: 'right'
                        }]
                    ]
                },
                margin: [60, 0, 0, 0],
            },

            // CODIGO EMPLEADO
            {
                text: `\nCODIGO EMPLEADO: ${codigo}\n`,
                fontSize: 11,
                margin: [60, 0, 0, 0]

            },

            // FECHA INGRESO
            {
                text: `FECHA DE INGRESO: ${fechaIngreso.toUpperCase()}\n`,
                fontSize: 11,
                margin: [60, 0, 0, 0]

            },

            // ANIOS DE SERVICIOS
            {
                text: `AÑOS DE SERVICIO: ${antiguedad} AÑOS \n\n`,
                fontSize: 11,
                margin: [60, 0, 0, 0]

            },

            // TEXTO FINAL
            {
                text: `Y PARA LOS FINES QUE EL INTERESADO(A) CONVENGA, SE EXTIENDE LA PRESENTE CONSTANCIA EN LA CIUDAD DE COMAYAGÜELA, M.D.C. A LOS ${dia} DIAS DEL MES DE ${mes.toUpperCase()} DEL AÑO ${anio}\n\n\n\n\n`,
                fontSize: 11,
                alignment: 'justify'
            },

            //  DIRECTOR DEL DEPTO
            {
                text: `TENIENTE CORONEL DE M.G. D.E.M. WALTER GUILLERMO McCARTHY OSORIO\n`,
                fontSize: 11,
                alignment: 'center'
            },

            // FIRMA FINAL
            {
                text: `JEFE DEL DEPTO. COMPUTO`,
                fontSize: 11,
                alignment: 'center'
            },
        ]
    }


    let printer = new pdfmake(fonts);
    let pdfdoc = printer.createPdfKitDocument(data);
    let nomDirDPF = path.join(__dirname, `../../public/pdf/${new Date().getTime()}.pdf`);
    pdfdoc.pipe(fs.createWriteStream(nomDirDPF));
    pdfdoc.end();
    setTimeout(() => {
        res.sendFile(`${nomDirDPF}`, (e) => {
            if (e) {
                console.log('Error to DOwnload file');
                return
            }
            console.log('Downloaded');
        });
    }, 1500);
    // res.send('recived');
});

async function getDeducionesFN(id) {
    // let mesD = new Date().getMonth() + 1,
    //     diaD = new Date().getDate(),
    //     anioD = new Date().getFullYear(),
    //     deduciones;
    // try {
    //     if (diaD <= 15) {
    //         if (mesD == 1) {
    //             mesD = 12;
    //             deduciones = await sql.query(`EXECUTE getDeduciones ${id}, ${mesD}, ${anioD-1}`);
    //             return deduciones;
    //         }
    //         deduciones = await sql.query(`EXECUTE getDeduciones ${id}, ${mesD-1}, ${anioD}`);
    //         return deduciones
    //     }
    //     if (diaD > 15) {
    //         deduciones = await sql.query(`EXECUTE getDeduciones ${id}, ${mesD}, ${anioD}`);
    //         return deduciones
    //     }
    // } catch (e) {
    //     console.log('Error get deduc', e);
    // }
    deduciones = await sql.query(`EXECUTE getDeduciones ${id}, 11, 2019`);
    return deduciones
}

app.get('/reporte', isAuth, async (req, res) => {
    try {
        let reporte = await sql.query('EXECUTE getReporteEmpleado');
        var totalOE, totalOA, totalON, totalSUBE, totalSUBA, totalSUBN, totalAUX, totalO, totalSUB, totalCON, totalEMP
        var reportes = {};
        reporte.recordset.map((element) => {
            totalOE = element.totalOE;
            totalOA = element.totalOA;
            totalON = element.totalON;
            totalSUBE = element.totalSUBE;
            totalSUBA = element.totalSUBA;
            totalSUBN = element.totalSUBN;
            totalAUX = element.totalAUX;
            totalO = element.totalO;
            totalSUB = element.totalSUB;
            totalCON = element.totalCON;
            totalEMP = element.totalEMP;
        });
        var reportes = {
            totalOE,
            totalOA,
            totalON,
            totalSUBE,
            totalSUBA,
            totalSUBN,
            totalAUX,
            totalO,
            totalSUB,
            totalCON,
            totalEMP
        };
        console.log(reportes);
        console.log(reporte.recordset);
        res.render('reportes', {
            reportes: reporte.recordset
        });
    } catch (error) {

    }

});

module.exports = app;