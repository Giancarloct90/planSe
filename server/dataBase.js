(async () => {
    const sql = require("mssql");
    // DATABASE MSSQLSERVER CONFIGURATION
    const configMssql = {
        user: 'sa',
        password: 'Jesucristo1990',
        //server: '192.168.1.31\\SQLEXPRESS',
        server: '192.168.0.107\\SQLEXPRESS',
        database: 'PLEMH',
    };
    try {
        await sql.connect(configMssql);
        console.log('Database Connect')
    } catch (error) {
        console.log('Error connect DB', error);
    }
})();