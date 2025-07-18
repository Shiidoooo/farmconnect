const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'do49zbqpz',
    api_key: process.env.CLOUDINARY_API_KEY || '196285846592929',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'YeTSGSsP8DZHL085KQItkvOrKYk',
});

// Test cloudinary connection
console.log('Cloudinary config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'do49zbqpz',
    api_key: process.env.CLOUDINARY_API_KEY || '196285846592929',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '[HIDDEN]' : '[FALLBACK]'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'UrbanFarmers', 
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

module.exports = {
    cloudinary,
    storage,
};
