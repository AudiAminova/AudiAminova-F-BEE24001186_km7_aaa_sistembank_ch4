// middleware untuk autentikasi menggunakan JSON Web Tokens (JWT)
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // mengambil token dari header Authorization
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if (err) {
                return res.sendStatus(403); 
            }
            req.user = user;
            next(); 
        });
    } else {
        res.sendStatus(401); 
    }
};
