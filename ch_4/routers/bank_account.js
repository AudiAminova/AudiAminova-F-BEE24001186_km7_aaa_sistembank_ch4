import Joi from 'joi';
import { Router } from 'express';
import { BankAccount } from '../services/bank_account.js';

const router = Router();

// validasi data akun bank
const bankAccountSchema = Joi.object({
    user_id: Joi.number().required(),
    bank_name: Joi.string().required(),
    bank_account_number: Joi.string().required(),
    balance: Joi.number().default(0), 
});

// endpoint untuk menambahkan akun baru
router.post('/', async (req, res, next) => {
    try {
        const { value, error } = bankAccountSchema.validate(req.body);
        if (error) {
            return next(error);
        }

        const bankAccount = new BankAccount(value.user_id, value.bank_name, value.bank_account_number, value.balance); // membuat akun bank baru
        await bankAccount.create();

        res.status(201).json({
            account_id: bankAccount.id,
            user_id: bankAccount.user_id,
            bank_name: bankAccount.bank_name,
            bank_account_number: bankAccount.bank_account_number,
            balance: bankAccount.balance,
        });
    } catch (error) {
        next(error);
    }
});

// endpoint untuk menampilkan daftar akun
router.get('/', async (req, res, next) => {
    try {
        const accounts = await BankAccount.getAllAccounts();
        res.json(accounts);
    } catch (error) {
        next(error);
    }
});

// endpoint untuk menampilkan detail akun berdasarkan accountId
router.get('/:accountId', async (req, res, next) => {
    const accountId = parseInt(req.params.accountId);

    try {
        const account = await BankAccount.getAccount(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' }); // menangani akun bank yang tidak ditemukan
        }

        res.json({
            account_id: account.id,
            user_id: account.user_id,
            bank_name: account.bank_name,
            bank_account_number: account.bank_account_number,
            balance: account.balance,
        });
    } catch (error) {
        next(error);
    }
});

// endpoint untuk melakukan deposit
router.post('/deposit', async (req, res, next) => {
    const { accountId, amount } = req.body;
    
    if (amount <= 0) {
        return res.status(400).json({ message: 'Jumlah deposit harus lebih besar dari nol' });
    }

    try {
        const account = await BankAccount.getAccount(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // update balance
        account.balance += amount;
        await BankAccount.updateBalance(accountId, account.balance);

        res.json({
            message: 'Deposit Berhasil',
            account_id: account.id,
            new_balance: account.balance,
        });
    } catch (error) {
        next(error);
    }
});

// endpoint untuk melakukan withdraw
router.post('/withdraw', async (req, res, next) => {
    const { accountId, amount } = req.body;
    
    if (amount <= 0) {
        return res.status(400).json({ message: 'Jumlah penarikan harus lebih besar dari nol' });
    }

    try {
        const account = await BankAccount.getAccount(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // cek saldo
        if (account.balance < amount) {
            return res.status(400).json({ message: 'Saldo tidak mencukupi' });
        }

        // update saldo
        account.balance -= amount;
        await BankAccount.updateBalance(accountId, account.balance);

        res.json({
            message: 'Penarikan Saldo Berhasil',
            account_id: account.id,
            new_balance: account.balance,
        });
    } catch (error) {
        next(error);
    }
});

export default router;

/* note:
untuk endpoint deposit dan withdraw sudah dicoba menggunakan put dan "/:accountId/deposi (atau withdraw)"
tetapi tidak berhasil, tidak terupdate balancenya
*/
