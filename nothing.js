let id = req.params.id;
request.query(`SELECT * FROM RH_Empleado WHERE No_Empleado = ${id}`, (err, result) => {
    if (err) {
        res.send('err', err);
    }
    res.render('detalles', {
        empleado: result.recordset,
        total: result.rowsAffected
    });
});


////////
//hbs config 
// SET VIEW ENGINE
app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: 'hbs'
}));

// codigo para escribir un pdf en el sistema de archivos pdfkit
doc.pipe(fs.createWriteStream(path.join(__dirname, '../../pdf/example.pdf')));
doc.text('Hola mundo', {
    align: 'center'
});
doc.end();


// pdfkit
//console.log(path.join(__dirname,'../../pdf/example.pdf'));
try {
    let id = req.params.id;
    const result = await sql.query(`EXECUTE getConstancia ${id}`);
    console.log(result.recordset);
} catch (error) {
    console.log('Error Query', error);
}
try {
    doc.pipe(fs.createWriteStream(path.join(__dirname, `../../public/pdf/${new Date().getTime()}.pdf`)));
    doc.fontSize(50).text('CONSTANCIA', {
        align: 'center'
    });
    doc.end();

    //console.log(new Date().getTime());
    res.redirect('/');
} catch (error) {
    console.log('Error Creating PDF', error);
}

/media/legasov / Storage / Programing / Nodejs / mssqls / public / pdf / 1575297435621. pdf




{
    {
        !--
        empleado: result1.recordset,
            totalEmpleado: result1.rowsAffected,
            totalOE: resultOE.recordset,
            totalOA: resultOA.recordset,
            totalON: resultON.recordset,
            totalSE: resultSE.recordset,
            totalSA: resultSA.recordset,
            totalSN: resultSN.recordset,
            totalO: resultTotalO.recordset,
            totalSO: resultTotalSO.recordset,
            totalAux: resultTotalAUX.recordset




                                                                                                        <div class="NavC">
                                                                                                        <nav class="navbar navbar-expand-lg navbar-dark ">
                                                                                                            <a class="navbar-brand" href="/">SEDENA</a>
                                                                                                            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup"
                                                                                                                aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                                                                                                                <span class="navbar-toggler-icon"></span>
                                                                                                            </button>
                                                                                                            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                                                                                                                <div class="navbar-nav">
                                                                                                                    <div class="dropdown">
                                                                                                                        <a class="nav-item nav-link" href="/#">EMC</a>
                                                                                                                        <div class="dropdown-content">
                                                                                                                            <a href="emcOficiales">Oficiales</a>
                                                                                                                            <a href="emcSuboficiales">Sub-Oficiales</a>
                                                                                                                            <a href="emcAuxiliares">Auxiliares</a>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div class="dropdown">
                                                                                                                        <a class="nav-item nav-link" href="/#">FUERZA EJERCITO</a>
                                                                                                                        <div class="dropdown-content">
                                                                                                                            <a href="/feOficiales">Oficiales</a>
                                                                                                                            <a href="/feSuboficiales">Sub-Oficiales</a>
                                                                                                                            <a href="/feAuxiliares">Auxiliares</a>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div class="dropdown">
                                                                                                                        <a class="nav-item nav-link" href="/#">FUERZA AEREA</a>
                                                                                                                        <div class="dropdown-content">
                                                                                                                            <a href="">Oficiales</a>
                                                                                                                            <a href="#">Sub-Oficiales</a>
                                                                                                                            <a href="#">Auxiliares</a>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div class="dropdown">
                                                                                                                        <a class="nav-item nav-link" href="/#">FUERZA NAVAL</a>
                                                                                                                        <div class="dropdown-content">
                                                                                                                            <a href="#">Oficiales</a>
                                                                                                                            <a href="#">Sub-Oficiales</a>
                                                                                                                            <a href="#">Auxiliares</a>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </nav>
                                                                                                    </div>