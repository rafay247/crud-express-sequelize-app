const userController = require('../controllers/userController');
const express = require('express');
const router = express.Router()
const auth = require('../middleware/auth')

//route
router.get('/signup', userController.signupPage);
router.get('/', userController.loginPage);
router.get('/home',auth,userController.homeRoute);
router.get('/update-user',auth,userController.update_user)

// API
router.post('/signup', userController.validateSignup, userController.signup);
router.post('/', userController.validateLogin, userController.login);

router.get('/api/users/',auth, userController.find);
router.put('/api/users/:id',auth, userController.update);
router.delete('/api/users/:id', auth,userController.delete);

module.exports = router;