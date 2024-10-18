import { prisma } from '../src/PrismaClient.js';

class BankAccount {
  id = null;
  user_id = null;
  bank_name = null;
  bank_account_number = null;
  balance = 0;

  constructor(user_id, bank_name, bank_account_number, balance = 0) {
    this.user_id = user_id;
    this.bank_name = bank_name;
    this.bank_account_number = bank_account_number;
    this.balance = balance;
  }

  // metode create untuk membuat akun bank baru dalam database
  async create() {
    const newAccount = await prisma.bankAccount.create({
      data: {
        user_id: this.user_id,
        bank_name: this.bank_name,
        bank_account_number: this.bank_account_number,
        balance: this.balance,
      },
    });
    this.id = newAccount.id;
  }

  // metode getAccount untuk mengambil akun bank berdasarkan accountId
  static async getAccount(accountId) {
    return await prisma.bankAccount.findUnique({
      where: { id: accountId }, 
        });  
}

// metode getAllAcounts untuk mengambil semua akun bank yang ada dalam database
  static async getAllAccounts() {
    return await prisma.bankAccount.findMany({
        include: { user: true },
    });
}

// metode updateBalance untuk memperbarui saldo bank
  static async updateBalance(accountId, newBalance) {
    return await prisma.bankAccount.update({
      where: { id: accountId },
        data: { balance: newBalance },
    });
}
}

export { BankAccount };
