// route untuk login
import express from 'express';
import { register, dashboard, login } from '../controllers/authController.js';
// import passport from 'passport';
import { restrict } from '../middlewares/restrict.js';
import { forgotPassword, resetPassword,whoami } from '../controllers/authController.js';

const router = express.Router();

/**
 * @swagger
 * @route GET /api/v1/auth/register
 * @group Auth - Operations about authentication
 * @returns {object} 200 - Render register page
 * @summary Render registration page
 */

router.get('/register', (req, res) => {
    res.render('register.ejs');
});

/**
 * @swagger
 * @route POST /api/v1/auth/register
 * @group Auth - Operations about authentication
 * @param {object} user.body.required - User registration data
 * @param {string} user.body.name.required - User's name
 * @param {string} user.body.email.required - User's email
 * @param {string} user.body.password.required - User's password
 * @returns {object} 201 - User registered successfully
 * @returns {Error} 400 - Email sudah digunakan
 * @returns {Error} 500 - Gagal melakukan registrasi
 * @summary Register a new user
 */

router.post('/register', register);

/**
 * @swagger
 * @route GET /api/v1/auth/login
 * @group Auth - Operations about authentication
 * @returns {object} 200 - Render login page
 * @summary Render login page
 */

router.get('/login', (req, res) => {
    res.render('login.ejs');
});

/**
 * @swagger
 * @route POST /api/v1/auth/login
 * @group Auth - Operations about authentication
 * @param {object} user.body.required - User login data
 * @param {string} user.body.email.required - User's email
 * @param {string} user.body.password.required - User's password
 * @returns {object} 200 - User logged in successfully
 * @returns {Error} 401 - Email tidak ditemukan
 * @returns {Error} 401 - Password salah
 * @returns {Error} 500 - Internal server error
 * @summary Log in a user
 */

router.post('/login', login);


/**
 * @swagger
 * @route GET /api/v1/auth/dashboard
 * @group Auth - Operations about authentication
 * @returns {object} 200 - Render dashboard page
 * @returns {Error} 403 - Forbidden
 * @summary Render user dashboard
 */

router.get('/dashboard',  restrict, dashboard);

/**
 * @swagger
 * @route GET /api/v1/auth/whoami
 * @group Auth - Operations about authentication
 * @returns {object} 200 - Returns the authenticated user's information
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 500 - Internal server error
 * @summary Get information about the currently authenticated user
 */

router.get('/whoami', restrict, whoami);

/**
 * @swagger
 * @route POST /api/v1/auth/forgot-password
 * @group Auth - Operation about authentication forgot password
 * @returns {object} 200 - Email untuk reset password telah dikirim
 * @returns {Error} 404 - Email tidak ditemukan
 * @returns {Error} 500 - Gagal mengirim email
 * @summary Sending a forgotten password request
 */

router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * @route GET /api/v1/auth/reset-password
 * @group Auth - Operation about authentication reset password
 * @returns {object} 200 - Display password reset page
 * @returns {Error} 500 - Internal server error
 * @summary Get page to reset password
 */

router.get('/reset-password/:token', (req, res) => {
    const token = req.params.token; // mendapatkan token dari parameter rute
    res.render('reset-pw.ejs', { token }); // mengirim token ke views
});

/**
 * @swagger
 * @route POST /api/v1/auth/reset-password
 * @group Auth - Operation about authentication reset password
 * @returns {object} 200 - Password berhasil direset
 * @returns {Error} 400 - Invalid input
 * @returns {Error} 500 - Gagal mereset password atau token tidak valid
 * @summary Sending new password reset and reset token
 */

router.post('/reset-password', resetPassword);

export default router;
