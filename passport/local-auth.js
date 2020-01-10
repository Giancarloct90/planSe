const express = require('express');
const app = express();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sqlserver = require('mssql');
const bcrypt = require('bcrypt');

require('../server/dataBase');

passport.serializeUser((user, done) => {
    done(null, user.user_Codigo);
});

passport.deserializeUser((id, done) => {
    sqlserver.query(`SELECT * FROM UsersG WHERE user_Codigo ='${id}'`)
        .then((user) => {
            done(null, user.recordset[0]);
        })
        .catch(e => console.log('Problem deserializerUser', e));
});


//INSERT INTO UsersG (user_Nombre, user_Password, user_Disponible)
passport.use('local-signin', new LocalStrategy({
    usernameField: 'txtNombre',
    passwordField: 'txtPass',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        let user = await sqlserver.query(`SELECT * FROM UsersG WHERE user_Nombre ='${email}'`);
        if (user.rowsAffected[0] == 0) {
            console.log('El usuario no existe');
            return done(null, false, req.flash('signupMsj', 'El usuario o el password son icorrecos'));
        }
        if (user.rowsAffected[0] == 1) {
            try {
                if (await bcrypt.compare(password, user.recordset[0].user_Password)) {
                    console.log('Usuario existe');
                    return done(null, user.recordset[0]);
                } else {
                    console.log('Password incorrect');
                    return done(null, false, req.flash('signupMsj', 'El usuario o el password son icorrecos'));
                }
            } catch (e) {
                return done(e);
            }
        }
    } catch (e) {
        console.log('Error en el Query');
    }
}));