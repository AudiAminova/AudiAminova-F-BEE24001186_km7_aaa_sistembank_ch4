import { jest } from '@jest/globals';

import { BankAccount } from '../bank_account.js'; 
import { prisma } from '../../src/PrismaClient.js';

jest.mock('../../src/PrismaClient.js', () => ({
    prisma: {
        bankAccount: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
        },
    },
}));

describe('BankAccount Class', () => {

    // menguji fungsi create
    test('Membuat Akun Bank Baru', async() => {
        const user_id = 1;
        const bank_name = 'Bank Mandiri';
        const bank_account_number = '32011';
        const balance = 10000;

        const mockAccount = { 
            id: 1,
            user_id: user_id,
            bank_name: bank_name,
            bank_account_number: bank_account_number,
            balance: balance,
        };

        prisma.bankAccount.create.mockResolvedValue(mockAccount);

        const bankAccount = new BankAccount(user_id, bank_name, bank_account_number, balance);
        await bankAccount.create();

        expect(prisma.bankAccount.create).toHaveBeenCalledWith({
            data: { 
                user_id: 1,
                bank_name: 'Bank Mandiri', 
                bank_account_number: '32011', 
                balance: 10000,
            },
        });
        
        // memeriksa apakah id telah ditetapkan setelah pembuatan akun
        expect(bankAccount.id).toBe(mockAccount.id);
    });

    // menguji fungsi getProfile
    test('Mendapatkan Akun User Berdasarkan ID Akun', async() => {
        const user_id = 1;
        const bank_name = 'Bank Mandiri';
        const bank_account_number = '32011';
        const balance = 10000;

        const mockAccount = { 
            id: 1,
            user_id: user_id,
            bank_name: bank_name,
            bank_account_number: bank_account_number,
            balance: balance,
        };

        prisma.bankAccount.findUnique.mockResolvedValue(mockAccount);

        const bankAccount = await BankAccount.getAccount(1);

        expect(prisma.bankAccount.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
        });

        expect(bankAccount).toEqual(mockAccount);
    });

        // menguji fungsi getAllAccounts
        test('Mendapatkan Semua Akun Bank User', async() => {
            const mockAccounts = [
                { 
                    user_id: 1,
                    bank_name: 'Bank Mandiri', 
                    bank_account_number: '32011', 
                    balance: 10000,
                },
                { 
                    user_id: 2,
                    bank_name: 'Bank BRI', 
                    bank_account_number: '11023', 
                    balance: 20000,
                },
            ];

            prisma.bankAccount.findMany.mockResolvedValue(mockAccounts);
            
            const bankAccounts = await BankAccount.getAllAccounts();

            expect(prisma.bankAccount.findMany).toHaveBeenCalled();
            expect(bankAccounts).toEqual(mockAccounts);
    });

    // menguji fungsi updateBalance
    // deposit
    test('Memperbarui Saldo Akun (Deposit)', async () => {
        const accountId = 1;
        const newBalance = 15000;

        const mockUpdatedAccount = { 
            id: accountId,
            balance: newBalance,
        };

        prisma.bankAccount.update.mockResolvedValue(mockUpdatedAccount);

        const updatedAccount = await BankAccount.updateBalance(accountId, newBalance);

        expect(prisma.bankAccount.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { balance: newBalance },
        });

        expect(updatedAccount).toEqual(mockUpdatedAccount);
    });

});