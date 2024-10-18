import { Router } from 'express';
import { Profile } from '../services/profile.js';

const router = Router();

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

export default router;
