import express from 'express';
import morgan from 'morgan';
import path from 'path';
import userRoutes from './routers/user.js';
import bankAccountRoutes from './routers/bank_account.js';
import profileRoutes from './routers/profile.js';
import transactionRoutes from './routers/transaction.js';

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'ejs');

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/accounts', bankAccountRoutes);
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/transactions', transactionRoutes);

// error handling
app.use((err, req, res, next) => {
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
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });