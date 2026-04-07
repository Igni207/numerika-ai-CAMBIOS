/**
 * convergenceAnalyzer.js — Analiza por qué converge/diverge un método
 */

/**
 * Genera una explicación didáctica de la convergencia del resultado.
 * @returns {{ explanation: string, reasons: string[], converged: boolean }}
 */
export function analyzeConvergence(result, methodId, inputs) {
  const { iterations, converged, totalIter, root } = result;

  if (!converged) {
    return {
      explanation:
        `El método alcanzó el máximo de ${totalIter} iteraciones sin converger.\n\n` +
        `Opciones:\n` +
        `• Aumentar las iteraciones máximas\n` +
        `• Reducir la tolerancia\n` +
        `• Cambiar el punto inicial (métodos abiertos)\n` +
        `• Cambiar el intervalo [a, b] (métodos cerrados)`,
      reasons: [],
      converged: false,
    };
  }

  let reasons = [];
  let explanation = "";

  switch (methodId) {
    case "biseccion": {
      const a = parseFloat(inputs.a);
      const b = parseFloat(inputs.b);
      const tol = parseFloat(inputs.tolerance);
      const theoreticalError = ((b - a) / Math.pow(2, totalIter)).toFixed(8);
      reasons = [
        `f(${a.toFixed(2)}) y f(${b.toFixed(2)}) tienen signos opuestos → hay raíz en [${a}, ${b}]`,
        `En cada iteración el intervalo se reduce a la mitad`,
        `Error teórico: (b−a)/2ⁿ ≈ ${theoreticalError}`,
      ];
      explanation =
        `El método Bisección garantiza convergencia porque:\n• ${reasons.join("\n• ")}\n\n` +
        `Con ${totalIter} iteraciones se alcanzó la tolerancia.`;
      break;
    }

    case "reglafalsa": {
      reasons = [
        `f(a) y f(b) mantuvieron signos opuestos en todo momento`,
        `La interpolación lineal fue eficiente para esta función`,
        `Converge cuando f es suave y continua en el intervalo`,
      ];
      explanation =
        `Regla Falsa convergió porque:\n• ${reasons.join("\n• ")}\n\n` +
        `Más rápida que bisección pero con la misma garantía de convergencia.`;
      break;
    }

    case "newton": {
      const rate = estimateConvergenceOrder(iterations);
      reasons = [
        `La derivada f′(x) fue distinta de cero en cada paso`,
        `Convergencia ${rate > 1.5 ? "cuadrática (excelente)" : "lineal"}`,
        `x₀ estaba dentro de la cuenca de atracción de la raíz`,
      ];
      explanation =
        `Newton-Raphson convergió porque:\n• ${reasons.join("\n• ")}\n\n` +
        `Si la convergencia fuera lenta, x₀ estaría lejos de la raíz o f′(x) sería muy pequeña.`;
      break;
    }

    case "secante": {
      reasons = [
        `Los dos puntos iniciales estaban en la cuenca de atracción`,
        `La aproximación de f′(x) con la secante fue suficientemente buena`,
        `Convergencia superlineal (orden ≈ 1.618, el número áureo)`,
      ];
      explanation =
        `Secante convergió porque:\n• ${reasons.join("\n• ")}\n\n` +
        `Este método es más lento que Newton pero no necesita calcular la derivada.`;
      break;
    }

    case "puntofijo": {
      const gDerivs = estimateGDerivative(iterations);
      const avgDeriv = gDerivs.length > 0
        ? (gDerivs.reduce((a, b) => a + b, 0) / gDerivs.length)
        : 0;
      reasons = [
        `|g′(x)| ≈ ${Math.abs(avgDeriv).toFixed(4)} < 1 cerca de la raíz`,
        `La función g(x) es contractiva en esa zona`,
        `Velocidad de convergencia depende de |g′(x)|: cuanto menor, más rápido`,
      ];
      explanation =
        `Punto Fijo convergió porque:\n• ${reasons.join("\n• ")}\n\n` +
        `Si |g′(x)| hubiera sido ≥ 1, el método habría divergido.`;
      break;
    }

    default:
      explanation = `Convergencia alcanzada en ${totalIter} iteraciones.`;
  }

  return { explanation, reasons, converged: true };
}

/** Estima el orden de convergencia a partir de los errores */
function estimateConvergenceOrder(iterations) {
  if (iterations.length < 3) return 1;
  const errors = iterations.map((r) => r.err).filter((e) => e !== null && e > 0);
  if (errors.length < 3) return 1;

  const e1 = errors[errors.length - 3];
  const e2 = errors[errors.length - 2];
  const e3 = errors[errors.length - 1];

  if (e1 === 0 || e2 === 0) return 1;
  const ratio = Math.log(e3 / e2) / Math.log(e2 / e1);
  return isFinite(ratio) && ratio > 0 ? ratio : 1;
}

/** Estima |g'(x)| para Punto Fijo */
function estimateGDerivative(iterations) {
  return iterations
    .map((row, i) => {
      if (i === 0) return null;
      const prev = iterations[i - 1];
      const denom = prev.gx - prev.x;
      if (Math.abs(denom) < 1e-12) return null;
      return Math.abs((row.gx - row.x) / denom);
    })
    .filter((v) => v !== null);
}
