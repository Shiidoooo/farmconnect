const mongoose = require('mongoose');
const EWallet = require('./models/EwalletModel');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Demo e-wallet accounts to create
const demoAccounts = [
  {
    AccountNumer: '09123456789',
    AccountHolderName: 'John Doe',
    EwalletType: 'gcash',
    pin: '1234',
    AccountBalance: 5000,
    connectedUsers: [],
    isActive: true
  },
  {
    AccountNumer: '09987654321',
    AccountHolderName: 'Jane Smith',
    EwalletType: 'paymaya',
    pin: '5678',
    AccountBalance: 3000,
    connectedUsers: [],
    isActive: true
  },
  {
    AccountNumer: '1234567890',
    AccountHolderName: 'Bob Johnson',
    EwalletType: 'bdo',
    pin: '9999',
    AccountBalance: 7500,
    connectedUsers: [],
    isActive: true
  },
  {
    AccountNumer: 'paypal@example.com',
    AccountHolderName: 'Alice Brown',
    EwalletType: 'paypal',
    pin: '4321',
    AccountBalance: 2500,
    connectedUsers: [],
    isActive: true
  },
  {
    AccountNumer: '0987654321',
    AccountHolderName: 'Charlie Wilson',
    EwalletType: 'bpi',
    pin: '1111',
    AccountBalance: 4000,
    connectedUsers: [],
    isActive: true
  },
  {
    AccountNumer: '1111222333',
    AccountHolderName: 'Diana Lee',
    EwalletType: 'unionbank',
    pin: '2222',
    AccountBalance: 6000,
    connectedUsers: [],
    isActive: true
  }
];

async function createDemoAccounts() {
  try {
    console.log('Creating demo e-wallet accounts...');
    
    // Clear existing demo accounts (optional)
    // await EWallet.deleteMany({});
    
    for (const account of demoAccounts) {
      // Check if account already exists
      const existing = await EWallet.findOne({ AccountNumer: account.AccountNumer });
      if (!existing) {
        const newAccount = new EWallet(account);
        await newAccount.save();
        console.log(`✓ Created ${account.EwalletType} account: ${account.AccountNumer}`);
      } else {
        console.log(`- Account ${account.AccountNumer} already exists`);
      }
    }
    
    console.log('\n🎉 Demo accounts setup complete!');
    console.log('\nYou can now test the wallet functionality with these accounts:');
    console.log('================================================');
    
    demoAccounts.forEach(account => {
      console.log(`${account.EwalletType.toUpperCase()}:`);
      console.log(`  Account: ${account.AccountNumer}`);
      console.log(`  PIN: ${account.pin}`);
      console.log(`  Balance: $${account.AccountBalance}`);
      console.log('');
    });
    
    console.log('To connect these accounts:');
    console.log('1. Go to Profile → My Wallet');
    console.log('2. Click "Connect E-wallet"');
    console.log('3. Enter the account number and PIN from above');
    console.log('4. Start using cash in/out features!');
    
  } catch (error) {
    console.error('Error creating demo accounts:', error);
  } finally {
    mongoose.connection.close();
  }
}

createDemoAccounts();
