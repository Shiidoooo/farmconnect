const bcrypt = require('bcryptjs');
const User = require('./models/UserModel');
const connectDB = require('./config/database');

const createTestAdmin = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');
        
        // Check if test admin already exists
        const existingUser = await User.findOne({ email: 'test@admin.com' });
        if (existingUser) {
            console.log('Test admin already exists');
            console.log('Email: test@admin.com');
            console.log('Password: testpass123');
            process.exit(0);
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('testpass123', salt);
        
        // Create admin user
        const adminUser = new User({
            name: 'Test Admin',
            email: 'test@admin.com',
            address: '123 Admin Street',
            phone_number: '+1234567890',
            password: hashedPassword,
            gender: 'prefer_not_to_say',
            dateOfBirth: new Date('1990-01-01'),
            role: 'admin'
        });
        
        await adminUser.save();
        
        console.log('✅ Test admin user created successfully!');
        console.log('📧 Email: test@admin.com');
        console.log('🔑 Password: testpass123');
        console.log('⚠️  Use these credentials for testing!');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating test admin:', error);
        process.exit(1);
    }
};

createTestAdmin();
