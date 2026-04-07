<p align="center">
  <strong>NumérikaAI</strong><br/>
  <em>Métodos numéricos que se entienden.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/OpenAI-API-412991?logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

## ¿Qué es NumérikaAI?

**NumérikaAI** es una plataforma web educativa en español diseñada para ayudar a estudiantes de ingeniería a **comprender** los métodos numéricos — no solo calcularlos. Combina resolución interactiva paso a paso con inteligencia artificial (OpenAI) para explicar *por qué* cada método converge, diverge o falla.

> **Visión:** Ser la plataforma de referencia en Latinoamérica para el aprendizaje de métodos numéricos — en español, gratuita y desde cualquier dispositivo.

---

## ✨ Características principales

### 🧮 Solver interactivo
- **Métodos numéricos** implementados: Bisección, Regla Falsa, Newton-Raphson, Secante y Punto Fijo
- Tabla de iteraciones paso a paso con convergencia visual
- Gráfico interactivo de f(x) con la raíz marcada (Recharts)
- Detección automática de raíces múltiples en el dominio
- Guía desplegable con procedimiento y ejemplo de cálculo por método

### 📊 Comparador de métodos
- Ejecuta los 4 métodos principales simultáneamente para la misma función
- Tabla comparativa con iteraciones, raíz, error final, tiempo y estado
- **Gráfico de barras de tiempo de ejecución** (ms) por método
- **Gráfico de barras de cantidad de iteraciones** por método
- Colores únicos por método e indicador especial para métodos con error

### 🤖 Inteligencia Artificial integrada (En Desarrollo)
- **Explicaciones automáticas:** Después de cada cálculo, la IA analiza el resultado y genera una explicación didáctica en español
- **IKA** (Asistente contextual): Chat persistente con IA que conoce en qué página estás, qué método usás y qué resultados obtuviste
- Historial de conversación almacenado en base de datos por usuario
- Rate limiting para proteger el uso de la API

### ⚠️ Mensajes de error amigables
- En lugar de errores técnicos crudos, la app muestra **advertencias claras** explicando qué pasó y por qué
- Severidad visual: **warning** (amarillo/naranja) para divergencia o condiciones del método, **error** (rojo) para problemas de sintaxis
- Sugerencias concretas para resolver el problema
- Detalle técnico desplegable para usuarios avanzados

### 🔐 Autenticación
- Registro e inicio de sesión con JWT
- Contraseñas hasheadas con bcrypt
- Sesión persistente validada al cargar la app

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19, Vite 7, React Router 7, Recharts 3 |
| **Backend** | Node.js, Express 5, Helmet |
| **IA** | OpenAI API (GPT) |
| **Base de datos** | PostgreSQL 15 |
| **Matemáticas** | math.js (evaluación segura + derivada simbólica) |
| **Auth** | JWT + bcrypt |
| **Deploy** | Vercel (frontend), Docker Compose (BD) |
| **Otros** | KaTeX (renderizado matemático), react-markdown |

---

## 🚀 Instalación y configuración

### Prerrequisitos

- Node.js ≥ 18
- PostgreSQL 15+ (o Docker)
- Una API key de OpenAI

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/numerika-ai.git
cd numerika-ai
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiá el archivo de ejemplo y completá los valores:

```bash
cp .env.example .env
```

```env
# Servidor
PORT=3000

# Base de Datos (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=cambia_esto_por_un_secret_seguro_y_largo

# OpenAI
OPENAI_API_KEY=sk-...

# Frontend API URL
VITE_API_URL=http://localhost:3000
```

### 4. Levantar la base de datos (con Docker)

```bash
docker compose up -d
```

Esto levanta PostgreSQL 15 y Redis 7 con volúmenes persistentes.

### 5. Ejecutar en desarrollo

```bash
# Terminal 1: Backend (API + Auth + IA)
npm start

# Terminal 2: Frontend (Vite dev server)
npm run dev
```

La app estará disponible en `http://localhost:5173` y la API en `http://localhost:3000`.

---

## 📁 Estructura del proyecto

```
numerika-ai/
├── server.js                    # Servidor Express (API REST)
├── docker-compose.yml           # PostgreSQL + Redis
├── .env.example                 # Variables de entorno de ejemplo
├── vite.config.js               # Configuración de Vite
├── vercel.json                  # Config de deploy Vercel
│
└── src/
    ├── App.jsx                  # Rutas principales + imports de estilos
    ├── main.jsx                 # Entry point (React DOM)
    │
    ├── pages/
    │   ├── HomePage.jsx         # Landing con visión, misión y propuesta de valor
    │   ├── SolverPage.jsx       # Solver interactivo con gráfico y tabla
    │   ├── ComparisonPage.jsx   # Comparador con gráficos de barras
    │   ├── MethodsPage.jsx      # Catálogo de métodos disponibles
    │   ├── Amn.jsx              # Aplicaciones de métodos numéricos
    │   ├── LoginPage.jsx        # Inicio de sesión
    │   └── RegisterPage.jsx     # Registro de usuario
    │
    ├── components/
    │   ├── Navigation.jsx       # Barra de navegación
    │   ├── IkaWidget.jsx        # Chat con la asistente IKA
    │   ├── FriendlyErrorBox.jsx # Mensajes de error amigables
    │   ├── InteractiveChart.jsx # Gráfico interactivo
    │   ├── GuideAccordion.jsx   # Guía paso a paso desplegable
    │   ├── Card.jsx             # Card genérica
    │   ├── Form.jsx             # Formularios
    │   ├── Field.jsx            # Campos de formulario
    │   └── MethodTypeTag.jsx    # Tag "cerrado" / "abierto"
    │
    ├── utils/
    │   ├── numericalMethods.js  # Motor de cálculo (5 métodos + graficador)
    │   └── friendlyErrors.js    # Mapeo de errores técnicos a mensajes amigables
    │
    ├── services/                # Servicios del backend (IA)
    ├── config/                  # Configuración de BD
    ├── middleware/               # Auth middleware (JWT)
    ├── context/                 # React Context (Auth, IKA)
    ├── constants/               # Datos estáticos, guías, cards
    │
    └── styles/
        ├── globals.css          # Variables CSS y estilos base
        ├── solver.css           # Estilos del solver
        ├── comparison.css       # Estilos del comparador + gráficos
        ├── friendly-errors.css  # Estilos de FriendlyErrorBox
        ├── home.css             # Landing page
        ├── nav.css              # Navegación
        ├── cards.css            # Cards
        ├── auth.css             # Login / Register
        ├── ika.css              # Widget de IKA
        └── ...
```

---

## 🧮 Métodos numéricos soportados

| Método | Tipo | Entrada requerida | Convergencia |
|--------|------|-------------------|--------------|
| **Bisección** | Cerrado | Intervalo [a, b] | Garantizada si f(a)·f(b) < 0 |
| **Regla Falsa** | Cerrado | Intervalo [a, b] | Más rápida que bisección en funciones suaves |
| **Newton-Raphson** | Abierto | Punto inicial x₀ | Cuadrática (muy rápida cerca de la raíz) |
| **Secante** | Abierto | Dos puntos x₀, x₁ | Superlineal, sin necesidad de f′(x) |
| **Punto Fijo** | Abierto | Punto inicial x₀ + g(x) | Converge si \|g′(x)\| < 1 |

### Funciones matemáticas soportadas

El motor usa **math.js** para evaluar expresiones de forma segura. Soporta:

- Operadores: `+`, `-`, `*`, `/`, `^` (potencia)
- Funciones: `sin`, `cos`, `tan`, `sqrt`, `abs`, `log` (base 10), `ln` (natural), `exp`
- Español: `sen(x)` se convierte automáticamente a `sin(x)`
- Constantes: `pi`, `e`
- Multiplicación implícita parcial: `2x` → `2*x`

---

## 📜 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo Vite (frontend) |
| `npm start` | Servidor Express (backend API) |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build de producción |
| `npm run lint` | Ejecutar ESLint |

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crear una rama para tu feature: `git checkout -b feature/mi-feature`
3. Commitear los cambios: `git commit -m "feat: descripción del cambio"`
4. Push a la rama: `git push origin feature/mi-feature`
5. Abrir un Pull Request

---

## 📄 Licencia

Este proyecto es de uso educativo. Consultá con los autores para uso comercial.

---

<p align="center">
  Hecho con 💚 para estudiantes de ingeniería en Latinoamérica.
</p>
