require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

async function run() {
  console.log('[Migrate] Conectando a PostgreSQL...');
  const client = await pool.connect();

  try {
    // Crear tabla de control de migraciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    const migrationsDir = path.resolve(__dirname);
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const { rows: executed } = await client.query(
      'SELECT filename FROM _migrations'
    );
    const executedSet = new Set(executed.map((r) => r.filename));

    for (const file of files) {
      if (executedSet.has(file)) {
        console.log(`[Migrate] ${file} — ya ejecutada, saltando`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`[Migrate] Ejecutando ${file}...`);
      await client.query(sql);

      await client.query(
        'INSERT INTO _migrations (filename) VALUES ($1)',
        [file]
      );
      console.log(`[Migrate] ${file} — OK`);
    }

    console.log('[Migrate] Todas las migraciones aplicadas.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('[Migrate] Error:', err.message);
  process.exit(1);
});
