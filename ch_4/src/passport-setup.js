import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { authUser } from '../controllers/authController.js';

// inisialisasi passport
passport.use(new LocalStrategy(
    { usernameField: 'email' }, 
    authUser 
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
});
