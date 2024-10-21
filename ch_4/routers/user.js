import Joi from 'joi';
import { Router } from 'express';
import { User } from '../services/user.js';
import { Profile } from '../services/profile.js';

const router = Router();

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



// endpoint untuk menampilkan daftar user
router.get('/', async (req, res, next) => {
    try {
        const users = await User.getAllUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
});

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

export default router;
