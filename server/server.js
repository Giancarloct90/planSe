const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const morgan = require('morgan');
const path = require('path');

// SET VIEW ENGINE
app.engine('hbs', exphbs({
    extname: 'hbs'
}));
app.set('view engine', 'hbs')

// ROUTES
app.use(require('./routes/indexRoutes'));

// MSSQL Server 
//app.use(require('./dataBase'));

// MORGAN TO SEE REQUEST
app.use(morgan('dev'));

// SET PUBLIC FOLDER
app.use(express.static(path.join(__dirname, '../public/')));

// APP LISTEN
const main = async () => {
    try {
        await app.listen(3000);
        console.log('Server On');
    } catch (e) {
        console.log('Error');
    }
};
main();