import { prisma } from '../src/PrismaClient.js';

class Transaction {
  id = null;
  source_account_id = null;
  destination_account_id = null;
  amount = null;

  constructor(source_account_id, destination_account_id, amount) {
    this.source_account_id = source_account_id;
    this.destination_account_id = destination_account_id;
    this.amount = amount;
  }

  // metode create untuk membuat transaksi baru dalam database
  async create() {
    const newTransaction = await prisma.transaction.create({
      data: {
        source_account_id: this.source_account_id,
        destination_account_id: this.destination_account_id,
        amount: this.amount,
      },
    });
    this.id = newTransaction.id;
  }

  // metode getTransaction untuk mengambil detail transaksi berdasarkan transactionId
  static async getTransaction(transactionId) {
    return await prisma.transaction.findUnique({
      where: { id: transactionId },
    });
  }

  // metode getAllTransactions ntuk mengambil semua transaksi yang ada dalam database
  static async getAllTransactions() {
    return await prisma.transaction.findMany(); 
  }
}

export { Transaction };
