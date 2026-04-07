# NumérikaAI - Roadmap de Features 🚀

## Índice
1. [Mejorar Visualización del Gráfico](#mejorar-visualización-del-gráfico)
2. [Documentación en el Programa](#documentación-en-el-programa)
3. [Tabla de Implementación](#tabla-de-implementación)
4. [Timeline Sugerido](#timeline-sugerido)

---

## Mejorar Visualización del Gráfico

### 📊 Problema Actual
- Gráfico muy comprimido (height: 160px en Recharts)
- Ejes X e Y sin etiquetas claras de valores
- Sin capacidad de zoom
- No hay forma de explorar rangos específicos
- Difícil ver detalles en funciones con muchas variaciones

### ✅ Solución Propuesta

#### **1. Expandir contenedor del gráfico**
**Archivo:** `src/pages/SolverPage.jsx`

**Cambios:**
```jsx
// ANTES:
<div className="graph-area">
  <ResponsiveContainer width="100%" height={160}>
    ...
  </ResponsiveContainer>
</div>

// DESPUÉS:
<div className="graph-container">
  <div className="graph-header">
    <span className="graph-label">f(x) = {funcExpr}</span>
    <div className="graph-controls">
      <button className="zoom-btn" onClick={handleZoomReset}>Resetear zoom</button>
      <button className="zoom-btn zoom-in" onClick={handleZoomIn}>+</button>
      <button className="zoom-btn zoom-out" onClick={handleZoomOut}>−</button>
    </div>
  </div>
  <ResponsiveContainer width="100%" height={420}>
    ...
  </ResponsiveContainer>
  <div className="graph-footer">
    <span className="axis-label">Rango X: [{xMin.toFixed(2)}, {xMax.toFixed(2)}]</span>
    <span className="axis-label">Escala: {zoomLevel.toFixed(2)}x</span>
  </div>
</div>
```

#### **2. Agregar estado de zoom (smooth)**
```jsx
// En SolverPage.jsx
const [zoomState, setZoomState] = useState({
  level: 1,        // 1x = original, 0.5 = alejado 50%, 2 = acercado 100%
  centerX: 0,      // punto central del zoom
  isAnimating: false
});

// Función de zoom suave (usando requestAnimationFrame)
const handleZoomIn = () => {
  if (zoomState.isAnimating) return;
  setZoomState(prev => ({
    ...prev,
    isAnimating: true,
    level: Math.min(prev.level + 0.1, 5) // máximo 5x
  }));
  setTimeout(() => {
    setZoomState(prev => ({ ...prev, isAnimating: false }));
  }, 300);
};

const handleZoomOut = () => {
  if (zoomState.isAnimating) return;
  setZoomState(prev => ({
    ...prev,
    isAnimating: true,
    level: Math.max(prev.level - 0.1, 0.3) // mínimo 0.3x
  }));
  setTimeout(() => {
    setZoomState(prev => ({ ...prev, isAnimating: false }));
  }, 300);
};

const handleZoomReset = () => {
  setZoomState({ level: 1, centerX: 0, isAnimating: false });
};
```

#### **3. Calcular rango dinámico según zoom**
```jsx
// En el useMemo donde calcula graphPoints
const getZoomedRange = () => {
  const baseRange = Math.abs(xMax - xMin);
  const zoomedRange = baseRange / zoomState.level;
  const margin = zoomedRange / 2;
  
  return {
    xMinZoomed: zoomState.centerX - margin,
    xMaxZoomed: zoomState.centerX + margin
  };
};

const { xMinZoomed, xMaxZoomed } = getZoomedRange();
const graphPoints = useMemo(() => {
  const expr = method.id === "puntofijo" ? values.gx : values.fx;
  return getFunctionPoints(expr, xMinZoomed, xMaxZoomed, 300); // más puntos para suavidad
}, [values.fx, values.gx, values.x0, method.id, zoomState]);
```

#### **4. Mejorar CustomTooltip con más info**
```jsx
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { x, y } = payload[0].payload;
  
  return (
    <div className="recharts-tooltip">
      <div className="tooltip-row">
        <span className="tooltip-label">x =</span>
        <span className="tooltip-value">{parseFloat(x).toFixed(4)}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">f(x) =</span>
        <span className="tooltip-value">{parseFloat(y).toFixed(6)}</span>
      </div>
      {root && Math.abs(parseFloat(x) - parseFloat(root)) < 0.1 && (
        <div className="tooltip-row highlight">
          <span className="tooltip-label">⭐ Cerca de raíz</span>
        </div>
      )}
    </div>
  );
};
```

#### **5. Agregar líneas de referencia y etiquetas de ejes**
```jsx
<LineChart
  data={graphPoints}
  margin={{ top: 20, right: 40, left: 60, bottom: 60 }}
  onMouseMove={handleGraphMouseMove} // para interactividad
>
  <CartesianGrid stroke={C.border} strokeDasharray="4 4" />
  
  {/* Ejes con etiquetas claras */}
  <XAxis 
    dataKey="x" 
    tick={{ fontSize: 11, fill: C.muted, fontFamily: "'DM Mono', monospace" }}
    interval="preserveStartEnd"
    label={{ value: 'x', position: 'insideBottomRight', offset: -10, fontSize: 12, fill: C.text }}
  />
  <YAxis 
    tick={{ fontSize: 11, fill: C.muted, fontFamily: "'DM Mono', monospace" }}
    label={{ value: 'f(x)', angle: -90, position: 'insideLeft', fontSize: 12, fill: C.text }}
  />
  
  <Tooltip content={<CustomTooltip />} />
  
  {/* Línea Y=0 (eje X visual) */}
  <ReferenceLine y={0} stroke={C.muted} strokeWidth={1.2} />
  
  {/* Raíz encontrada */}
  {root && (
    <>
      <ReferenceLine 
        x={parseFloat(root.toFixed(4))} 
        stroke={C.teal} 
        strokeDasharray="6 3" 
        strokeWidth={2}
        label={{ value: `x=${parseFloat(root).toFixed(4)}`, position: 'top', fill: C.teal, fontSize: 10 }}
      />
      <ReferenceLine 
        y={0} 
        x={parseFloat(root.toFixed(4))}
        stroke={C.teal}
        strokeWidth={2}
        dot={{ fill: C.teal, r: 5 }}
      />
    </>
  )}
  
  <Line 
    type="monotone" 
    dataKey="y" 
    stroke={C.teal} 
    strokeWidth={2} 
    dot={false} 
    connectNulls={true}
    isAnimationActive={false} // evitar re-renders lentos
  />
</LineChart>
```

#### **6. Estilos CSS para el gráfico mejorado**
**Archivo:** `src/styles/solver.css` (agregar)

```css
/* Graph Improvements */
.graph-container {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-bottom: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.graph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.graph-label {
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--muted);
}

.graph-controls {
  display: flex;
  gap: 6px;
}

.zoom-btn {
  background: var(--surface);
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 12px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.zoom-btn:hover {
  border-color: var(--teal);
  color: var(--teal);
  background: rgba(108, 189, 181, 0.05);
}

.zoom-btn:active {
  background: rgba(108, 189, 181, 0.1);
}

.zoom-btn.zoom-in,
.zoom-btn.zoom-out {
  padding: 6px 9px; /* más compacto para +/- */
}

.graph-footer {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px solid var(--border);
  background: var(--surface);
  font-size: 9px;
}

.axis-label {
  color: var(--muted);
  letter-spacing: 0.5px;
  font-family: 'DM Mono', monospace;
}

/* Recharts overrides */
.recharts-tooltip {
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
  border-radius: 6px !important;
  padding: 8px 12px !important;
  font-family: 'DM Mono', monospace;
}

.recharts-tooltip .recharts-label {
  color: var(--text) !important;
}

.tooltip-row {
  display: flex;
  gap: 8px;
  font-size: 11px;
  margin: 2px 0;
}

.tooltip-row.highlight {
  color: var(--teal);
  font-weight: 500;
}

.tooltip-label {
  color: var(--muted);
  min-width: 35px;
}

.tooltip-value {
  color: var(--teal);
  font-weight: 500;
  font-family: 'DM Mono', monospace;
}

/* Responsive */
@media (max-width: 768px) {
  .graph-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .graph-controls {
    align-self: flex-end;
  }

  .graph-footer {
    flex-direction: column;
    gap: 6px;
  }
}
```

#### **7. Función helper para manejo de datos con zoom**
**Archivo:** `src/utils/graphUtils.js` (nuevo)

```javascript
/**
 * Calcula rango de visualización considerando zoom
 */
export function calculateZoomedRange(baseMin, baseMax, zoomLevel, centerX) {
  const baseRange = Math.abs(baseMax - baseMin);
  const zoomedRange = baseRange / zoomLevel;
  const margin = zoomedRange / 2;
  
  return {
    min: centerX - margin,
    max: centerX + margin,
    range: zoomedRange
  };
}

/**
 * Suaviza la transición de zoom (easing)
 */
export function easeInOutQuad(t) {
  // t va de 0 a 1 durante la animación
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Valida que los puntos del gráfico sean válidos
 */
export function filterValidPoints(points) {
  return points.filter(p => {
    const x = parseFloat(p.x);
    const y = parseFloat(p.y);
    return isFinite(x) && isFinite(y) && Math.abs(y) < 1e6;
  });
}

/**
 * Ajusta automáticamente el rango para que la raíz esté centrada
 */
export function centerOnRoot(root, baseMin, baseMax) {
  const rootNum = parseFloat(root);
  if (!isFinite(rootNum)) return baseMin;
  
  // Centra en la raíz
  return rootNum;
}
```

---

## Documentación en el Programa

### 📚 Arquitectura de Documentación

#### **Nivel 1: Tooltips Contextuales (RÁPIDO - 2-3 horas)**

**1.1 Crear `src/constants/methodDocs.js`**
```javascript
export const METHOD_DOCUMENTATION = {
  biseccion: {
    name: "Bisección",
    shortDesc: "Divide el intervalo a la mitad en cada iteración",
    tooltip: `
Bisección
━━━━━━━━━━━━━━━━
Divide el intervalo [a,b] por la mitad hasta encontrar la raíz.

✓ Convergencia garantizada si f(a)·f(b) < 0
✓ Predecible: siempre ~ log₂(b-a/tol) iteraciones
✓ Estable numéricamente
✗ Convergencia lineal (lenta)
✗ Necesita valores con signos opuestos

Mejor para: Funciones monótonas, cuando necesitas garantía
Evitar: Cuando hay raíces múltiples en [a,b]
    `,
    complexity: "O(log(1/ε))",
    convergenceType: "Linear",
    useWhen: [
      "Necesitas garantía de convergencia",
      "Función monótona en el intervalo",
      "Tienes tiempo de computación ilimitado"
    ],
    avoidWhen: [
      "Necesitas convergencia rápida",
      "Hay múltiples raíces en [a,b]",
      "No puedes evaluar la función en ambos extremos"
    ]
  },
  reglafalsa: {
    name: "Regla Falsa",
    shortDesc: "Interpolación lineal entre a y b",
    tooltip: `
Regla Falsa (Posición Falsa)
━━━━━━━━━━━━━━━━━━━━━━━━━━
Usa interpolación lineal entre f(a) y f(b) para estimar la raíz.

✓ Convergencia garantizada
✓ Más rápida que bisección en funciones suaves
✓ Usa información de la función (pendiente)
✗ Puede converger lentamente si un extremo está muy lejos
✗ Requiere f(a)·f(b) < 0

Mejor para: Funciones suaves con curvatura
Evitar: Funciones planas o muy curvas
    `,
    complexity: "O(1) a O(n) según función",
    convergenceType: "Superlinear",
    useWhen: [
      "Función suave y continua",
      "Quieres mejor convergencia que bisección",
      "Puedes evaluar f(x) fácilmente"
    ],
    avoidWhen: [
      "Función muy plana o muy curva",
      "Necesitas convergencia cuadrática (usa Newton)"
    ]
  },
  newton: {
    name: "Newton-Raphson",
    shortDesc: "Usa la derivada para convergencia cuadrática",
    tooltip: `
Newton-Raphson
━━━━━━━━━━━━━━━━
Usa f'(x) para aproximarse a la raíz. Convergencia muy rápida.

✓ Convergencia cuadrática (muy rápido)
✓ Solo 1 punto inicial (no intervalo)
✓ Excelente cuando x₀ está cerca de la raíz
✗ Puede divergir si x₀ está lejos
✗ Derivada puede ser cero o no estar definida
✗ Necesita calcular f'(x) en cada paso

Mejor para: Funciones suaves, cuando tienes buen x₀
Evitar: Funciones con f'(x) = 0, polinomios de grado alto
    `,
    complexity: "O(ln(ln(1/ε)))",
    convergenceType: "Cuadratic",
    useWhen: [
      "Tienes buen punto inicial x₀",
      "Necesitas convergencia rápida",
      "Función es suave (bien comportada)",
      "f'(x) es fácil de calcular"
    ],
    avoidWhen: [
      "No tienes idea de dónde está la raíz",
      "f'(x) = 0 en el dominio",
      "Función tiene picos o es muy oscilante"
    ]
  },
  secante: {
    name: "Secante",
    shortDesc: "Aproxima derivada con dos puntos",
    tooltip: `
Secante
━━━━━━━━━━━━━━━━
Similar a Newton pero aproxima f'(x) usando dos puntos.

✓ Convergencia superlineal (casi cuadrática)
✓ No necesita derivada analítica
✓ Solo 2 puntos iniciales
✗ Puede divergir más fácil que Newton
✗ Más iteraciones que Newton

Mejor para: Cuando no puedes calcular f'(x) fácilmente
Evitar: Funciones muy planas
    `,
    complexity: "O(1.618^n)",
    convergenceType: "Superlinear",
    useWhen: [
      "No puedes calcular f'(x)",
      "Tienes 2 puntos cercanos a la raíz",
      "Necesitas compromiso Newton-Bisección"
    ],
    avoidWhen: [
      "Quieres máxima velocidad (usa Newton)",
      "Necesitas garantía de convergencia (usa Bisección)"
    ]
  },
  puntofijo: {
    name: "Punto Fijo",
    shortDesc: "Itera x = g(x) hasta convergencia",
    tooltip: `
Punto Fijo
━━━━━━━━━━━━━━━━
Reescribe f(x)=0 como x=g(x) e itera: xₙ₊₁ = g(xₙ)

✓ Flexible: puedes elegir g(x)
✓ Simple de implementar
✗ Convergencia depende de |g'(x)| < 1
✗ Puede divergir fácilmente
✗ Requiere reformulación de f(x)

Mejor para: Problemas específicos donde tienes buena g(x)
Evitar: Uso general (prefiere Newton o Bisección)
    `,
    complexity: "O(1/|g'(x)|)",
    convergenceType: "Linear (dependencia de g)",
    useWhen: [
      "Ya tienes g(x) de la formulación del problema",
      "g(x) es simple de evaluar",
      "|g'(x)| < 1 en la raíz"
    ],
    avoidWhen: [
      "No sabes cómo formular g(x)",
      "|g'(x)| >= 1 (divergencia segura)"
    ]
  }
};

export const CONCEPT_DEFINITIONS = {
  raiz: {
    term: "Raíz de una ecuación",
    definition: "Valor x donde f(x) = 0",
    visual: "Punto donde la gráfica cruza el eje X",
    example: "Para f(x) = x² - 4, las raíces son x = 2 y x = -2"
  },
  convergencia: {
    term: "Convergencia",
    definition: "El método se acerca a la solución correcta",
    visual: "Error disminuye con cada iteración",
    example: "Si error: 0.1 → 0.01 → 0.001 → ... converge"
  },
  tolerancia: {
    term: "Tolerancia (ε)",
    definition: "Error máximo aceptable: |xₙ₊₁ - xₙ| < ε",
    visual: "Zona alrededor de la raíz donde paramos",
    example: "ε = 0.0001 significa precisión a 4 decimales"
  },
  error_relativo: {
    term: "Error relativo",
    definition: "err = |xₙ₊₁ - xₙ| / |xₙ₊₁| × 100%",
    visual: "Cambio porcentual entre iteraciones",
    example: "err = 1.5% significa cambio pequeño respecto valor actual"
  },
  divergencia: {
    term: "Divergencia",
    definition: "El método se aleja de la solución",
    visual: "Error aumenta con cada iteración",
    example: "Si error: 0.1 → 0.3 → 1.5 → ... diverge"
  }
};
```

**1.2 Crear componente `src/components/MethodTooltip.jsx`**
```jsx
import React, { useState } from "react";
import { METHOD_DOCUMENTATION } from "../constants/methodDocs";

export const MethodTooltip = ({ methodId, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const doc = METHOD_DOCUMENTATION[methodId];

  if (!doc) return children;

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}

      {showTooltip && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            marginBottom: "12px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "14px 16px",
            width: "320px",
            zIndex: 1000,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            fontSize: "11px",
            lineHeight: "1.6",
            color: "var(--text)",
            fontFamily: "'DM Mono', monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            animation: "fadeIn 0.2s ease"
          }}
        >
          {doc.tooltip}

          {/* Flecha */}
          <div
            style={{
              position: "absolute",
              bottom: "-6px",
              left: "16px",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid var(--surface)",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
```

**1.3 Integrar en SolverPage.jsx**
```jsx
// En el selector de métodos, reemplazar:
{METHODS.map(m => (
  <MethodTooltip key={m.id} methodId={m.id}>
    <button
      className={`method-pill ${activeMethod === m.id ? "active" : ""}`}
      onClick={() => handleMethodChange(m.id)}
    >
      <span className="pill-name">{m.name}</span>
      <span className="pill-type">{m.type}</span>
    </button>
  </MethodTooltip>
))}
```

---

#### **Nivel 2: "Por qué converge" en resultados (INTERMEDIO - 3-4 horas)**

**2.1 Crear `src/utils/convergenceAnalyzer.js`**
```javascript
/**
 * Analiza por qué converge un método y genera explicación
 */
export function analyzeConvergence(result, method, inputs) {
  const { iterations, converged, totalIter, root } = result;

  if (converged) {
    let explanation = "";
    let reasons = [];

    switch (method.id) {
      case "biseccion":
        reasons = [
          `f(${parseFloat(inputs.a).toFixed(4)}) y f(${parseFloat(inputs.b).toFixed(4)}) tienen signos opuestos`,
          `En cada iteración el intervalo se reduce a la mitad`,
          `Error teórico: E ≤ (b-a)/2^n = ~${((parseFloat(inputs.b) - parseFloat(inputs.a)) / Math.pow(2, totalIter)).toFixed(6)}`
        ];
        explanation = `El método bisección garantiza convergencia porque:\n• ${reasons.join("\n• ")}\n\nCon ${totalIter} iteraciones alcanzaste tolerancia ${parseFloat(inputs.tol).toFixed(6)}`;
        break;

      case "newton":
        const f0 = iterations[0];
        const convergenceRate = calculateConvergenceRate(iterations);
        reasons = [
          `Derivada f'(x) cambió correctamente en cada paso`,
          `Convergencia ${convergenceRate > 1.8 ? "cuadrática (excelente)" : "lineal"}`,
          `Error en cada paso: ~${convergenceRate.toFixed(2)}² del anterior`
        ];
        explanation = `Newton-Raphson convergió porque:\n• ${reasons.join("\n• ")}\n\nNota: Si convergencia fuera lenta, x₀ estaría lejos de la raíz.`;
        break;

      case "secante":
        reasons = [
          "Los dos puntos iniciales estaban en la cuenca de atracción",
          "La aproximación de f'(x) mejoró con cada iteración",
          "Convergencia superlineal (φ ≈ 1.618)"
        ];
        explanation = `Secante convergió porque:\n• ${reasons.join("\n• ")}\n\nEste método es más lento que Newton pero no necesita derivada.`;
        break;

      case "puntofijo":
        const gDerivatives = estimateGDerivative(iterations);
        const avgDerivative = gDerivatives.reduce((a, b) => a + b, 0) / gDerivatives.length;
        reasons = [
          `|g'(x)| ≈ ${Math.abs(avgDerivative).toFixed(4)} < 1 en la raíz`,
          `Contracción garantiza convergencia`,
          `Velocidad depende de |g'(x)|: cuanto más pequeño, más rápido`
        ];
        explanation = `Punto Fijo convergió porque:\n• ${reasons.join("\n• ")}\n\nSi |g'(x)| hubiera sido ≥ 1, habría divergido.`;
        break;

      case "reglafalsa":
        reasons = [
          "f(a) y f(b) mantuvieron signos opuestos",
          "Interpolación lineal es más eficiente que bisección",
          "Converge cuando f es suave en el intervalo"
        ];
        explanation = `Regla Falsa convergió porque:\n• ${reasons.join("\n• ")}\n\nMás rápida que bisección pero menos que Newton.`;
        break;

      default:
        explanation = "Convergencia alcanzada";
    }

    return { explanation, reasons, converged: true };
  } else {
    return {
      explanation: `El método alcanzó el máximo de ${totalIter} iteraciones sin converger.\n\nOpciones:\n• Aumentar iteraciones máximas\n• Reducir tolerancia\n• Cambiar punto inicial (métodos abiertos)\n• Cambiar intervalo (métodos cerrados)`,
      reasons: [],
      converged: false
    };
  }
}

function calculateConvergenceRate(iterations) {
  if (iterations.length < 3) return 1;
  const last = iterations[iterations.length - 1].err || 0;
  const prev = iterations[iterations.length - 2].err || 1;
  const prevprev = iterations[iterations.length - 3].err || 1;

  if (prev === 0 || prevprev === 0) return 1;
  return Math.abs(last / (prev * prev));
}

function estimateGDerivative(iterations) {
  // Para punto fijo: g'(x) ≈ (g(x) - x) cambio relativo
  return iterations.map((row, i) => {
    if (i === 0) return 1;
    const prev = iterations[i - 1];
    return Math.abs((row.gx - row.x) / (prev.gx - prev.x || 0.0001));
  }).slice(1);
}
```

**2.2 Crear componente `src/components/ConvergenceExplain.jsx`**
```jsx
import React from "react";

export const ConvergenceExplain = ({ result, method, inputs }) => {
  const { explanation, reasons } = analyzeConvergence(result, method, inputs);

  return (
    <div className="convergence-box">
      <div className="convergence-header">
        <span className="convergence-title">
          {result.converged ? "✓ Análisis de Convergencia" : "⚠ Análisis de No Convergencia"}
        </span>
      </div>

      <div className="convergence-body">
        <p className="convergence-text">{explanation}</p>

        {result.converged && (
          <div className="next-steps">
            <span className="steps-label">🎯 Próximo paso:</span>
            <ul className="steps-list">
              <li>Si necesitas mayor precisión, reducí la tolerancia</li>
              <li>Compará con otros métodos en la sección "Comparar"</li>
              <li>Lee la documentación del método para entender mejor</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
```

**2.3 Estilos para convergence explain**
```css
/* En src/styles/solver.css */
.convergence-box {
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(200, 214, 191, 0.1), rgba(108, 189, 181, 0.05));
  border: 1px solid rgba(200, 214, 191, 0.4);
  border-radius: 8px;
  margin-top: 16px;
}

.convergence-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.convergence-title {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #6a8a6a;
  font-weight: 500;
}

.convergence-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.convergence-text {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.8;
  white-space: pre-wrap;
  margin: 0;
}

.next-steps {
  border-top: 1px solid rgba(200, 214, 191, 0.3);
  padding-top: 8px;
}

.steps-label {
  font-size: 9px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #6a8a6a;
  display: block;
  margin-bottom: 6px;
}

.steps-list {
  margin: 0;
  padding-left: 18px;
  font-size: 10px;
  color: var(--muted);
  line-height: 1.6;
}

.steps-list li {
  margin-bottom: 4px;
}
```

---

#### **Nivel 3: Click en tabla → Highlight en gráfico (INTERMEDIO - 2-3 horas)**

**3.1 Agregar estado de selección en SolverPage.jsx**
```jsx
const [selectedIterationIndex, setSelectedIterationIndex] = useState(null);

// Función para manejar click en fila
const handleRowClick = (index) => {
  setSelectedIterationIndex(selectedIterationIndex === index ? null : index);
};
```

**3.2 Actualizar tabla con hover/click**
```jsx
<tbody>
  {result.iterations.map((row, i) => (
    <tr
      key={i}
      className={`
        ${row.converged ? "converged" : ""}
        ${selectedIterationIndex === i ? "selected" : ""}
      `}
      onClick={() => handleRowClick(i)}
      style={{ cursor: "pointer", transition: "background 0.2s" }}
    >
      {/* Cells aquí */}
    </tr>
  ))}
</tbody>
```

**3.3 Mostrar punto en el gráfico según iteración seleccionada**
```jsx
{result && selectedIterationIndex !== null && (
  <ReferenceLine
    x={parseFloat(
      result.iterations[selectedIterationIndex].x ||
      result.iterations[selectedIterationIndex].c ||
      result.iterations[selectedIterationIndex].x2
    ).toFixed(4)}
    stroke="#ff9933"
    strokeDasharray="4 4"
    strokeWidth={2}
    label={{
      value: `Iteración ${selectedIterationIndex + 1}`,
      position: "top",
      fill: "#ff9933",
      fontSize: 10
    }}
  />
)}
```

**3.4 Estilos para filas seleccionadas**
```css
.iter-table tr.selected {
  background: rgba(255, 153, 51, 0.15) !important;
  border: 1px solid rgba(255, 153, 51, 0.3);
}

.iter-table tr:hover {
  background: rgba(108, 189, 181, 0.05);
}
```

---

#### **Nivel 4: Página de Documentación (AVANZADO - 6-8 horas)**

**4.1 Crear `src/pages/DocsPage.jsx`**
```jsx
import React, { useState } from "react";
import { DocSection } from "../components/DocSection";
import { CONCEPT_DEFINITIONS, METHOD_DOCUMENTATION } from "../constants/methodDocs";

export const DocsPage = () => {
  const [selectedSection, setSelectedSection] = useState("conceptos");

  return (
    <div className="docs-page">
      <div className="docs-header">
        <h1>Documentación</h1>
        <p>Aprende métodos numéricos desde cero</p>
      </div>

      <div className="docs-grid">
        {/* Sidebar */}
        <aside className="docs-sidebar">
          <nav className="docs-nav">
            <NavSection
              title="Conceptos Fundamentales"
              items={["raiz", "convergencia", "tolerancia", "error_relativo", "divergencia"]}
              active={selectedSection}
              onSelect={setSelectedSection}
            />
            <NavSection
              title="Métodos Cerrados"
              items={["biseccion", "reglafalsa"]}
              active={selectedSection}
              onSelect={setSelectedSection}
            />
            <NavSection
              title="Métodos Abiertos"
              items={["newton", "secante", "puntofijo"]}
              active={selectedSection}
              onSelect={setSelectedSection}
            />
          </nav>
        </aside>

        {/* Content */}
        <main className="docs-content">
          {selectedSection in CONCEPT_DEFINITIONS && (
            <DocSection
              type="concept"
              data={CONCEPT_DEFINITIONS[selectedSection]}
            />
          )}
          {selectedSection in METHOD_DOCUMENTATION && (
            <DocSection
              type="method"
              data={METHOD_DOCUMENTATION[selectedSection]}
            />
          )}
        </main>
      </div>
    </div>
  );
};

function NavSection({ title, items, active, onSelect }) {
  return (
    <div className="nav-section">
      <h3>{title}</h3>
      <ul>
        {items.map(item => (
          <li key={item}>
            <button
              className={`nav-link ${active === item ? "active" : ""}`}
              onClick={() => onSelect(item)}
            >
              {/* Get name from docs */}
              {item.replace(/_/g, " ")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**4.2 Crear `src/components/DocSection.jsx`**
```jsx
import React from "react";

export const DocSection = ({ type, data }) => {
  if (type === "concept") {
    return (
      <div className="doc-concept">
        <h2>{data.term}</h2>
        <div className="concept-grid">
          <div className="concept-definition">
            <h4>Definición</h4>
            <p>{data.definition}</p>
          </div>
          <div className="concept-visual">
            <h4>Visualización</h4>
            <p>{data.visual}</p>
          </div>
          <div className="concept-example">
            <h4>Ejemplo</h4>
            <p>{data.example}</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === "method") {
    return (
      <div className="doc-method">
        <h2>{data.name}</h2>
        <p className="method-short">{data.shortDesc}</p>

        <div className="method-grid">
          <div className="method-card">
            <h4>Características</h4>
            <div className="char-list">
              {data.useWhen && (
                <div>
                  <span className="char-title">✓ Usar cuando:</span>
                  <ul>
                    {data.useWhen.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.avoidWhen && (
                <div>
                  <span className="char-title">✗ Evitar cuando:</span>
                  <ul>
                    {data.avoidWhen.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="method-card">
            <h4>Análisis</h4>
            <dl>
              <dt>Complejidad:</dt>
              <dd>{data.complexity}</dd>
              <dt>Tipo convergencia:</dt>
              <dd>{data.convergenceType}</dd>
            </dl>
          </div>
        </div>

        <div className="method-button">
          <a href="/solver" className="btn-try">
            Probar en Solver →
          </a>
        </div>
      </div>
    );
  }
};
```

---

## Tabla de Implementación

| Feature | Prioridad | Tiempo | Componentes | Estado |
|---------|-----------|--------|-------------|--------|
| **GRÁFICO MEJORADO** | 🔴 CRÍTICA | 4-5h | SolverPage.jsx, solver.css, graphUtils.js | TODO |
| └─ Expandir contenedor | 🔴 | 30min | styles | TODO |
| └─ Zoom suave (+/-) | 🔴 | 1.5h | state + handlers | TODO |
| └─ Ejes con etiquetas | 🔴 | 45min | Recharts config | TODO |
| └─ Raíz marcada | 🔴 | 30min | ReferenceLine | TODO |
| **TOOLTIPS** | 🟡 ALTA | 2-3h | MethodTooltip, methodDocs.js | TODO |
| **CONVERGENCE EXPLAIN** | 🟡 ALTA | 3-4h | ConvergenceExplain, convergenceAnalyzer.js | TODO |
| **TABLA INTERACTIVA** | 🟡 MEDIA | 2-3h | SolverPage.jsx, styles | TODO |
| **DOCS PAGE** | 🟢 MEDIA | 6-8h | DocsPage, DocSection, methodDocs.js | TODO |
| **COMPARADOR MÉTODOS** | 🟢 BAJA | 4-5h | ComparisonPage, comparison logic | FUTURO |
| **EJERCICIOS** | 🟢 BAJA | 5-6h | ExercisePage, exercise logic | FUTURO |

---

## Timeline Sugerido

### **Sprint 1 (Semana 1) - Gráfico & Interactividad**
```
Lunes:     Gráfico mejorado (expandir, ejes, raíz)
Martes:    Zoom suave (smooth transitions)
Miércoles: Tabla interactiva (click → highlight)
Jueves:    Pulir UX, responsive mobile
Viernes:   Testing & refinamiento
```

**Entregables:**
- Gráfico dinámico con zoom
- Tabla clickeable que marca iteraciones
- Responsive en mobile

---

### **Sprint 2 (Semana 2) - Documentación Contextual**
```
Lunes:     Crear methodDocs.js con todas las definiciones
Martes:    MethodTooltip component + integración
Miércoles: convergenceAnalyzer.js + ConvergenceExplain
Jueves:    Integrar en SolverPage
Viernes:   Pulir textos & feedback usuario
```

**Entregables:**
- Tooltips al pasar mouse en métodos
- Explicación "Por qué converge" después de calcular
- Sugerencias de próximos pasos

---

### **Sprint 3 (Semana 3) - Docs Page (opcional pero recomendado)**
```
Lunes-Martes:   DocsPage + DocSection components
Miércoles-Jueves: Llenar contenido (conceptos + métodos)
Viernes:        Navigation, links desde solver
```

**Entregables:**
- Página de documentación completa
- Links "Leer más" desde solver
- Botón "Probar en Solver" desde docs

---

## Checklist de Implementación

### Fase 1: Gráfico
- [ ] Expandir `.graph-area` a height 420px
- [ ] Agregar `.graph-header` con controles
- [ ] Implementar `handleZoomIn`, `handleZoomOut`, `handleZoomReset`
- [ ] Agregar estado `zoomState` en SolverPage
- [ ] Crear `graphUtils.js` con funciones de cálculo
- [ ] Actualizar `getFunctionPoints` para usar rango zoomado
- [ ] Agregar labels en XAxis y YAxis
- [ ] Marcar raíz con `ReferenceLine` + `dot`
- [ ] Mejorar CustomTooltip
- [ ] Agregar `.graph-footer` con info de rango
- [ ] CSS responsive para mobile

### Fase 2: Documentación
- [ ] Crear `methodDocs.js` con todas las definiciones
- [ ] Crear `MethodTooltip.jsx`
- [ ] Integrar tooltips en selector de métodos
- [ ] Crear `convergenceAnalyzer.js`
- [ ] Crear `ConvergenceExplain.jsx`
- [ ] Integrar en resultados del solver
- [ ] Crear `DocSection.jsx`
- [ ] Crear `DocsPage.jsx`
- [ ] Agregar ruta `/docs` en App.jsx
- [ ] Agregar links "Leer más" en solver

### Fase 3: Interactividad tabla
- [ ] Agregar estado `selectedIterationIndex`
- [ ] Hacer filas clickeables
- [ ] Highlight en gráfico según fila seleccionada
- [ ] Estilos hover/selected
- [ ] Animación suave

---

## Notas de Desarrollo

### **Performance:**
- Usa `isAnimationActive={false}` en Recharts para evitar re-renders
- Memoiza `graphPoints` con `useMemo`
- Limita puntos del gráfico a 300-400 max

### **UX:**
- Transiciones de zoom: 300ms con easing suave
- Tooltips desaparecen después de 5s si no hay interacción
- Mensajes de error en tono educativo, no técnico

### **Testing:**
- Prueba zoom con diferentes funciones
- Verifica zoom en números muy grandes/pequeños
- Test responsivo en mobile (<768px)

---

**¿Listo para empezar? Recomiendo comenzar por Fase 1 (Gráfico) ya que afecta toda la experiencia visual.** 🚀