import { prisma } from '../src/PrismaClient.js';
import bcrypt from 'bcrypt';

class User {
  id = null;
  name = null;
  email = null;
  password = null;

  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  // metode register untuk mendaftarkan user baru ke dalam database
  async register() {
    const encryptedPassword = await bcrypt.hash(this.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: this.name,
        email: this.email,
        password: encryptedPassword,
      },
    });
    this.id = newUser.id;
  }

  // metode getID untuk mengambil ID user setelah pendaftaran
  getID() {
    return this.id;
  }

  // metode getUser untuk mendapatkan user berdasarkan userId
  static async getUser(userId) {
    return await prisma.user.findUnique({
        where: { id: userId }, 
        include: {
          profile: true,
        }
    });
}

// metode getProfile mendapatkan profile user berdasarkan userId
static async getProfile(userId) {
  return await prisma.profile.findUnique({
      where: { id: userId }, 
      include: {user: true},
  });
}

  // metode getAllUsers untuk mendapatkan daftar semua user dalam aplikasi
  static async getAllUsers() {
    return await prisma.user.findMany();
  }

  // metode deleteUser untuk menghapus user berdasarkan userId
  static async deleteUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }

    // otomatis menghapus profil terkait jika onDelete: Cascade diatur
    return await prisma.user.delete({
    where: { id: userId },
    });
  }
}

export { User };
