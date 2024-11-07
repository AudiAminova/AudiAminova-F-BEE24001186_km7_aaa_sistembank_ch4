import { prisma } from '../src/PrismaClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// fungsi register
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            return res.status(400).json({ 
                status: false,
                message: 'Bad Request',
                error: 'Email sudah digunakan',
                data: null,
             });
        }

        // enkripsi password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // simpan user ke db
        await prisma.user.create({
            data: { 
                name: name,
                email: email, 
                password: encryptedPassword,
            },
        });

        return res.status(201).json({ 
            status: true,
            message: 'Berhasil register',
            error: null,
            data: { name, email }
        });

    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: 'Gagal melakukan registrasi' });
    }
};

// fungsi login
export const login = async (req, res) => {
    const { email, password } = req.body; 

    try {
        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            return res.status(401).json({
                status: false,
                message: 'Email atau password salah',
                error: 'Email tidak ditemukan',
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: false,
                message: 'Email atau password salah',
                error: 'Password salah',
            });
        }

        // membuat token JWT setelah pengguna berhasil login
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.SECRET_KEY, // memastikan hanya server yang dapat menghasilkan token yang valid
            { expiresIn: '1h' } 
        );

        res.json({
            status: true,
            message: 'Berhasil login',
            token: token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal melakukan login' });
    }
};

export const authUser = async (email, password, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: email }
        });
        
        if (!user) {
            return done(null, false, { message: 'Email tidak ditemukan' });
        }
        
        // membandingkan password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Password salah' });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
};

export const dashboard = async (req, res) => {
    if (!req.user) {
        req.flash('error_msg', 'Anda harus login terlebih dahulu');
        return res.redirect('/api/v1/auth/login');
    }
    
    res.render('dashboard', { user: req.user });
};

// fungsi whoami
export const whoami = async (req, res) => {
    return res.status(201).json({
        status: true,
        message: 'OKEY',
        error: null,
        data: { user: req.user}
    });
};