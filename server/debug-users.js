const { sequelize } = require('./src/config/db');
const User = require('./src/models/User');

async function showUsers() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true }); // Ensure columns are created
        
        let users = await User.findAll({
            attributes: ['username', 'email']
        });

        if (users.length === 0) {
            console.log('No users found. Creating a dummy admin user...');
            await User.create({
                username: 'admin',
                email: 'admin@example.com',
                password: 'password123'
            });
            users = await User.findAll({
                attributes: ['username', 'email']
            });
        }

        console.log('--- DUMMY USER DETAILS ---');
        console.log(JSON.stringify(users, null, 2));
        console.log('--------------------------');
        process.exit(0);
    } catch (err) {
        console.error('Error fetching users:', err);
        process.exit(1);
    }
}

showUsers();