require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing Supabase Connection...\n');

console.log('Configuration:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('Password set:', process.env.DB_PASSWORD ? 'Yes' : 'No');
console.log('\n');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Connection FAILED:');
        console.error(err.message);
    } else {
        console.log('✅ Connection SUCCESSFUL!');
        console.log('Server time:', res.rows[0].now);
    }
    pool.end();
});
