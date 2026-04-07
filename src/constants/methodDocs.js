/**
 * methodDocs.js — Documentación inline de cada método numérico
 */

export const METHOD_DOCUMENTATION = {
  biseccion: {
    name: "Bisección",
    shortDesc: "Divide el intervalo a la mitad en cada iteración",
    pros: [
      "Convergencia garantizada si f(a)·f(b) < 0",
      "Predecible: siempre ~log₂((b−a)/tol) iteraciones",
      "Estable numéricamente",
    ],
    cons: [
      "Convergencia lineal (lenta)",
      "Necesita valores con signos opuestos",
    ],
    complexity: "O(log(1/ε))",
    convergenceType: "Lineal",
    bestFor: "Funciones monótonas cuando necesitás garantía de convergencia",
    avoidFor: "Cuando hay raíces múltiples en [a,b] o necesitás velocidad",
  },
  reglafalsa: {
    name: "Regla Falsa",
    shortDesc: "Interpolación lineal entre a y b",
    pros: [
      "Convergencia garantizada",
      "Más rápida que bisección en funciones suaves",
      "Usa información de la función (pendiente)",
    ],
    cons: [
      "Puede ser lenta si un extremo queda fijo muchas iteraciones",
      "Requiere f(a)·f(b) < 0",
    ],
    complexity: "O(1) a O(n) según la función",
    convergenceType: "Superlineal",
    bestFor: "Funciones suaves con curvatura moderada",
    avoidFor: "Funciones muy planas o con alta concavidad",
  },
  newton: {
    name: "Newton-Raphson",
    shortDesc: "Usa la derivada para convergencia cuadrática",
    pros: [
      "Convergencia cuadrática (muy rápida)",
      "Solo 1 punto inicial (no intervalo)",
      "Excelente cerca de la raíz",
    ],
    cons: [
      "Puede divergir si x₀ está lejos",
      "Falla si f′(x) ≈ 0",
      "Necesita calcular f′(x) en cada paso",
    ],
    complexity: "O(ln(ln(1/ε)))",
    convergenceType: "Cuadrática",
    bestFor: "Funciones suaves con buen punto inicial x₀",
    avoidFor: "Funciones con f′(x)=0, polinomios oscilantes",
  },
  secante: {
    name: "Secante",
    shortDesc: "Aproxima la derivada con dos puntos",
    pros: [
      "Convergencia superlineal (casi cuadrática)",
      "No necesita derivada analítica",
      "Solo 2 puntos iniciales",
    ],
    cons: [
      "Puede divergir más fácil que Newton",
      "Necesita más iteraciones que Newton",
    ],
    complexity: "O(φⁿ) donde φ≈1.618",
    convergenceType: "Superlineal (orden φ)",
    bestFor: "Cuando no se puede calcular f′(x) fácilmente",
    avoidFor: "Funciones muy planas donde f(x₁)≈f(x₀)",
  },
  puntofijo: {
    name: "Punto Fijo",
    shortDesc: "Itera x = g(x) hasta convergencia",
    pros: [
      "Flexible: podés elegir distintas g(x)",
      "Simple de implementar",
    ],
    cons: [
      "Convergencia depende de |g′(x)| < 1",
      "Puede divergir fácilmente",
      "Requiere reformulación de f(x)",
    ],
    complexity: "O(1/|g′(x)|)",
    convergenceType: "Lineal (depende de g)",
    bestFor: "Problemas donde ya tenés una buena g(x) natural",
    avoidFor: "Uso general — preferí Newton o Bisección",
  },
};
