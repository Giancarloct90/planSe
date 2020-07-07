const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

// SETTING
// SET VIEW ENGINE
app.engine('hbs', exphbs({
    extname: 'hbs'
}));
app.use(express.static(path.join(__dirname, '../public/')));
require('../passport/local-auth');

// MIDDLEWARES
app.set('view engine', 'hbs');
app.use(morgan('dev'));
app.use(express.urlencoded({
    extended: false
}));
app.use(express.json());
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


// DB INIT
// Inizialate DB
require('./dataBase');

// ROUTES
app.use(require('./routes/indexRoutes'));

// APP LISTEN
(async () => {
    try {
        await app.listen(3000);
        console.log('Server On');
    } catch (e) {
        console.log('Error');
    }
})();