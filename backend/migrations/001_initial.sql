-- ============================================
-- Migración inicial — Blog de Débora
-- ============================================

-- Tabla: usuarios (admin del blog)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: historias (Debbie's News)
CREATE TABLE IF NOT EXISTS historias (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  texto TEXT NOT NULL,
  imagen_url VARCHAR(500),
  imagen_public_id VARCHAR(255),
  destacada BOOLEAN DEFAULT FALSE,
  activa BOOLEAN DEFAULT TRUE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: reflexiones
CREATE TABLE IF NOT EXISTS reflexiones (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  imagen_url VARCHAR(500),
  imagen_public_id VARCHAR(255),
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: fotos (galería)
CREATE TABLE IF NOT EXISTS fotos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255),
  descripcion TEXT,
  url VARCHAR(500) NOT NULL,
  public_id VARCHAR(255) NOT NULL,
  orden INTEGER DEFAULT 0,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: configuracion (datos dinámicos del blog)
CREATE TABLE IF NOT EXISTS configuracion (
  id SERIAL PRIMARY KEY,
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_historias_fecha ON historias(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_historias_destacada ON historias(destacada) WHERE destacada = TRUE;
CREATE INDEX IF NOT EXISTS idx_reflexiones_fecha ON reflexiones(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_fotos_orden ON fotos(orden ASC);
