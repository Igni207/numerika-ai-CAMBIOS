import { useState, useCallback, useRef } from "react";

const DEFAULT_URL =
  import.meta.env.VITE_MATH_ENGINE_URL || "http://localhost:8000";

export function useMathEngine(baseUrl = DEFAULT_URL) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  // ── Fetch genérico ──────────────────────────────────────────────────────────
  const request = useCallback(
    async (endpoint, body) => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${baseUrl}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || `Error del servidor (${res.status})`);
        }

        const data = await res.json();
        return data;
      } catch (err) {
        if (err.name === "AbortError") return null;
        const msg =
          err.message === "Failed to fetch"
            ? "No se pudo conectar con el motor matemático."
            : err.message;
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
        controllerRef.current = null;
      }
    },
    [baseUrl]
  );

  // ── Funciones Básicas ──────────────────────────────────────────────────────
  const derive = useCallback(
    (expression, variable = "x") =>
      request("/api/math/derive", { expression, variable }),
    [request]
  );

  const integrate = useCallback(
    (expression, variable = "x", lower, upper) =>
      request("/api/math/integrate", { expression, variable, lower, upper }),
    [request]
  );

  const simplify = useCallback(
    (expression, variable = "x") =>
      request("/api/math/simplify", { expression, variable }),
    [request]
  );

  const factorize = useCallback(
    (expression, variable = "x") =>
      request("/api/math/factorize", { expression, variable }),
    [request]
  );

  const solve = useCallback(
    (equation, variable = "x") =>
      request("/api/math/solve", { equation, variable }),
    [request]
  );

  // ── Funciones EDO ──────────────────────────────────────────────────────────

  /**
   * odeSolve — Resuelve una EDO escalar de orden arbitrario.
   * @param {string} equation  — ej: "y'' + y = 0"
   * @param {Array}  ics       — [{ d: "0", at: "0", v: "1" }, ...]
   */
  const odeSolve = useCallback(
    async (equation, ics = []) => {
      const payload = {
        equation,
        initial_conditions: ics.map(ic => ({
          derivative: parseInt(ic.d) || 0,
          at: ic.at ?? "0",
          value: ic.v ?? "0",
        })),
      };
      return request("/api/ode/solve", payload);
    },
    [request]
  );

  /**
   * Resuelve un sistema de EDOs de primer orden.
   * @param {string[]} equations — ["x' = y", "y' = -x"]
   * @param {Object}   ics       — { x: "1", y: "0" }
   */
  const odeSystem = useCallback(
    async (equations, ics) => {
      const payload = {
        equations,
        initial_conditions: ics,
      };
      return request("/api/ode/system", payload);
    },
    [request]
  );

  // ── Utils ──────────────────────────────────────────────────────────────────
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }, [baseUrl]);

  return {
    // Básicas
    derive,
    integrate,
    simplify,
    factorize,
    solve,
    // EDOs
    odeSolve,
    odeSystem,
    // Estado & Utils
    loading,
    error,
    clearError: () => setError(null),
    checkHealth,
  };
}