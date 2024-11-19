import { notifications } from '../app.js';
import dotenv from 'dotenv';
import { prisma } from '../src/PrismaClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

dotenv.config();

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

        // emit ke /notifications setelah user berhasil register
        notifications.emit('notification', {
            type: 'register',
            message: 'Selamat Datang!',
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
                message: 'Email salah',
                error: 'Email tidak ditemukan',
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: false,
                message: 'Akses halamanan /forgot-password',
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

// fungsi lupa password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'Email tidak ditemukan',
                error: 'Email tidak ditemukan',
            });
        };

        // membuat token reser password 
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.SECRET_KEY, 
            { expiresIn: '1h' }
        );

        // mengirim email unttuk link reset password
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465, 
            secure: true,
            auth: {
              user: 'audi.aminova.aini.tik22@mhsw.pnj.ac.id',
              pass: process.env.PASS,
            }
        });

         const mailOptions = {
            from: 'audi.aminova.aini.tik22@mhsw.pnj.ac.id',
            to: email,
            subject:'Reset Password',
            html: `
    <head>
    <title>Reset Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            text-align: center;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .button {
            display: inline-block;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 20px;
            font-size: 16px;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>ANDA SEDANG RESET PASSWORD</h2>
        <p>Untuk mendapatkan token dan membuat password baru, tekan tombol di bawah ini.</p>
        <a href="http://localhost:4000/api/v1/auth/reset-password/${token}" class="button">Reset Password</a>
    </div>
</body>
`, 
        };
        
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Gagal mengirim email' });
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Email untuk reset password telah dikirim',
                });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Gagal memproses permintaan lupa password' });
    }
};

// fungsi reset password
export const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
        // verifikasi JWT yang diterima
        const decoded = jwt.verify(resetToken, process.env.SECRET_KEY);

        // mencari user berdasarkan id dari token yang sudah diverifikasi
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        // validasi input
        if (!resetToken || !newPassword) {
            return res.status(400).json({
                status: false,
                message: 'Token reset dan password baru harus disertakan',
                error: 'Invalid input'
            });
        }

        // enkripsi password baru
        const encryptedPassword = await bcrypt.hash(newPassword, 10); 

        // update password di db
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: encryptedPassword,
            },
        });

        // emit ke /notifications setelah reset password berhasil
        notifications.emit('notification', {
            type: 'resetPassword',
            message: 'Password berhasil direset!',
        });

        return res.status(200).json({
            status: true,
            message: 'Password berhasil direset',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Gagal mereset password atau token tidak valid' });
    }
};