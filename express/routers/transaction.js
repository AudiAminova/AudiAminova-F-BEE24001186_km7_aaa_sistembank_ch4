import Joi from 'joi';
import { Router } from 'express';
import { Transaction } from '../services/transaction.js';
import { BankAccount } from '../services/bank_account.js';

const router = Router();

// validasi data transaksi
const transactionSchema = Joi.object({
    source_account_id: Joi.number().required(),
    destination_account_id: Joi.number().required(),
    amount: Joi.number().positive().required(),
});

// endpoint untuk mengirimkan uang dari satu akun ke akun lain
router.post('/', async (req, res, next) => {
    try {
        const { value, error } = transactionSchema.validate(req.body);
        if (error) {
            return next(error);
        }

        // cek akun sumber dan tujuan ada atau tidak
        const sourceAccount = await BankAccount.getAccount(value.source_account_id);
        const destinationAccount = await BankAccount.getAccount(value.destination_account_id);

        if (!sourceAccount || !destinationAccount) {
            return res.status(404).json({ message: 'Akun sumber atau tujuan tidak ditemukan' });
        }

        // cek saldo
        if (sourceAccount.balance < value.amount) {
            return res.status(400).json({ message: 'Saldo tidak mencukupi' });
        }

        const transaction = new Transaction(
            value.source_account_id,
            value.destination_account_id,
            value.amount,
        );

        await transaction.create();

        // update saldo akun
        sourceAccount.balance -= value.amount;
        destinationAccount.balance += value.amount;

        await sourceAccount.update();
        await destinationAccount.update();

        res.status(201).json({
            transaction_id: transaction.id,
            source_account_id: transaction.source_account_id,
            destination_account_id: transaction.destination_account_id,
            amount: transaction.amount,
        });
    } catch (error) {
        next(error);
    }
});

// endpoint untuk menampilkan daftar transaksi
router.get('/', async (req, res, next) => {
    try {
        const transactions = await Transaction.getAllTransactions(); 
        res.json(transactions);
    } catch (error) {
        next(error);
    }
});

// endpoint untuk menampilkan detail transaksi berdasarkan transactionId
router.get('/:transactionId', async (req, res, next) => {
    const transactionId = parseInt(req.params.transactionId);

    try {
        const transaction = await Transaction.getTransaction(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // mengambil detail akun sumber dan tujuan transaksi
        const sourceAccount = await BankAccount.getAccount(transaction.source_account_id);
        const destinationAccount = await BankAccount.getAccount(transaction.destination_account_id);

        res.json({ // mengirim respon JSON
            transaction_id: transaction.id,
            source_account: {
                id: sourceAccount.id,
                bank_name: sourceAccount.bank_name,
                bank_account_number: sourceAccount.bank_account_number,
            },
            destination_account: {
                id: destinationAccount.id,
                bank_name: destinationAccount.bank_name,
                bank_account_number: destinationAccount.bank_account_number,
            },
            amount: transaction.amount,
        });
    } catch (error) {
        next(error);
    }
});

export default router;

/* note:
kasusnya sama seperti insert data user dan profile,
A. saat insert data transaksi muncul pesan kesalahan seperti ini: TypeError: sourceAccount.update is not a function
    at file:///C:/Users/USER/binar/express/routers/transaction.js:48:29
POST /api/v1/transactions 500 46.038 ms - 35
B. meskipun terdapat pesan kesalahan, data transaksi berhasil masuk ke db tabel transaksi.
C. insert data user dan transaksi sudah saya coba perbaiki, tetapi masih error. */