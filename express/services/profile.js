import { prisma } from '../src/PrismaClient.js';

class Profile {
  id = null;
  user_id = null;
  identity_type = null;
  identity_number = null;
  address = null;

  constructor(user_id, identity_type, identity_number, address) {
    this.user_id = user_id;
    this.identity_type = identity_type;
    this.identity_number = identity_number;
    this.address = address;
  }

  // metode create digunakan untuk membuat profil baru di database
  async create() {
    return await prisma.profile.create({
      data: {
        identity_type: this.identity_type,
        identity_number: this.identity_number,
        address: this.address,
        userId: this.user_id,
      }
    });
  }

  // metode getProfile untuk mendapatkan profil pengguna berdasarkan userId
  static async getProfile(userId) {
    return await prisma.profile.findUnique({
      where: { user_id: userId },
      include: { user: true },
    });
  }
}

export { Profile };
