/**
 * friendlyErrors.js
 * 
 * Mapea los errores técnicos de los métodos numéricos a mensajes amigables
 * que explican qué pasó y por qué, sin asustar al usuario.
 * 
 * Retorna: { friendly, technical, severity, tip }
 *   - friendly: mensaje visible principal (tipo "cuidado, ...")
 *   - technical: el error original tal cual
 *   - severity: "warning" | "error"  (warning = amarillo, error = rojo)
 *   - tip: sugerencia concreta para el usuario
 */

const ERROR_PATTERNS = [
  // ── Newton-Raphson: derivada cero ──
  {
    pattern: /[Dd]erivada\s*≈\s*0/,
    friendly:
      "¡Cuidado! El método llegó a un punto donde f′(x) = 0, es decir, la tangente es horizontal. " +
      "Cuando eso ocurre, Newton-Raphson no puede trazar la siguiente recta tangente y se queda sin camino hacia la raíz.",
    severity: "warning",
    tip: "Probá con un x₀ diferente, más cerca de donde sospechás que está la raíz, o usá otro método como Bisección o Secante.",
  },

  // ── Bisección / Regla Falsa: signos iguales ──
  {
    pattern: /signos opuestos/,
    friendly:
      "Los valores f(a) y f(b) tienen el mismo signo. " +
      "Este método necesita que la función cruce el eje X entre a y b (un valor positivo y otro negativo) para garantizar que hay una raíz en ese intervalo.",
    severity: "warning",
    tip: "Ajustá el intervalo [a, b] para que f(a) y f(b) tengan signos contrarios. Podés graficar la función para identificar dónde cruza el eje.",
  },

  // ── Secante: división por cero ──
  {
    pattern: /f\(x₁\)\s*≈\s*f\(x₀\)/,
    friendly:
      "El método de la Secante encontró que f(x₀) y f(x₁) son prácticamente iguales. " +
      "Esto hace que la recta secante sea casi horizontal y la siguiente aproximación se dispare al infinito.",
    severity: "warning",
    tip: "Elegí puntos iniciales x₀ y x₁ más separados, o donde la función tenga valores bien distintos.",
  },

  // ── Punto Fijo: divergencia (valor grande) ──
  {
    pattern: /[Ee]l método diverge/,
    friendly:
      "La iteración x = f(x) se está alejando cada vez más en lugar de acercarse a la raíz. " +
      "Esto pasa cuando |f′(x)| ≥ 1 en la zona de la raíz, lo que significa que f (x) no es contractiva.",
    severity: "warning",
    tip: "Intentá reformular f(x) de otra manera o cambiá el x₀ inicial. Recordá que el método converge solo si |f′(x)| < 1 cerca de la raíz.",
  },

  // ── Punto Fijo: f(x) diverge (NaN/Infinity) ──
  {
    pattern: /f\(x\) diverge/,
    friendly:
      "La función f(x) produjo un valor infinito o indefinido durante las iteraciones. " +
      "Esto suele pasar cuando f(x) tiene una asíntota o singularidad cerca del punto donde se está evaluando.",
    severity: "warning",
    tip: "Revisá que f(x) esté bien definida en todo el rango de iteración, o probá con otro x₀.",
  },

  // ── Error al evaluar g(x) ──
  {
    pattern: /Error al evaluar g\(x\)/,
    friendly:
      "No se pudo evaluar la función g(x) en uno de los puntos de la iteración. " +
      "Puede haber una operación inválida como raíz de un número negativo o logaritmo de cero.",
    severity: "error",
    tip: "Verificá que la expresión de g(x) sea válida para todos los valores posibles de x en la iteración.",
  },

  // ── Función inválida (sintaxis) ──
  {
    pattern: /Función inválida/i,
    friendly:
      "La expresión matemática que ingresaste no se pudo interpretar. " +
      "Puede haber un error de sintaxis como paréntesis sin cerrar, operadores faltantes o funciones desconocidas.",
    severity: "error",
    tip: "Revisá la sintaxis: usá ^ para potencias, * para multiplicar (ej: 2*x en vez de 2x), y verificá que los paréntesis estén balanceados.",
  },

  // ── Valores numéricos inválidos ──
  {
    pattern: /valores numéricos/i,
    friendly:
      "Uno o más de los valores que ingresaste no son números válidos.",
    severity: "error",
    tip: "Asegurate de ingresar valores numéricos en todos los campos (ej: 1.5, -3, 0.001).",
  },

  // ── Tolerancia inválida ──
  {
    pattern: /[Tt]olerancia inválida/,
    friendly: "La tolerancia ingresada no es un número positivo válido.",
    severity: "error",
    tip: "La tolerancia debe ser un número positivo pequeño, como 0.0001 o 0.001.",
  },
];

/**
 * Dado un string de error técnico, retorna un objeto con el mensaje amigable.
 * Si no matchea ningún patrón conocido, devuelve un fallback genérico.
 */
export function getFriendlyError(technicalError) {
  if (!technicalError) return null;

  for (const entry of ERROR_PATTERNS) {
    if (entry.pattern.test(technicalError)) {
      return {
        friendly: entry.friendly,
        technical: technicalError,
        severity: entry.severity,
        tip: entry.tip,
      };
    }
  }

  // Fallback genérico
  return {
    friendly: "Ocurrió un problema durante el cálculo. El método no pudo completarse.",
    technical: technicalError,
    severity: "error",
    tip: "Revisá los parámetros ingresados e intentá de nuevo.",
  };
}
