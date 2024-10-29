import Joi from 'joi';
import { Router } from 'express';
import { BankAccount } from '../services/bank_account.js';
import { authenticateJWT } from '../middlewares/token.js'

const router = Router();

/**
 * @swagger
 * @typedef BankAccount
 * @property {number} user_id.required - User's ID
 * @property {string} bank_name.required - User's bank name
 * @property {string} bank_account_number.required - User's bank account number
 * @property {number} balance.required - User's account balance
 */

// validasi data akun bank
const bankAccountSchema = Joi.object({
    user_id: Joi.number().required(),
    bank_name: Joi.string().required(),
    bank_account_number: Joi.string().required(),
    balance: Joi.number().default(0), 
});

/**
 * @swagger
 * @route POST /api/v1/accounts
 * @group Accounts - Operations about accounts
 * @param {BankAccount.model} bankAccount.body.required - Account data
 * @param {number} bankAccount.body.user_id.required - User's ID (e.g., 1)
 * @param {string} bankAccount.body.bank_name.required - User's bank name (e.g., "Bank Mandiri")
 * @param {string} bankAccount.body.bank_account_number.required - User's bank account number (e.g., "1234567890")
 * @param {number} bankAccount.body.balance.required - User's account balance (e.g., 10000)
 * @returns {object} 201 - Successfully created bank account
 * @returns {Error}  400 - Invalid input data
 * @returns {Error}  500 - Internal server error
 * @summary Create a new bank account
 */

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

/**
 * @swagger
 * @route GET /api/v1/accounts
 * @group Accounts - Operations about accounts
 * @returns {Array.<BankAccount>} 200 - List of accounts
 * @returns {Error} 500 - Internal server error
 * @summary Get all accounts
 */

// endpoint untuk menampilkan daftar akun
router.get('/', async (req, res, next) => {
    try {
        const accounts = await BankAccount.getAllAccounts();
        res.json(accounts);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * @route GET /api/v1/accounts/:accountId
 * @group Accounts - Operations about accounts
 * @param {integer} accountId.path.required - The ID of the account 
 * @returns {object} 200 - Account Detail
 * @returns {Error} 404 - Account not found
 * @returns {Error} 500 - Internal server error
 * @summary Get account detail by Account ID
 */

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

/**
 * @swagger
 * @route POST /api/v1/accounts/deposit
 * @group Accounts - Operations about accounts
 * @param {object} deposit.body.required - Deposit data
 * @param {integer} deposit.body.accountId.required - The ID of the account to deposit 
 * @param {number} deposit.body.amount.required - The amount to deposit (harus lebih besar dari nol)
 * @returns {object} 200 - Deposit Berhasil
 * @returns {Error} 400 - Jumlah deposit harus lebih besar dari nol
 * @returns {Error} 404 - Account not found
 * @returns {Error} 500 - Internal server error
 * @summary Deposit money into an account
 */

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

/**
 * @swagger
 * @route POST /api/v1/accounts/withdraw
 * @group Accounts - Operations about accounts
 * @param {object} withdraw.body.required - Withdraw data
 * @param {integer} withdraw.body.accountId.required - The ID of the account to withdraw 
 * @param {number} withdraw.body.amount.required - The amount to withdraw 
 * @returns {object} 200 - Penarikan saldo berhasil
 * @returns {Error} 400 - Jumlah penarikan harus lebih besar dari nol
 * @returns {Error} 400 - Saldo tidak mencukupi
 * @returns {Error} 404 - Account not found
 * @returns {Error} 500 - Internal server error
 * @summary Withdraw money into an account
 */

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

/**
 * @swagger
 * @route GET /api/v1/accounts/bank-account
 * @group Accounts - Operations about accounts
 * @returns {object} 200 - Successful 
 * @returns {Error} 403 - Forbidden - User does not have permission to view the bank account
 * @returns {Error} 404 - Account not found - The specified account does not exist
 * @returns {Error} 500 - Internal server error
 * @summary Retrieve bank account details for the authenticated user
 */

router.get('/bank-account', authenticateJWT, async (req, res) => {
    try {
        const accountId = req.user.id; 

        if (!req.user.permissions.includes('VIEW_BANK_ACCOUNT')) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const bankAccount = await BankAccount.findUnique({
            where: { id: accountId }
        });

        res.json(bankAccount);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


export default router;

/* note:
untuk endpoint deposit dan withdraw sudah dicoba menggunakan put dan "/:accountId/deposit (atau withdraw)"
tetapi tidak berhasil, tidak terupdate balancenya.
*/
