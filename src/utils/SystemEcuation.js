/**1A. SISTEMAS DE ECUACIONES: ELIMINACIÓN DE GAUSS. Resuelve sistemas lineales exactos.
 */
export function resolverGauss(matrizA, vectorB) {
    const n = vectorB.length;
    let M = matrizA.map((row, i) => [...row, vectorB[i]]);

    // Triangularización
    for (let i = 0; i < n; i++) {
        // Pivoteo
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
        }
        [M[i], M[maxRow]] = [M[maxRow], M[i]];
        for (let j = i + 1; j < n; j++) {
            let factor = M[j][i] / M[i][i];
            for (let k = i; k <= n; k++) M[j][k] -= factor * M[i][k];
        }
    }
    // Sustitución hacia atrás
    let x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) sum += M[i][j] * x[j];
        x[i] = (M[i][n] - sum) / M[i][i];
    }
    return x.map(val => Number(val.toFixed(4))); // Retorna array de resultados
}
/**1B. SISTEMAS DE ECUACIONES: MÉTODO DE JACOBI. Método iterativo para sistemas.
 */
export function resolverJacobi(matrizA, vectorB, tolerancia = 0.0001, maxIter = 100) {
    const n = vectorB.length;
    let x = new Array(n).fill(0);
    let iteraciones = [];

    for (let k = 0; k < maxIter; k++) {
        let x_new = new Array(n).fill(0);
        let errorMax = 0;
        for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
                if (i !== j) sum += matrizA[i][j] * x[j];
            }
            x_new[i] = (vectorB[i] - sum) / matrizA[i][i];

            let errorActual = Math.abs(x_new[i] - x[i]);
            if (errorActual > errorMax) errorMax = errorActual;
        }
        iteraciones.push({ iteracion: k + 1, valores: [...x_new], error: errorMax });
        x = [...x_new];
        if (errorMax < tolerancia) break;
    }
    return { solucion: x.map(v => Number(v.toFixed(4))), iteraciones };
}
/** 2. INTERPOLACIÓN: POLINOMIO DE LAGRANGE. Genera puntos para graficar una curva suave que pasa por coordenadas exactas.
 */
export function interpolacionLagrange(puntosOriginales, cantidadPuntosGrafico = 100) {
    const n = puntosOriginales.length;

    const evaluarEnX = (x) => {
        let resultado = 0;
        for (let i = 0; i < n; i++) {
            let termino = puntosOriginales[i].y;
            for (let j = 0; j < n; j++) {
                if (j !== i) termino *= (x - puntosOriginales[j].x) / (puntosOriginales[i].x - puntosOriginales[j].x);
            }
            resultado += termino;
        }
        return resultado;
    };
    const xMin = Math.min(...puntosOriginales.map(p => p.x));
    const xMax = Math.max(...puntosOriginales.map(p => p.x));
    const paso = (xMax - xMin) / cantidadPuntosGrafico;

    let curvaGenerada = [];
    for (let x = xMin; x <= xMax; x += paso) {
        curvaGenerada.push({ x: Number(x.toFixed(2)), y: Number(evaluarEnX(x).toFixed(4)) });
    }
    return curvaGenerada; // Retorna array para Recharts
}
/** 3.1. EDO: MÉTODO DE EULER
 */
export function edoEuler(derivada, t0, y0, h, tFinal) {
    let resultados = [{ t: t0, y: y0 }];
    let t = t0;
    let y = y0;

    while (t < tFinal) {
        y = y + h * derivada(t, y);
        t = t + h;
        resultados.push({ t: Number(t.toFixed(2)), y: Number(y.toFixed(4)) });
    }
    return resultados;
}
/** 3.2. EDO: RUNGE-KUTTA DE 4TO ORDEN (RK4)
 */
export function edoRK4(derivada, t0, y0, h, tFinal) {
    let resultados = [{ t: t0, y: y0 }];
    let t = t0;
    let y = y0;

    while (t < tFinal) {
        let k1 = derivada(t, y);
        let k2 = derivada(t + h / 2, y + (h * k1) / 2);
        let k3 = derivada(t + h / 2, y + (h * k2) / 2);
        let k4 = derivada(t + h, y + h * k3);

        y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
        t = t + h;
        resultados.push({ t: Number(t.toFixed(2)), y: Number(y.toFixed(4)) });
    }
    return resultados;
}