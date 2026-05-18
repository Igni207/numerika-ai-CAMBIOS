import { useState, useCallback } from "react";
import { useMathEngine } from "../hooks/useMathEngine";
import { getFriendlyError } from "../utils/friendlyErrors";

// ─── EJEMPLOS DE SISTEMAS ───
    const SYSTEM_EXAMPLES = [
    {
        label: "Armónico (x,y)",
        equations: "x' = y\ny' = -x",
        vars: ["x", "y"],
        ics: { x: "1", y: "0" },
    },
    {
        label: "Lotka-Volterra",
        equations: "x' = x - x*y\ny' = x*y - y",
        vars: ["x", "y"],
        ics: { x: "2", y: "1" },
    },
    {
        label: "Sistema 3x3",
        equations: "x' = y\ny' = z\nz' = -x - y - z",
        vars: ["x", "y", "z"],
        ics: { x: "1", y: "0", z: "0" },
    },
    {
        label: "Circuito RC",
        equations: "x' = -x + y\ny' = -y",
        vars: ["x", "y"],
        ics: { x: "0", y: "1" },
    },
    ];

    // ─── Parsea las variables del sistema desde las ecuaciones ───
    function parseVarsFromEquations(eqString) {
    const lines = eqString.split(/[;\n]/).map(l => l.trim()).filter(Boolean);
    const vars = [];
    lines.forEach(line => {
        const m = line.match(/^([a-zA-Z]+)\s*'/);
        if (m && !vars.includes(m[1])) vars.push(m[1]);
    });
    return vars.length > 0 ? vars : ["x", "y"];
    }

    export function SistemaEDO() {
    const { odeSystem, loading, error, clearError } = useMathEngine();

    const [equations, setEquations] = useState("x' = y\ny' = -x");
    const [ics, setIcs] = useState({ x: "1", y: "0" });
    const [result, setResult] = useState(null);

    // Detectar variables automáticamente desde la ecuación
    const detectedVars = parseVarsFromEquations(equations);

    // ─── Cargar ejemplo ───
    const loadExample = (ex) => {
        setEquations(ex.equations);
        const newIcs = {};
        ex.vars.forEach(v => { newIcs[v] = ex.ics[v] ?? "0"; });
        setIcs(newIcs);
        setResult(null);
        clearError();
    };

    // ─── Sincronizar ICs cuando cambian las variables detectadas ───
    const syncIcs = useCallback((vars) => {
        setIcs(prev => {
        const next = {};
        vars.forEach(v => { next[v] = prev[v] ?? "0"; });
        return next;
        });
    }, []);

    const handleEquationsChange = (val) => {
        setEquations(val);
        const vars = parseVarsFromEquations(val);
        syncIcs(vars);
    };

    // ─── Resolver sistema ───
    const handleSolve = useCallback(async () => {
        if (!equations.trim()) return;
        clearError();
        setResult(null);
        try {
        const equationsArray = equations
            .split(/[;\n]/)
            .map(e => e.trim())
            .filter(Boolean);
        const res = await odeSystem(equationsArray, ics);
        setResult(res);
        } catch (err) {
        // Error manejado en el hook
        }
    }, [equations, ics, odeSystem, clearError]);

    const reset = () => {
        setEquations("x' = y\ny' = -x");
        setIcs({ x: "1", y: "0" });
        setResult(null);
        clearError();
    };

    const friendlyErr = error ? getFriendlyError(error) : null;

    return (
        <div className="edo-panel fade-up">

        {/* ─── HEADER ─── */}
        <div className="panel-header">
            <span className="panel-title">Sistema de EDOs</span>
        </div>

        {/* ─── EJEMPLOS ─── */}
        <div className="edo-examples">
            <span className="edo-examples-label">Ejemplos</span>
            <div className="edo-examples-list">
            {SYSTEM_EXAMPLES.map((ex, i) => (
                <button
                key={i}
                className="calc-example-chip"
                onClick={() => loadExample(ex)}
                >
                {ex.label}
                </button>
            ))}
            </div>
        </div>

        <div className="solver-grid edo-solver-grid">

            {/* ─── PANEL IZQUIERDO: Entrada ─── */}
            <div className="panel" id="sistema-input-panel">
            <div className="panel-header">
                <span className="panel-title">Entrada</span>
            </div>
            <div className="panel-body">

                {/* Ecuaciones */}
                <div className="field">
                <label htmlFor="sistema-equations">Ecuaciones del sistema</label>
                <textarea
                    id="sistema-equations"
                    rows={5}
                    value={equations}
                    onChange={e => handleEquationsChange(e.target.value)}
                    placeholder={"x' = y\ny' = -x"}
                    className="edo-textarea"
                    spellCheck={false}
                />
                <span className="field-hint">
                    Una ecuación por línea. Ej: x&apos; = y — separá con Enter o punto y coma.
                </span>
                </div>

                {/* Condiciones Iniciales — auto-generadas desde variables detectadas */}
                <div className="field">
                <label>Condiciones Iniciales (en t = 0)</label>
                <div className="sistema-ics-grid">
                    {detectedVars.map(v => (
                    <div key={v} className="sistema-ic-row">
                        <span className="ic-label">{v}(0) =</span>
                        <input
                        type="text"
                        className="ic-value-input"
                        value={ics[v] ?? "0"}
                        onChange={e => setIcs(prev => ({ ...prev, [v]: e.target.value }))}
                        placeholder="0"
                        />
                    </div>
                    ))}
                </div>
                <span className="field-hint">
                    Variables detectadas: {detectedVars.join(", ")}
                </span>
                </div>

                {/* Botones */}
                <button
                className="calc-submit"
                onClick={handleSolve}
                disabled={loading || !equations.trim()}
                id="sistema-solve-btn"
                >
                {loading
                    ? <><span className="calc-spinner" /> Resolviendo sistema...</>
                    : "Resolver Sistema"}
                </button>

                <button
                className="edo-btn secondary"
                style={{ marginTop: 8 }}
                onClick={reset}
                >
                Reiniciar
                </button>

            </div>
            </div>

            {/* ─── PANEL DERECHO: Resultado ─── */}
            <div className="panel" id="sistema-result-panel">
            <div className="panel-header">
                <span className="panel-title">Solución</span>
            </div>
            <div className="panel-body">

                {/* Error amigable */}
                {friendlyErr && (
                <div className={`friendly-error-box friendly-error-box--${friendlyErr.severity} fade-up`}>
                    <div className="friendly-error-title">
                    {friendlyErr.severity === "warning" ? "⚠ Advertencia" : "✕ Error"}
                    </div>
                    <p className="friendly-error-msg">{friendlyErr.friendly}</p>
                    {friendlyErr.tip && (
                    <p className="friendly-error-tip">
                        <strong>Sugerencia:</strong> {friendlyErr.tip}
                    </p>
                    )}
                    <details className="friendly-error-details">
                    <summary>Ver error técnico</summary>
                    <code>{friendlyErr.technical}</code>
                    </details>
                </div>
                )}

                {result && !error ? (
                <SistemaResult result={result} />
                ) : !error ? (
                <div className="result-placeholder">
                    <span style={{ fontSize: 32, opacity: 0.3 }}>∂∂</span>
                    <p>Ingresá el sistema y las condiciones iniciales.</p>
                </div>
                ) : null}

            </div>
            </div>
        </div>
        </div>
    );
    }

    // ─── COMPONENTE DE RESULTADO DEL SISTEMA ───
    function SistemaResult({ result }) {
    const [showSteps, setShowSteps] = useState(false);

    return (
        <div className="edo-result fade-up">

        {/* Soluciones por variable */}
        {result.solutions && Object.entries(result.solutions).map(([varName, sol]) => (
            <div key={varName} className="edo-result-block">
            <span className="edo-result-block-title">{varName}(t)</span>
            <div className="edo-result-math">
                <code>{sol}</code>
            </div>
            </div>
        ))}

        {/* Solución general si existe */}
        {result.general_solution && !result.solutions && (
            <div className="edo-result-block edo-result-block--highlight">
            <span className="edo-result-block-title">Solución general</span>
            <div className="edo-result-math edo-result-math--primary">
                <code>{result.general_solution}</code>
            </div>
            </div>
        )}

        {/* Autovalores / matriz */}
        {result.eigenvalues && (
            <div className="edo-result-block">
            <span className="edo-result-block-title">Autovalores</span>
            <div className="edo-result-tags" style={{ marginTop: 6 }}>
                {result.eigenvalues.map((ev, i) => (
                <span key={i} className="edo-tag">λ{i + 1} = {String(ev)}</span>
                ))}
            </div>
            </div>
        )}

        {/* Pasos */}
        {result.steps?.length > 0 && (
            <div className="stepbystep">
            <button
                className="stepbystep-toggle"
                onClick={() => setShowSteps(v => !v)}
                type="button"
            >
                <span className="stepbystep-toggle-left">
                <span className="stepbystep-arrow">{showSteps ? "▾" : "▸"}</span>
                Procedimiento de resolución
                </span>
                <span className="stepbystep-badge">{showSteps ? "Cerrar" : "Ver pasos"}</span>
            </button>
            {showSteps && (
                <div className="stepbystep-body fade-up">
                <ol className="stepbystep-list">
                    {result.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                    ))}
                </ol>
                </div>
            )}
            </div>
        )}

        {/* Meta */}
        {result.method && (
            <div className="edo-result-meta">
            <span>Método: <strong>{result.method}</strong></span>
            {result.dimension && <span>Dimensión: <strong>{result.dimension}×{result.dimension}</strong></span>}
            </div>
        )}
        </div>
    );
    }