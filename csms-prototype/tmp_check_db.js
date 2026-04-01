const mysql = require('mysql2/promise');

async function checkTables() {
  const DB_CONFIG = {
    host: 'localhost',
    port: 3308,
    user: 'root',
    password: '',
    database: 'smart-q'
  };
  try {
    const conn = await mysql.createConnection(DB_CONFIG);
    const [rows] = await conn.query('SHOW TABLES');
    console.log('Tables in smart-q:', rows);
    
    for (const row of rows) {
        const tableName = Object.values(row)[0];
        const [columns] = await conn.query(`DESCRIBE \`${tableName}\``);
        console.log(`\nColumns in ${tableName}:`, columns);
    }
    await conn.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkTables();
