// DATABASE CONNECT
const sql = require("mssql");
const configMssql = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'PLEMH',
};
sql.connect(configMssql, (err) => {
    if (err) {
        console.log('Error Database', err)
        return;
    }
    console.log('Database Connect');
});

module.exports = sql;