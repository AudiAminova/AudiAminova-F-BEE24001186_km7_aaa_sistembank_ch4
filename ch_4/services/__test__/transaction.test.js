import { expect, jest } from '@jest/globals';

import { Transaction } from '../transaction.js'; 
import { prisma } from '../../src/PrismaClient.js';

jest.mock('../../src/PrismaClient.js', () => ({
    prisma: {
        transaction: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

describe('BankAccount Class', () => {
    
    // menguji fungsi create
    test('Membuat Transaksi Baru', async() => {
        const source_account_id = 1;
        const destination_account_id = 2;
        const amount = 15000;

        const mockTrans = {
            id: 1,
            source_account_id: source_account_id,
            destination_account_id: destination_account_id,
            amount: amount,
        };

        prisma.transaction.create.mockResolvedValue(mockTrans);

        const transaction = new Transaction(source_account_id, destination_account_id, amount);
        await transaction.create();

        expect(prisma.transaction.create).toHaveBeenCalledWith({
            data: {
                source_account_id: 1,
                destination_account_id: 2,
                amount: 15000,
            },
        });

        expect(transaction.id).toBe(mockTrans.id);
    });

    // menguji fungsi getTransaction
    test('Mengambil Detail Transaksi Berdasarkan ID Transaksi', async() => {
        const source_account_id = 1;
        const destination_account_id = 2;
        const amount = 15000;

        const mockTrans = {
            id: 1,
            source_account_id: source_account_id,
            destination_account_id: destination_account_id,
            amount: amount,
        };

        prisma.transaction.findUnique.mockResolvedValue(mockTrans);

        const transaction = await Transaction.getTransaction(1);

        expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
        });

        expect(transaction).toEqual(mockTrans);
    });

    // menguji fungsi getAllTransactions
    test('Mengambil Semua Transaksi', async() => {
        const mockTrans = [
            {
                source_account_id: 1,
                destination_account_id: 2,
                amount: 15000,
            },
            {
                source_account_id: 3,
                destination_account_id: 10,
                amount: 250000,
            },
        ];

        prisma.transaction.findMany.mockResolvedValue(mockTrans);

        const transaction = await Transaction.getAllTransactions();

        expect(prisma.transaction.findMany).toHaveBeenCalled();
        expect(transaction).toEqual(mockTrans);
    });
});
