import Joi from 'joi';
import { Router } from 'express';
import { User } from '../services/user.js';
import { Profile } from '../services/profile.js';

const router = Router();

/**
 * @swagger
 * @typedef User
 * @property {string} name.required - User's name
 * @property {string} email.required - User's email
 * @property {string} password.required - User's password
 * @property {object} profile.required - Profile object
 * @property {string} profile.identity_type.required - Identity type (e.g. KTP, KK, SIM)
 * @property {string} profile.identity_number.required - Identity number
 * @property {string} profile.address.required - Address
 */

// validasi data user dan profile
const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    profile: Joi.object({
        identity_type: Joi.string().required(),
        identity_number: Joi.string().required(),
        address: Joi.string().required(),
    }).required(), 
});

/**
 * @swagger
 * @route POST /api/v1/users
 * @group Users - Operations about users
 * @param {User.model} user.body.required - User's data
 * @param {string} user.body.name.required - User's name
 * @param {string} user.body.email.required - User's email
 * @param {string} user.body.password.required - User's password
 * @param {Profile.model} user.body.profile.required - Profile information
 * @param {string} user.body.profile.identity_type.required - Type of identity (e.g., KTP, KK)
 * @param {string} user.body.profile.identity_number.required - Unique identity number
 * @param {string} user.body.profile.address.required - User's address
 * @returns {object} 201 - Successfully created user
 * @returns {Error}  400 - Invalid input data
 * @returns {Error}  500 - Internal server error
 * @summary Create a new user and a new profile
 */

// endpoint menambahkan data user dan profile
router.post('/', async (req, res, next) => {
    try {
        const { value: userValue, error: userError } = userSchema.validate(req.body);
        if (userError) {
            return next(userError);
        }

        const user = new User(userValue.name, userValue.email, userValue.password); // membuat user
        await user.register();

        const profileValue = userValue.profile;

        const userId = user.getID();
        // membuat profile
        const profile = new Profile(userId, profileValue.identity_type, profileValue.identity_number, profileValue.address);
        await profile.create(); 

        res.status(201).json({
            user_id: userId,
            name: user.name,
            email: user.email,
            profile: {
                identity_type: profile.identity_type, 
                identity_number: profile.identity_number, 
                address: profile.address,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * @route GET /api/v1/users
 * @group Users - Operations about users
 * @returns {Array.<User>} 200 - List of users
 * @returns {Error} 500 - Internal server error
 * @summary Get all users
 */

// endpoint untuk menampilkan daftar user
router.get('/', async (req, res, next) => {
    try {
        const users = await User.getAllUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * @route GET /api/v1/users/:userId
 * @group Users - Operations about users
 * @param {integer} userId.path.required - User ID
 * @returns {object} 200 - User's detail with profile
 * @returns {Error}  404 - User not found
 * @returns {Error}  500 - Internal server error
 * @summary Get user detail by ID
 */

// endpoint untuk menampilkan detail informasi user dan profilenya
router.get('/:userId', async (req, res, next) => {
    const userId = parseInt(req.params.userId);

    console.log('User ID:', userId); 

    try {
        const user = await User.getUser(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profile = await Profile.getProfile(userId);
        res.json({
            user_id: user.id,
            name: user.name,
            email: user.email,
            profile: profile ? {
                identity_type: profile.identity_type,
                identity_number: profile.identity_number,
                address: profile.address,
            }: null,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * @route DELETE /api/v1/users/:userId
 * @group Users - Operations about users
 * @param {integer} userId.path.required - User ID
 * @returns {object} 204 - User successfully deleted
 * @returns {Error} 404 - User not found
 * @returns {Error} 500 - Internal server error
 * @summary Delete a user by ID
 */

// endpoint untuk menghapus data user dan profilenya
router.delete('/:userId', async (req, res, next) => {
    const userId = parseInt(req.params.userId);

    try {
        const deletedUser = await User.deleteUser(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' }); // ditampilkan jika user tidak diterdaftar
        }

        res.status(204).send(); 
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * @route POST /api/v1/auth/register
 * @group Users - Operations about users
 * @param {string} name.body.required - User's full name
 * @param {string} password.body.required - User's password
 * @returns {Error} 400 - Email sudah digunakan
 * @returns {Error} 500 - Internal server error
 * @summary Register user 
 */

// endpoit untuk register
router.post('/register', async(req, res) => {
    const { name,  password } = req.body;

    try {
        const user = await User.createUser(name, password); // buat user baru di register
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Email sudah digunakan' });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
