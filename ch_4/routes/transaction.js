import Joi from 'joi';
import { Router } from 'express';
import { Transaction } from '../services/transaction.js';
import { BankAccount } from '../services/bank_account.js';
import { prisma } from '../src/PrismaClient.js';

const router = Router();

/**
 * @swagger
 * @typedef Transaction
 * @property {number} source_account_id.required - The ID of the source account (User's ID)
 * @property {number} destination_account_id.required - The ID of the destination account
 * @property {number} amount.required - The amount to be transferred (harus lebih besar dari nol)
 */

// validasi data transaksi
const transactionSchema = Joi.object({
    source_account_id: Joi.number().required(),
    destination_account_id: Joi.number().required(),
    amount: Joi.number().positive().required(),
});

/**
 * @swagger
 * @route POST /api/v1/transactions
 * @group Transactions - Operations about transactions
 * @param {Transaction.model} transaction.body.required - Transaction data
 * @param {number} transaction.body.source_account_id.required - The ID of the source account
 * @param {number} transaction.body.destination_account_id.required - The ID of the destination account
 * @param {number} transaction.body.amount.required - The amount to transfer (must be greater than zero)
 * @returns {object} 201 - Successful transaction
 * @returns {Error} 400 - Saldo tidak mencukupi
 * @returns {Error} 404 - Akun sumber atau tujuan tidak ditemukan
 * @returns {Error} 500 - Internal server error
 * @summary Transfer money from one account to another account
 */ 

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
        await prisma.bankAccount.update({
            where: { id: value.source_account_id },
            data: { balance: sourceAccount.balance - value.amount },
        });

        await prisma.bankAccount.update({
            where: { id: value.destination_account_id },
            data: { balance: destinationAccount.balance + value.amount },
        });

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

/**
 * @swagger
 * @route GET /api/v1/transactions
 * @group Transactions - Operations about transactions
 * @returns {Array.<Transaction>} 200 - List of transactions
 * @returns {Error} 500 - Internal server error
 * @summary Get all transactions
 */ 

// endpoint untuk menampilkan daftar transaksi
router.get('/', async (req, res, next) => {
    try {
        const transactions = await Transaction.getAllTransactions(); 
        res.json(transactions);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * @route GET /api/v1/transactions/:transactionId
 * @group Transactions - Operations about transactions
 * @param {integer} transactionId.path.required - The ID of the transaction
 * @returns {object} 200 - Transaction detail
 * @returns {Error} 404 - Transaction not found
 * @returns {Error} 500 - Internal server error
 * @summary Get transaction detail by Transaction ID
 */ 

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
