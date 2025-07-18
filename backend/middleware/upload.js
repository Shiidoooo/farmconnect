const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Configure multer with file size limits and better error handling
const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        fieldSize: 1 * 1024 * 1024 // 1MB for text fields
    },
    fileFilter: (req, file, cb) => {
        console.log('File filter called with:', file);
        
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
        }
    }
});

module.exports = upload;
