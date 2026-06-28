// ============================
//  CONFIGURACIÓN GLOBAL API
// ============================

const API_URL = "https://bolg-debora.onrender.com/api";

// GET genérico
async function apiGet(endpoint) {
  try {
    const res = await fetch(`${API_URL}/${endpoint}`);
    if (!res.ok) throw new Error(`Error GET /${endpoint}: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Error en apiGet:", err);
    return null;
  }
}

// POST genérico
async function apiPost(endpoint, data) {
  try {
    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error(`Error POST /${endpoint}: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Error en apiPost:", err);
    return null;
  }
}

// ============================
//  FUNCIONES PARA TU BLOG
// ============================

// Historias
async function crearHistorias() {
  const historias = await apiGet("historias");
  console.log("Historias:", historias);
  return historias;
}

// Reflexiones
async function crearReflexiones() {
  const reflexiones = await apiGet("reflexiones");
  console.log("Reflexiones:", reflexiones);
  return reflexiones;
}

// Contacto
async function enviarContacto(nombre, mensaje) {
  const respuesta = await apiPost("contacto", { nombre, mensaje });
  console.log("Contacto enviado:", respuesta);
  return respuesta;
}

// Login
async function login(email, password) {
  const respuesta = await apiPost("auth/login", { email, password });
  console.log("Login:", respuesta);
  return respuesta;
}

// ============================
//  PRUEBA DE CONEXIÓN
// ============================

async function probarConexion() {
  const health = await apiGet("health");
  console.log("Estado del servidor:", health);
}

probarConexion();


