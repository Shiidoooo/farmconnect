const baseURL = 'http://localhost:3002/api/admin';

// Test the User Management API endpoints
async function testUserManagement() {
    // You'll need a valid admin token for these tests
    const adminToken = 'your_admin_token_here'; // Replace with actual admin token
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
    };

    try {
        console.log('🧪 Testing User Management API endpoints...\n');

        // Test 1: Get user statistics
        console.log('1. Testing GET /api/admin/users/stats');
        const statsResponse = await fetch(`${baseURL}/users/stats`, { headers });
        const statsData = await statsResponse.json();
        console.log('✅ User Stats:', statsData);
        console.log('');

        // Test 2: Get all users
        console.log('2. Testing GET /api/admin/users');
        const usersResponse = await fetch(`${baseURL}/users?page=1&limit=10`, { headers });
        const usersData = await usersResponse.json();
        console.log('✅ Users List:', usersData);
        console.log('');

        // Test 3: Get specific user (if users exist)
        if (usersData.success && usersData.data.length > 0) {
            const userId = usersData.data[0]._id;
            console.log(`3. Testing GET /api/admin/users/${userId}`);
            const userResponse = await fetch(`${baseURL}/users/${userId}`, { headers });
            const userData = await userResponse.json();
            console.log('✅ User Details:', userData);
            console.log('');

            // Test 4: Update user status
            console.log(`4. Testing PUT /api/admin/users/${userId}/status`);
            const statusResponse = await fetch(`${baseURL}/users/${userId}/status`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status: 'active' })
            });
            const statusData = await statusResponse.json();
            console.log('✅ Status Update:', statusData);
        }

        console.log('🎉 All User Management API tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.log('\n📝 Note: Make sure to:');
        console.log('1. Replace "your_admin_token_here" with a valid admin JWT token');
        console.log('2. Ensure the backend server is running on port 3002');
        console.log('3. Have some users in your database for testing');
    }
}

// Instructions for manual testing
console.log(`
🚀 User Management System - Manual Testing Guide

Backend API Endpoints (with admin authentication):
┌─────────────────────────────────────────────────────────────┐
│ User Statistics                                             │
│ GET ${baseURL}/users/stats                    │
├─────────────────────────────────────────────────────────────┤
│ List All Users                                              │
│ GET ${baseURL}/users?page=1&limit=10         │
├─────────────────────────────────────────────────────────────┤
│ Get User Details                                            │
│ GET ${baseURL}/users/:userId                  │
├─────────────────────────────────────────────────────────────┤
│ Update User Status                                          │
│ PUT ${baseURL}/users/:userId/status           │
│ Body: { "status": "active" | "suspended" }                  │
├─────────────────────────────────────────────────────────────┤
│ Update User Info                                            │
│ PUT ${baseURL}/users/:userId                  │
├─────────────────────────────────────────────────────────────┤
│ Delete User                                                 │
│ DELETE ${baseURL}/users/:userId               │
└─────────────────────────────────────────────────────────────┘

Frontend Access:
🌐 Navigate to: http://localhost:8080/admin/users
📋 Features Available:
   • Real-time user statistics dashboard
   • Advanced search and filtering
   • User type detection (Customer/Seller)
   • Status management (Active/Suspended)
   • Detailed user information modals
   • CRUD operations with database connectivity

🔑 Admin Login Required:
   Make sure you're logged in as an admin to access the User Management section.
`);

// Uncomment to run the test (after adding valid admin token)
// testUserManagement();
