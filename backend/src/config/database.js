// Importa la clase Pool de la librería pg (PostgreSQL) para manejar conexiones a la base de datos
const { Pool } = require('pg');

// Crea un pool de conexiones usando la URL de conexión desde las variables de entorno
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // En producción (Render) habilita SSL con certificado no verificado; en local lo deshabilita
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// Escucha el evento 'error' del pool para capturar errores inesperados en las conexiones
pool.on('error', (err) => {
  // Muestra el error en la consola del servidor
  console.error('[DB] Error inesperado en el pool:', err.message);
});

// Exporta el pool para que otros módulos puedan hacer consultas a la base de datos
module.exports = pool;
