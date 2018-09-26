//requerimos los paquetes necesarios,express,express.Router,el modelo,bcrypt con salt,
//y passport.

const express = require("express");
const authRoutes = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const ensureLogin = require("connect-ensure-login");
const passport = require("passport");

//creamos la ruta signup y decimos que nos renderice login/signup(vista que crearemos ahora)
authRoutes.get("/signup", (req, res, next) => {
    res.render("login/signup");
});
//le pasamos el metodo post para que los datos del usuario no se envíen en claro
//y especificamos las constantes y las igualamos a lo que debe requqerir del modelo.
authRoutes.post("/signup", (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    //ponemos todos los condicionales que deben cumplirse para acceder a la cuenta.
    if (username === "" || password === "") {
        res.render("login/signup", {
            message: "Indicate username and password"
        });
        return;
    }

    User.findOne({
            username
        })
        .then(user => {
            if (user !== null) {
                res.render("login/signup", {
                    message: "The username already exists"
                });
                return;
            }

//declaramos las const para aplicar el salt y el hasPass
            const salt = bcrypt.genSaltSync(bcryptSalt);
            const hashPass = bcrypt.hashSync(password, salt);
//aquí es donde programamos la creacion del usuario y le aplicamos a pasword el hasPass          
            const newUser = new User({
                username,
                password: hashPass
            });
//guardamos dicho usuario y si hay err lo mandamos a la pagina signup
            newUser.save((err) => {
                if (err) {
                    res.render("login/signup", {
                        message: "Something went wrong"
                    });
//y si esta ok lo mandamos a la principal
                } else {
                    res.redirect("/");
                }
            });
        })
        .catch(error => {
            next(error)
    })
});

//creamos la ruta login y para el mensaje de error utilizamos el método de passport 'flash' que ya viene incluido en este.
authRoutes.get("/login", (req, res, next) => {
    res.render("login/login", { "message": req.flash("error") });
  });

//hacemos lo propio de las rutas de login y signup que es hacer el método post para no enviar datos en claro.
//pero en este caso hacemos uso de la propiedad autenticate.
  authRoutes.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: false,
    passReqToCallback: true
  }));
//si solicitan ka ruta private/:id 
  authRoutes.get("/private/:id", (req,res) => {
//busca en User(que es nuestro modelo)un id q coincida 
    User.findOne({_id: req.params.id})
//y renderiza la vista de dicho perfil.
    .then( user => {
      res.render("login/profile", user)
    })
  })
//si solicita la ruta private,utilizamos la función propia de passport 'checkRoles'y pasamos como 
//parámetro lo que buscamos que es Boss,lo buscamos entre los usuarios

  authRoutes.get("/private", checkRoles("Boss"), (req, res, next) => {
    User.find()
      .then(users => {
//y renderizamos su vista de formulario
        res.render("login/bossForm", {users});
      })
      .catch(err => {
        console.log(err);
      });
  });
//esta es la función correspondiente a checkRoles que comprueba si está autenticado.  
  function checkRoles(role) {
    return function(req, res, next) {
      if (req.isAuthenticated() && req.user.role === role) {
        return next();
      } else {
        res.redirect('/login')
      }
    }
  }
//aquí creamos la ruta private/delete/:id
  authRoutes.get("/private/delete/:id", (req,res) => {
//le decimos que lo busque por id y lo elimine y que redirija a private.
    User.findByIdAndRemove(req.params.id), () => {
      res.redirect("/private")
    }
  })
//creamos la ruta logout para terminar sesion y una vez hecho nos redirige a la vista login  
  authRoutes.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/login");
  });
  
  
   module.exports = authRoutes;