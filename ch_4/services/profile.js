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

  // metode create digunakan untuk membuat profile baru di database
  async create() {
    console.log('User ID:', this.user_id);  // debugging untuk cek user_id

    return await prisma.profile.create({
      data: {
        identity_type: this.identity_type,
        identity_number: this.identity_number,
        address: this.address,
        user: {
          connect: { id: this.user_id }
        },
      },
    });
  }

  // metode getProfile untuk mendapatkan profile pengguna berdasarkan userId
  static async getProfile(userId) {
    return await prisma.profile.findUnique({
      where: { user_id: userId },
      include: {
        user: true, 
      },
    });
  }

  // metode deleteProfile untuk mendapatkan profile pengguna berdasarkan userId
  static async deleteProfile(userId) {
    return await prisma.profile.delete({
        where: { user_id: userId },
    });
}
}

export { Profile };
