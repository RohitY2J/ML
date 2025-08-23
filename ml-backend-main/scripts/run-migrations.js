const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const connectionString = 'postgresql://stock_market_n30o_user:eaArot1NbNChhTdpiR2IBEvhjCjlOWyJ@dpg-d0rf013uibrs73d67big-a.singapore-postgres.render.com:5432/stock_market_n30o?sslmode=require';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigrations() {
  try {
    await client.connect();
    console.log('Connected to database');

    const initDir = path.join(__dirname, '..', 'init');
    const files = fs.readdirSync(initDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`\nRunning migration: ${file}`);
      const filePath = path.join(initDir, file);
      
      try {
        // Use psql command for files that might contain meta-commands
        const { stdout, stderr } = await execPromise(`PGPASSWORD=eaArot1NbNChhTdpiR2IBEvhjCjlOWyJ psql -h dpg-d0rf013uibrs73d67big-a.singapore-postgres.render.com -U stock_market_n30o_user -d stock_market_n30o -f ${filePath}`);
        
        if (stderr) {
          console.error(`Warning from ${file}:`, stderr);
        }
        console.log(`✅ Successfully executed ${file}`);
      } catch (err) {
        console.error(`❌ Error executing ${file}:`, err.message);
        throw err;
      }
    }

    console.log('\nAll migrations completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations(); 