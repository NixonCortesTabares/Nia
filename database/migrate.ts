  import { Pool } from 'pg';
  import * as fs from 'fs';
  import * as path from 'path';
  import dotenv from 'dotenv';

  dotenv.config({
    path: path.resolve(process.cwd(), '../server/.env'),
  });
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  async function migrate() {
    // Crear tabla de control si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migration_history (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        ejecutado_en TIMESTAMP DEFAULT NOW()
      )
    `);

    const migrationsDir = path.resolve(process.cwd(), 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    // Obtener migraciones ya ejecutadas
    const result = await pool.query(
      'SELECT filename FROM migration_history'
    );
    const ejecutadas = new Set(result.rows.map((r: {filename: string}) => r.filename));

    const pendientes = files.filter(f => !ejecutadas.has(f));

    if (pendientes.length === 0) {
      console.log('✅ No hay migraciones pendientes');
      await pool.end();
      return;
    }

    console.log(`📦 Ejecutando ${pendientes.length} migraciones pendientes...`);

    for (const file of pendientes) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      try {
        await pool.query(sql);
        await pool.query(
          'INSERT INTO migration_history (filename) VALUES ($1)',
          [file]
        );
        console.log(`✅ ${file}`);
      } catch (error: any) {
        console.error(`❌ ${file}: ${error.message}`);
        process.exit(1);
      }
    }

    console.log('🎉 Migraciones completadas');
    await pool.end();
  }

  migrate();