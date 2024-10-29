import jwt from 'jsonwebtoken';

export const restrict = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token not provided' });
    }

    // memvalidasi token
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Unauthorized: Token invalid' });
        }
        req.user = user; // menyimpan informasi user ke dalam request
        next(); 
    });
};
