import { Router } from 'express';
import { Profile } from '../services/profile.js';
import { User } from '../services/user.js'; 

const router = Router();

/**
 * @swagger
 * @route GET /api/v1/profiles/:userId
 * @group Profiles - Operations about profiles
 * @param {integer} userId.path.required - User ID
 * @returns {object} 200 - User's detail with profile
 * @returns {Error}  404 - Profile not found
 * @returns {Error}  500 - Internal server error
 * @summary Get profile detail by User ID
 */

// endpoint untuk menampilkan profil berdasarkan userId
router.get('/:userId', async (req, res, next) => {
    const userId = parseInt(req.params.userId, 10);

    try {
        const profile = await Profile.getProfile(userId);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' }); // menangani profile yang tidak ditemukan
        }

        res.json({
            user_id: profile.user_id,
            identity_type: profile.identity_type,
            identity_number: profile.identity_number,
            address: profile.address,
            user: profile.user, // menampilkan detail user jika dibutuhkan
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * @route POST /api/v1/profiles/:userId/profile
 * @group Profiles - Operations about profiles
 * @param {User.model} user.body.required - User's data
 * @param {string} user.body.identity_type.required - Type of identity (e.g., KTP, KK)
 * @param {string} user.body.identity_number.required - Unique identity number
 * @param {string} user.body.address.required - User's address
 * @returns {object} 201 - Profile berhasil dibuat
 * @returns {Error}  404 - User not found
 * @returns {Error}  500 - Internal server error
 * @summary Create a new profile for an existing user
 */

// endpoint untuk membuat profil baru berdasarkan user yang sudah ada
router.post('/:userId/profile', async (req, res, next) => {
    const userId = parseInt(req.params.userId, 10);
    const { identity_type, identity_number, address } = req.body;

    try {
        const existingUser = await User.getUser(userId);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' }); // menangani user yang tidak ditemukan
        }

        const newProfile = new Profile(userId, identity_type, identity_number, address);
        await newProfile.create();

        res.status(201).json({
            message: 'Profile Berhasil dibuat',
            user_id: userId,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * @route DELETE /api/v1/profiles/:userId/profile
 * @group Profiles - Operations about profiles
 * @param {integer} userId.path.required - User ID
 * @returns {null} 204 - Profile successfully deleted
 * @returns {Error}  404 - Profile not found
 * @returns {Error}  500 - Internal server error
 * @summary Delete a user's profile
 */

// endpoint untuk menghapus profil berdasarkan userId
router.delete('/:userId/profile', async (req, res, next) => {
    const userId = parseInt(req.params.userId, 10);

    try {
        const deletedProfile = await Profile.deleteProfile(userId);
        if (!deletedProfile) {
            return res.status(404).json({ message: 'Profile not found' }); // menangani profile yang tidak ditemukan
        }
        res.status(204).send(); 
        
    } catch (error) {
        next(error);
    }
});


export default router;
