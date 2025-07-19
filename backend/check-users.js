const User = require('./models/UserModel');
const connectDB = require('./config/database');

const checkUsers = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');
        
        const users = await User.find({}, 'name email role').limit(10);
        console.log('Users in database:');
        users.forEach(user => {
            console.log(`- Email: ${user.email}, Name: ${user.name}, Role: ${user.role}`);
        });
        
        console.log(`Total users: ${users.length}`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
