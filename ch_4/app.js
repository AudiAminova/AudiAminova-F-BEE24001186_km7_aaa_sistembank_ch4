import "./src/instrument.js";
import * as Sentry from '@sentry/node';
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
import { createServer } from 'node:http';
import { Server } from 'socket.io';

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server);
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

// route untuk root
app.get('/', (req, res) => {
  res.send('Selamat Datang');
});

app.get('/notifications', (req, res) => {
  res.render('socket'); 
});

const notifications = io.of('/notifications');

// handling koneksi Socket.io
notifications.on('connection', (socket) => {
  console.log('A user connected to /notifications');

  socket.on('disconnect', () => {
      console.log('A user disconnected from /notifications');
  });
});


app.use('/api/v1/users', userRoutes);
app.use('/api/v1/accounts', bankAccountRoutes);
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/images', mediaRouter);

app.get("/debug-sentry", function mainHandler() {
  throw new Error("My first Sentry error!");
});

// error handling
app.use((err, req, res, next) => { 
  console.error(err.stack);
  Sentry.captureException(err); // mengirim error ke Sentry secara manual
  if (err.isJoi) {
    res.status(400).json({
      message: err.message
    });
  } else {
    res.status(500).json({
      message: 'Internal Server Error',
    });

    res.end(res.Sentry + "\n");
  }
  next();
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
  
  server.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
    console.log(`API Documentation available at http://localhost:${port}/api-docs`);
  });

export { notifications };
export default app;