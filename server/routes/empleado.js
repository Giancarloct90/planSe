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
    try {
        let id = req.params.id;
        const result = await sql.query(`EXECUTE getConstancia ${id}`);
        var mes = new Date().getMonth() + 1;
        var dia = new Date().getDate();
        var anio = new Date().getFullYear();
        var deduciones;
        var detalleDeducciones = [],
            detalleDeduccionesFinal = [],
            codigo, nombreEmpleado, sueldoNominal, totalDeducciones, totalSueldoNeto, dia, mes, anio, fechaIngreso, antiguedad, puesto, asignado;

        // if (dia >= 9 && dia <= 15) {
        //     deduciones = await sql.query(`EXECUTE getDeduciones ${id}, ${mes-1}, ${anio}`);
        // }
        // if (dia <= 9) {
        //     deduciones = await sql.query(`EXECUTE getDeduciones ${id}, ${mes-1}, ${anio}`);
        // }
        // if (dia >= 15) {
        //     console.log('Mayor 15 29')
        //     deduciones = await sql.query(`EXECUTE getDeduciones ${id}, ${mes}, ${anio}`);
        // }

        deduciones = await sql.query(`EXECUTE getDeduciones ${id}, 11, 2019`);

        deduciones.recordset.map((element) => {
            detalleDeducciones = [];
            detalleDeducciones.push(element.nombreDeduc);
            detalleDeducciones.push(element.monto);
            detalleDeduccionesFinal.push(detalleDeducciones);
            // detalleDeducciones += `['${element.nombreDeduc}','${element.monto}'],`
        });

        console.log(detalleDeduccionesFinal);
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
        });
    } catch (error) {
        console.log('Error Query', error);
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
                        text: ` ES MIEMBRO ACTIVO DE LAS FUERZAS ARMADAS DESEMPEÑANDOSE EN EL PUESTO DE: ${puesto}, ASIGNADO EN: ${asignado}\n\n`,
                        fontSize: 11,
                    },
                ],
                alignment: 'justify'
            },

            // SUELDO
            {
                text: `DEVENGANDO UN SUELDO DE:  ${sueldoNominal} LEMPIRAS\n\n`,
                fontSize: 11,
            },

            // TITULO DETALLE
            {
                text: 'DETALLADOS EN LA FORMA SIGUIENTE: \n\n',
                fontSize: 11,
            },

            // SUELDO NOMINAL
            {
                text: `SUELDO NOMINAL...................... ${sueldoNominal}\n`,
                fontSize: 11,
                margin: [60, 0, 0, 0]
            },

            // SUELDO DEDUCC
            {
                text: `TOTAL DEDCUCCIONES.............. ${totalDeducciones}\n`,
                fontSize: 11,
                margin: [60, 0, 0, 0]
            },

            //SUELDO NETO
            {
                text: `SUELDO NETO............................. ${totalSueldoNeto}\n\n`,
                fontSize: 11,
                margin: [60, 0, 0, 0]
            },

            // SUELDO DETALLE DEDUCC
            {
                text: 'DETALLE DE DEDUCCIONES:\n',
                fontSize: 11,
                margin: [60, 0, 0, 0]
            },

            // TABLA DEDUCCIONES
            // {
            //     layout: 'noBorders',
            //     table: {
            //         body: detalleDeduccionesFinal
            //     },
            //     margin: [60, 0, 0, 0],
            // },

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
            {
                style: 'tableExample',
                table: {
                    body: [
                        [{
                            text: 'Column 1',
                            alignment: 'center'
                        }, {
                            text: 'Column 2',
                            alignment: 'right'
                        }, 'Column 3'],
                        [{
                            text: 'One value goes here',
                            alignment: 'center'
                        }, {
                            text: 'Another one here',
                            alignment: 'right'
                        }, 'OK?']
                    ]
                }
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
});


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