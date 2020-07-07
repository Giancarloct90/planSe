try {
    let id = req.params.id;
    const result = await sql.query(`EXECUTE getConstancia ${id}`);
    var mes = new Date().getMonth() + 1;
    var dia = new Date().getDate();
    var anio = new Date().getFullYear();
    var deduciones;
    var detalleDeducciones = [],
        detalleDeduccionesFinal = [],
        codigo, nombreEmpleado, sueldoNominal, totalDeducciones, totalSueldoNeto, dia, mes, anio, fechaIngreso, antiguedad, puesto, asignado, salarioLetras;
    if (dia <= 15) {
        deduciones = await sql.query(`EXECUTE getDeduciones ${id}, ${mes-1}, ${anio}`);
    }
    if (dia > 15) {
        deduciones = await sql.query(`EXECUTE getDeduciones ${id}, ${mes}, ${anio}`);
    }
    console.log(deduciones);
    deduciones.recordset.map((element) => {
        detalleDeducciones = [];
        detalleDeducciones.push(element.nombreDeduc);
        //detalleDeducciones.push(element.monto);
        detalleDeducciones.push({
            text: element.monto,
            alignment: 'right'
        });
        detalleDeduccionesFinal.push(detalleDeducciones);
        // detalleDeducciones += `['${element.nombreDeduc}','${element.monto}'],`
    });
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
} catch (error) {
    console.log('Error Query', error);
}