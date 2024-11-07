import Joi from 'joi';
import { Router } from 'express';
import multer from 'multer';
import { MediaImage } from '../services/media.js';

const router = Router();
const upload = multer(); // menggunakan multer tanpa penyimpanan untuk mendapatkan file dalam buffer

// validasi MediaImage
const MediaImageSchema = Joi.object({
  title: Joi.string().optional().max(255), 
  description: Joi.string().optional().max(1000), 
  image: Joi.object({
    mimetype: Joi.string().valid('image/jpeg', 'image/png').required(), 
  }).optional(),
});

/**
 * @swagger
 * @route POST /api/v1/images
 * @group Media - Operations about media images
 * @param {string} title.body.optional - The title of the image 
 * @param {string} description.body.optional - The description of the image 
 * @param {file} image.body.required - The image file to upload (JPEG or PNG)
 * @returns {object} 201 -Gambar berhasil diunggah
 * @returns {Error}  400 - Upload failed
 * @returns {Error}  500 - Internal server error
 * @summary Upload a new image
 */
// endpoint untuk mengupload gambar
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { error } = MediaImageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        message: error.details[0].message,
      });
    }

    const newImage = await MediaImage.uploadImage(req);
    res.status(201).json({
      status: true,
      message: "Gambar berhasil diunggah",
      data: newImage,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

/**
 * @swagger
 * @route GET /api/v1/images
 * @group Media - Operations about media images
 * @returns {Array.<object>} 200 - List of all images
 * @returns {Error}  500 - Internal server error
 * @summary Get a list of all images
 */
// endpoint untuk mendapatkan daftar gambar
router.get('/', async (req, res) => {
  try {
    const images = await MediaImage.getAllImages();
    res.status(200).json({
      status: true,
      message: "Daftar gambar berhasil diambil",
      data: images,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

/**
 * @swagger
 * @route GET /api/v1/images/:id
 * @group Media - Operations about media images
 * @param {integer} id.path.required - Image ID
 * @returns {object} 200 - Detail gambar berhasil diambil
 * @returns {Error}  404 - Gagal mengambil daftar gambar
 * @returns {Error}  500 - Internal server error
 * @summary Get details of a specific image by ID
 */
// endpoint untuk mendapatkan detail gambar berdasarkan ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const image = await MediaImage.getImage(id);
    res.status(200).json({
      status: true,
      message: "Detail gambar berhasil diambil",
      data: image,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

/**
 * @swagger
 * @route DELETE /api/v1/images/:id
 * @group Media - Operations about media images
 * @param {integer} id.path.required - Image ID
 * @returns {null} 204 - Image successfully deleted
 * @returns {Error}  404 - Image not found
 * @returns {Error}  500 - Internal server error
 * @summary Delete an image by ID
 */
// endpoint untuk menghapus gambar berdasarkan ID
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  console.log(`ID yang diterima: ${id}`); 
  try {
    const deleteImage = await MediaImage.deleteImage(id);
    if (!deleteImage) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * @route PUT /api/v1/images/:id
 * @group Media - Operations about media images
 * @param {integer} id.path.required - Image ID
 * @param {string} title.body.optional - The new title of the image 
 * @param {string} description.body.optional - The new description of the image 
 * @returns {object} 200 - Gambar berhasil diperbarui
 * @returns {Error}  400 - Gagal memperbarui gambar
 * @returns {Error}  500 - Internal server error
 * @summary Update an image's title and description
 */
// endpoint untuk memperbarui judul dan deskripsi gambar
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const { error } = MediaImageSchema.validate({ title, description });
  if (error) {
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }

  try {
    const updatedImage = await MediaImage.updateImage(id, title, description);
    res.status(200).json({
      status: true,
      message: "Gambar berhasil diperbarui",
      data: updatedImage,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

export default router;
