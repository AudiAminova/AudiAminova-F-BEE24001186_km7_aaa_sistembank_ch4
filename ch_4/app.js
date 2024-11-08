import express from 'express';
import morgan from 'morgan';
import path from 'path';
import userRoutes from './routes/user.js';
import bankAccountRoutes from './routes/bank_account.js';
import profileRoutes from './routes/profile.js';
import transactionRoutes from './routes/transaction.js';
import authRoutes from './routes/authRoutes.js';
import session from 'express-session';
import flash from 'express-flash';
import passport from 'passport';
import './src/passport-setup.js';
import swaggerSetup from './swagger.js';
import dotenv from 'dotenv';
import mediaRouter from './routes/media.routes.js'; 


dotenv.config();
const app = express();
const port = process.env.PORT || 4000; 

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'ejs');
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use('/images', express.static('public/images'));

swaggerSetup(app);

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/accounts', bankAccountRoutes);
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/images', mediaRouter)

// error handling
app.use((err, req, res) => {
    console.error(err.stack);
    if (err.isJoi) {
      res.status(400).json({
        message: err.message
      });
    } else {
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  });

// untuk memberikan pesan flash ke response
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg') || ''; 
  res.locals.error_msg = req.flash('error_msg') || '';  
  console.log('Error message:', res.locals.error_msg); 
  next();
});

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  }),
);
  
  app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
    console.log(`API Documentation available at http://localhost:${port}/api-docs`);
  });

export default app;