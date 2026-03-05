require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'energy_user',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'smart_home_energy',
  password: process.env.POSTGRES_PASSWORD || 'energy_pass',
  port: process.env.POSTGRES_PORT || 5432,
});

    const initDB = async () => {
    const client = await pool.connect();
    try {
        console.log('[Postgres] Ensuring device_usage_sessions table exists...');
        
        // Create the sessions table if it doesn't already exist
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS device_usage_sessions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            device_id TEXT NOT NULL,
            power_rating_watts INT NOT NULL,
            turned_on_at TIMESTAMP NOT NULL,
            turned_off_at TIMESTAMP NOT NULL,
            duration_seconds INT NOT NULL,
            energy_kwh DECIMAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
        
        await client.query(createTableQuery);
        console.log('[Postgres] Database initialization complete.');
    } catch (err) {
        console.error('[Postgres] Initialization Error:', err);
    } finally {
        client.release();
    }
    };

    module.exports = {
    query: (text, params) => pool.query(text, params),
    initDB,
    pool,
    };
