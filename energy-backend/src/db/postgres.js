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
        
        const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        const createTelemetryTableQuery = `
        CREATE TABLE IF NOT EXISTS telemetry (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            device_id TEXT NOT NULL,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            power_consumption DECIMAL NOT NULL,
            voltage DECIMAL,
            global_intensity DECIMAL,
            occupancy INT DEFAULT 0,
            solar_generation DECIMAL DEFAULT 0,
            ev_charging INT DEFAULT 0,
            anomaly INT DEFAULT 0,
            global_reactive_power DECIMAL DEFAULT 0.1,
            sub1 DECIMAL DEFAULT 0,
            sub2 DECIMAL DEFAULT 0,
            sub3 DECIMAL DEFAULT 0,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
        
        const createSettingsTableQuery = `
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO settings (key, value) VALUES ('target_budget', '2500') ON CONFLICT (key) DO NOTHING;
        `;
        
        await client.query(createTableQuery);
        await client.query(createUsersTableQuery);
        await client.query(createTelemetryTableQuery);
        await client.query(createSettingsTableQuery);

        // --- Migration: Add missing columns if they don't exist ---
        const addColumnsQuery = `
            ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS voltage DECIMAL;
            ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS global_intensity DECIMAL;
            ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS occupancy INT DEFAULT 0;
            ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS solar_generation DECIMAL DEFAULT 0;
            ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS ev_charging INT DEFAULT 0;
            ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS anomaly INT DEFAULT 0;
            ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS global_reactive_power DECIMAL DEFAULT 0.1;
            ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS sub1 DECIMAL DEFAULT 0;
            ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS sub2 DECIMAL DEFAULT 0;
            ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS sub3 DECIMAL DEFAULT 0;
        `;
        await client.query(addColumnsQuery);
        
        console.log('[Postgres] Database initialization and migration complete.');
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
