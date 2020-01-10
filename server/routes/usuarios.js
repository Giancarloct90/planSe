const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const sqlserver = require('mssql');
const {
    isAuth
} = require('../utils/utils');

// GET TO DEPLOY DE PAGE
app.get('/signup', isAuth, async (req, res) => {
    try {
        let user = await sqlserver.query('SELECT * FROM UsersG WHERE user_Disponible = 1');
        res.render('signup', {
            user: user.recordset
        });
    } catch (e) {
        console.log('Error query SELECT USER', e);
    }
});

// POST THE USER SEND INFO TO US TO SAVED
app.post('/signupP', async (req, res) => {
    let nombre = req.body.txtNombre;
    let password = req.body.txtPass;
    req.flash('user', req.body);
    let user = await sqlserver.query(`SELECT * FROM UsersG WHERE user_Nombre =` + `'${nombre}'` + ``);
    if (user.rowsAffected[0] == 1) {
        console.log('el usuario ya existe');
        res.redirect('signup');
    }
    if (user.rowsAffected[0] == 0) {
        bcrypt.hash(password, 10)
            .then(async (hashedPass) => {
                let user = await sqlserver.query(`INSERT INTO UsersG (user_Nombre, user_Password, user_Disponible) VALUES ('${nombre}','${hashedPass}', 1)`);
                if (user.rowsAffected[0] == 1) {
                    res.redirect('/signup');
                }
            })
            .catch(e => {
                console.log('Error al insertar');
            });
    }
});

// GET TO DELETE
app.get('/userD/:id', async (req, res) => {
    let id = req.params.id;
    console.log(id);
    try {
        let userD = await sqlserver.query(`UPDATE UsersG SET user_Disponible = 0 WHERE user_Codigo = ${id};`);
        if (userD.rowsAffected[0] == 1) {
            //res.redirect('signup');
            res.redirect('/signup');
        }
    } catch (e) {
        console.log('Error Update users', e);
    }
});

// POST LOGIN
app.post('/auth', passport.authenticate('local-signin', {
    successRedirect: '/home',
    failureRedirect: '/',
    passReqToCallback: true
}));


app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// GET< TEST VIEW
app.get('/te', (req, res) => {
    console.log(req.flash('user'));
    res.render('test', {
        user: req.flash('user')
    });
});

module.exports = app;