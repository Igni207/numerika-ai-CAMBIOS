# NumérikaAI — Guía de Ejecución Local

## 📋 Requisitos Previos

| Herramienta | Versión mínima | Verificar |
|-------------|---------------|-----------|
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **Python** | 3.11+ | `python --version` |
| **Git** | 2.x | `git --version` |

> **IMPORTANTE:** Vas a necesitar 3 terminales abiertas simultáneamente (una para cada servicio).

---

## 🎯 Minimum Requerido (2 servicios)

Con esto podés usar el Solver, la Calculadora y todas las herramientas matemáticas.

### Terminal 1: Frontend (React + Vite)

```bash
# Abrir TERMINAL 1
# Navegar a la carpeta del proyecto
cd numerika-ai

# Instalar dependencias (solo la primera vez)
npm install

# Copiar archivo de ejemplo de variables de entorno
cp .env.example .env
```

**Editar `.env` y reemplazar los valores:**
```env
VITE_API_URL=http://localhost:3000
```

```bash
# Iniciar el servidor de desarrollo
npm run dev
# Abrir en navegador: http://localhost:5173
```

---

### Terminal 2: Motor Matemático (Python + FastAPI)

```bash
# Abrir TERMINAL 2
cd numerika-ai/backend

# Crear entorno virtual (solo la primera vez)
python -m venv venv

# Activar entorno virtual:
#   → Windows (PowerShell):
.\venv\Scripts\activate
#   → Windows (CMD):
venv\Scripts\activate.bat
#   → macOS/Linux:
source venv/bin/activate
```

```bash
# (solo la primera vez)
pip install -r requirements.txt

# Iniciar el motor matemático
python numerika_math_engine.py
# Queda corriendo en: http://localhost:8000
```

**Verificar que funciona (en otra terminal o con tu browser):**
```bash
curl http://localhost:8000/health
# Debe responder: {"status":"healthy","service":"NumérikaAI Math Engine",...}
```

---

## ✅ Setup Completo (3 servicios)

Para usar login/register, guardar datos y chat con IA.

### Terminal 3: Backend Express (Node.js + PostgreSQL)

> **Nota:** Requiere tener PostgreSQL corriendo (ver sección Docker más abajo).

```bash
# Abrir TERMINAL 3
cd numerika-ai

# Completar archivo .env con todos los datos:
cp .env.example .env
```

**Editar `.env` con tus credenciales:**
```env
PORT=3000
DATABASE_URL=postgresql://tu_usuario:tu_password@localhost:5432/tu_base_de_datos
JWT_SECRET=cambia_esto_en_produccion
OPENAI_API_KEY=sk-tu-key-aqui
VITE_API_URL=http://localhost:3000
```

```bash
# Iniciar servidor Express
npm start
# Queda corriendo en: http://localhost:3000
```

---

## 🐳 Docker (Alternativa: Base de Datos)

Si tenés Docker instalado, podés levantar PostgreSQL y Redis con un solo comando:

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Servicios que se levantan:
# - PostgreSQL   → localhost:5432
# - Redis        → localhost:6379
```

**Ver logs:**
```bash
docker-compose logs -f
```

**Detener todo:**
```bash
docker-compose down
```

---

## 📡 Resumen de Puertos

| Servicio | Puerto | Descripción | ¿Obligatorio? |
|----------|--------|-------------|---------------|
| **Vite Dev Server** | `5173` | Frontend React | ✅ Sí |
| **Math Engine** | `8000` | Motor matemático (FastAPI) | ✅ Sí |
| **Express API** | `3000` | Auth + IA (Node.js) | ❌ Opcional |
| **PostgreSQL** | `5432` | Base de datos | ❌ Opcional (solo si usás Express) |
| **Redis** | `6379` | Cache (futuro) | ❌ Opcional |

---

## 📌 Rutas Disponibles

| Ruta | Página | Requiere Auth |
|------|--------|---------------|
| `/` | Home | No |
| `/solver` | Solver de métodos numéricos | No |
| `/solver/:methodId` | Solver con método pre-seleccionado | No |
| `/comparar` | Comparación de métodos | No |
| `/metodos` | Lista de métodos disponibles | No |
| `/aplicaciones` | Aplicaciones de métodos numéricos | No |
| `/aplicaciones/:appId` | Aplicación específica | No |
| `/calculadora` | Calculadora simbólica (Motor Matemático) | No |
| `/register` | Registro de usuario | No |
| `/login` | Inicio de sesión | No |

---

## 🧪 Testing del Motor Matemático

```bash
# Derivada
curl -X POST http://localhost:8000/api/math/derive \
  -H "Content-Type: application/json" \
  -d '{"expression":"x^2 + 3*x", "variable":"x"}'
# → {"latex":"2 x + 3", "plain":"2*x + 3", ...}

# Integral
curl -X POST http://localhost:8000/api/math/integrate \
  -H "Content-Type: application/json" \
  -d '{"expression":"x^2", "variable":"x"}'
# → {"latex":"\\frac{x^{3}}{3} + C", ...}

# Resolver ecuación
curl -X POST http://localhost:8000/api/math/solve \
  -H "Content-Type: application/json" \
  -d '{"equation":"x^2 - 4 = 0", "variable":"x"}'
# → {"solutions":[{"latex":"-2"},{"latex":"2"}], "count":2, ...}

# Simplificar
curl -X POST http://localhost:8000/api/math/simplify \
  -H "Content-Type: application/json" \
  -d '{"expression":"(x^2 - 1)/(x - 1)", "variable":"x"}'

# Factorizar
curl -X POST http://localhost:8000/api/math/factorize \
  -H "Content-Type: application/json" \
  -d '{"expression":"x^2 + 5*x + 6", "variable":"x"}'

# Validar sintaxis
curl -X POST http://localhost:8000/api/math/validate \
  -H "Content-Type: application/json" \
  -d '{"expression":"x^2 + 3*x"}'
```

---

## ⚠️ Troubleshooting

### "Port 5173 already in use"
```bash
# Encontrar y matar el proceso
npx kill-port 5173
```

### "Port 8000 already in use"
```bash
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### "NetworkError when attempting to fetch resource" en Calculadora
El motor matemático no está corriendo. Inicialo con:
```bash
cd backend && .\venv\Scripts\activate && python numerika_math_engine.py
```

### CORS errors en el browser
Asegurate de que el motor matemático esté corriendo en `http://localhost:8000` y que CORS esté habilitado (ya viene configurado por defecto).

### "Cannot find module 'sympy'" o errores de Python
```bash
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```
