// ============================
//  CONFIGURACIÓN GLOBAL
// ============================

// URL base del backend en Render
const API_URL = "https://bolg-debora.onrender.com/api";

// Función genérica para hacer peticiones GET
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

// Función genérica para hacer peticiones POST
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
//  PRUEBA DE CONEXIÓN
// ============================

async function probarConexion() {
  const health = await apiGet("health");
  console.log("Estado del servidor:", health);
}

probarConexion();

// ============================
//  EJEMPLOS DE USO REAL
// ============================

// Obtener historias
async function cargarHistorias() {
  const historias = await apiGet("historias");
  console.log("Historias:", historias);
}

// Obtener reflexiones
async function cargarReflexiones() {
  const reflexiones = await apiGet("reflexiones");
  console.log("Reflexiones:", reflexiones);
}

// Enviar mensaje de contacto
async function enviarContacto(nombre, mensaje) {
  const respuesta = await apiPost("contacto", { nombre, mensaje });
  console.log("Contacto enviado:", respuesta);
}

// Login
async function login(email, password) {
  const respuesta = await apiPost("auth/login", { email, password });
  console.log("Login:", respuesta);
}

// ============================
//  LLAMADAS DE EJEMPLO
// ============================

// cargarHistorias();
// cargarReflexiones();
// enviarContacto("Roberto", "Hola, probando el backend!");
// login("correo@ejemplo.com", "123456");
