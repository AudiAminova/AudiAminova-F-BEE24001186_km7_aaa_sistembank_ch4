import imagekit from '../middlewares/imagekit.js';
import { prisma } from '../src/PrismaClient.js';

class MediaImage {
  id = null;
  title = null;
  description = null;
  image_url = null;

  constructor(title, description, image_url = null) {
    this.title = title;
    this.description = description;
    this.image_url = image_url;
  }

  // metode imagekitUpload untuk mengunggah gambar menggunakan ImageKit
  static async imagekitUpload(req) {
    try {
      const stringFile = req.file.buffer.toString("base64");

      const uploadFile = await imagekit.upload({
        fileName: req.file.originalname,
        file: stringFile,
      });

      return uploadFile; // mengembalikan data uploadFile
    } catch (err) {
      throw new Error("Upload failed: " + err.message);
    }
  }

  // metode uploadImage untuk mengupload gambar ke database dan ImageKit
  static async uploadImage(req) {
    const { title, description } = req.body;

    try {
      const uploadFile = await this.imagekitUpload(req);
      const imageUrl = uploadFile.url; // mendapatkan URL gambar

      const newImage = await prisma.image.create({
        data: {
          title,
          description,
          image_url: imageUrl,
        }
      });

      return newImage;
    } catch (error) {
      throw new Error("Gambar gagal diunggah: " + error.message);
    }
  }

  // metode getImages untuk mendapatkan daftar gambar
  static async getAllImages() {
    try {
      return await prisma.image.findMany();
    } catch (error) {
      throw new Error("Gagal mengambil daftar gambar: " + error.message);
    }
  }

  // metode getDetail untuk mendapatkan detail gambar berdasarkan ID
  static async getImage(id) {
    try {
      const image = await prisma.image.findUnique({
        where: {
          id: parseInt(id),
        }
      });

      if (!image) {
        throw new Error("Gambar tidak ditemukan");
      }

      return image;
    } catch (error) {
      throw new Error("Gagal mengambil detail gambar: " + error.message);
    }
  }

  // metode deleteImage untuk menghapus gambar
  static async deleteImage(id) {
  try {
    console.log(`ID yang diterima: ${id}`);  

    return await prisma.image.delete({
      where: { id: parseInt(id, 10) },  
    });
  } catch (error) {
    throw new Error("Gagal menghapus gambar: " + error.message);
  }
}


  // metode updateImage untuk mengedit judul dan deskripsi gambar
  static async updateImage(id, title, description) {
    try {
      const updatedImage = await prisma.image.update({
        where: { id: parseInt(id) },
        data: { title, description },
      });

      return updatedImage;
    } catch (error) {
      throw new Error("Gagal memperbarui gambar: " + error.message);
    }
  }
}

export { MediaImage };
