const API_URL = 'http://localhost:3000';

async function runTest() {
  console.log("🔍 Iniciando Test de Verificación de Login y Caché (DB)...\n");

  const testUser = {
    firstName: "Test",
    lastName: "User",
    email: `test_cache_${Date.now()}@numerika.com`,
    password: "password123",
    institution: "UCASAL",
    role: "student"
  };

  let token = null;

  try {
    // 1. REGISTRO
    console.log(`[1] Registrando usuario temporal: ${testUser.email}`);
    const regRes = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const regData = await regRes.json();
    
    if (!regData.success) {
      console.log("⚠️ El registro falló (quizás ya existe):", regData.error);
    } else {
      console.log("✅ Registro exitoso!");
    }

    // 2. LOGIN
    console.log(`\n[2] Iniciando sesión con: ${testUser.email}`);
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const loginData = await loginRes.json();

    if (!loginData.success) {
      throw new Error(`Login falló: ${loginData.error}`);
    }
    token = loginData.token;
    console.log("✅ Login exitoso! Token obtenido.");

    // 3. VALIDAR CACHÉ (/me)
    console.log(`\n[3] Simulando recarga de página (Validando token con /api/auth/me)...`);
    const meRes = await fetch(`${API_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();

    if (!meData.success) {
      throw new Error(`Validación de token falló: ${meData.error}`);
    }
    console.log(`✅ Validación exitosa! El usuario '${meData.user.name}' persiste correctamente en la DB.`);

    // 4. VERIFICAR TABLA IKA_CHATS
    console.log(`\n[4] Verificando historial de IKA (Comprobando tabla ika_chats)...`);
    const ikaRes = await fetch(`${API_URL}/api/ai/chat/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const ikaData = await ikaRes.json();

    if (!ikaData.success) {
      throw new Error(`Consulta IKA falló: ${ikaData.error}`);
    }
    console.log(`✅ Consulta IKA exitosa! Historial obtenido: ${ikaData.history.length} mensajes.`);

    console.log("\n🎉 TODOS LOS TESTS PASARON CORRECTAMENTE. El problema de la caché está resuelto.");

  } catch (error) {
    console.error(`\n❌ ERROR EN EL TEST:`, error.message);
    console.log("\n💡 Asegurate de que el servidor esté corriendo en otra terminal ('npm run start:local') antes de ejecutar este script.");
  }
}

runTest();
