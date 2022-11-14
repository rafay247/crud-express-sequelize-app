const db = require('../models/index')
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');//for env file
dotenv.config({ path: 'config.env' })
const JWT_SECRET = process.env.JWT_SECRATE || 'helloworld'

const User = db.users

module.exports = {

    signupPage: (req, res) => {

        res.render('signup');
    },
    loginPage: (req, res) => {
        res.render('login');
    },
    homeRoute: async (req, res) => {

        console.log(`this is cookie ${req.cookies.jwt}`);
        await User.findAll()
            .then(user => {
                // console.log(user);
                res.render('index', { users: user });
            })
            .catch(err => {
                res.status(500).send({ message: err.message || "Error Occurred while retriving user information" })
            })
    },
    update_user: async (req, res) => {

        // console.log(`this is cookie ${req.cookies.jwt}`);
        const id = req.query.id;
        // console.log(id);
        await User.findOne({ where: { id: id } })
            .then(data => {
                if (!data) {
                    res.status(404).send({ message: "Not found user with id " + id })
                } else {
                    res.render('update_user', { user: data });
                }
            })
            .catch(err => {
                res.status(500).send({ message: "Erro retrieving user with id " + id })
            })

    },
    validateSignup: [
        body('firstName', "enter firstName of min 3 character").isLength({ min: 3 }),
        body('lastName', "enter lastname of min 3 character").isLength({ min: 3 }),
        body('email', "enter a valid email").isEmail().notEmpty(),
        body('password', "enter password of min 4 character").isLength({ min: 4 }),
    ],
    signup: async (req, res) => {

        let success = false;
        //check express validator
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).send({ success, error: error.array() });
        } else {
            // console.log(req.body)
            const salt = await bcrypt.genSalt(10);
            let usr = req.body;
            usr.password = await bcrypt.hash(usr.password, salt)
            usr.email = usr.email.toLowerCase();
            let user = await User.findOne({ where: { email: usr.email } });
            if (user) {
                return res.status(400).send({ status: false, message: 'email already exist' });
            };
            // console.log(usr);
            let createdUser = await User.create(usr)
            if (!createdUser) {
                res.status(401).send({ message: 'Failed to create a user', err: error });
            }
            const token = jwt.sign({ "id": createdUser.id, "email": createdUser.email, "firstName": createdUser.firstName }, JWT_SECRET);
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 86400000),
                httpOnly: true
            });
            res.status(201).redirect('/home');
            // res.status(201).json({data : createdUser, token: token});
        }
    },
    validateLogin: [
        body('email', "enter a valid email").isEmail().notEmpty(),
        body('password', "enter password of min 4 character").isLength({ min: 4 }),
    ],

    login: async (req, res) => {

        let success = false;
        //check express validator
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).send({ success, error: error.array() });
        } else {
            // console.log(req.body)
            const user = await User.findOne({ where: { email: req.body.email } });
            if (user) {
                const password_valid = await bcrypt.compare(req.body.password, user.password);
                if (password_valid) {
                    const token = jwt.sign({ "id": user.id, "email": user.email, "firstName": user.firstName }, JWT_SECRET);

                    res.cookie("jwt", token, {
                        expires: new Date(Date.now() + 86400000),
                        httpOnly: true
                    });
                    res.status(201).redirect('/home');
                } else {
                    res.status(400).send({ error: "Password Incorrect" });
                }

            } else {
                res.status(404).send({ error: "User does not exist" });
            }
        }
    },

    find: async (req, res) => {

        if (req.query.id) {
            const id = req.query.id;

            await User.findOne({ where: { id: id } })
                .then(data => {
                    if (!data) {
                        res.status(404).send({ message: "Not found user with id " + id })
                    } else {
                        res.send(data)
                    }
                })
                .catch(err => {
                    res.status(500).send({ message: "Erro retrieving user with id " + id })
                })

        } else {
            await User.findAll()
                .then(user => {
                    res.send(user)
                })
                .catch(err => {
                    res.status(500).send({ message: err.message || "Error Occurred while retriving user information" })
                })
        }

    },

    // Update a new idetified user by user id
    update: async (req, res) => {
        if (!req.body) {
            return res.status(400).send({ message: "Data to update can not be empty" })
        }
        const id = req.params.id;
        await User.update(req.body, { where: { id: id } })
            .then(data => {
                if (!data) {
                    res.status(404).send({ message: `Cannot Update user with ${id}. Maybe user not found!` })
                } else {
                    res.send(data)
                }
            })
            .catch(err => {
                res.status(500).send({ message: "Error Update user information" })
            })
    },

    // Delete a user with specified user id in the request
    delete: async (req, res) => {
        const id = req.params.id;

        await User.destroy({ where: { id: id } })
            .then(data => {
                if (!data) {
                    res.status(404).send({ message: `Cannot Delete with id ${id}. Maybe id is wrong` })
                } else {
                    res.send({
                        message: "User was deleted successfully!"
                    })
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "Could not delete User with id=" + id
                });
            });
    }
}