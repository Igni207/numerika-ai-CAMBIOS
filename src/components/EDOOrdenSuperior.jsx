    import { useState, useCallback } from "react";
    import { useMathEngine } from "../hooks/useMathEngine";
    import { getFriendlyError } from "../utils/friendlyErrors";

    // ─── EJEMPLOS DE EDO ORDEN SUPERIOR ───
    const EDO_EXAMPLES = [
    { label: "Armónico simple", eq: "y'' + y = 0", ics: [{ d: "0", at: "0", v: "1" }, { d: "1", at: "0", v: "0" }] },
    { label: "Amortiguado", eq: "y'' + 2*y' + y = 0", ics: [{ d: "0", at: "0", v: "1" }, { d: "1", at: "0", v: "0" }] },
    { label: "No homogénea", eq: "y'' - y = exp(x)", ics: [{ d: "0", at: "0", v: "0" }, { d: "1", at: "0", v: "1" }] },
    { label: "Orden 1 simple", eq: "y' - y = 0", ics: [{ d: "0", at: "0", v: "1" }] },
    { label: "Con forzamiento", eq: "y'' + 4*y = sin(2*x)", ics: [{ d: "0", at: "0", v: "0" }, { d: "1", at: "0", v: "0" }] },
    ];

    // ─── REFERENCIA DE SINTAXIS ───
    const SYNTAX_TIPS = [
    { sym: "y'", desc: "primera derivada" },
    { sym: "y''", desc: "segunda derivada" },
    { sym: "y'''", desc: "tercera derivada" },
    { sym: "exp(x)", desc: "función exponencial" },
    { sym: "sin(x), cos(x)", desc: "trigonométricas" },
    ];

    export function EDOOrdenSuperior() {
    const { odeSolve, loading, error, clearError } = useMathEngine();

    const [equation, setEquation] = useState("y'' + y = 0");
    const [ics, setIcs] = useState([
        { d: "0", at: "0", v: "1" },
        { d: "1", at: "0", v: "0" },
    ]);
    const [result, setResult] = useState(null);
    const [showSyntax, setShowSyntax] = useState(false);

    // ─── Manipuladores de condiciones iniciales ───
    const addIC = () => setIcs(p => [...p, { d: String(p.length), at: "0", v: "0" }]);
    const removeIC = (i) => setIcs(p => p.filter((_, idx) => idx !== i));
    const updateIC = (i, field, val) => setIcs(p => p.map((ic, idx) => idx === i ? { ...ic, [field]: val } : ic));

    // ─── Cargar ejemplo ───
    const loadExample = (ex) => {
        setEquation(ex.eq);
        setIcs(ex.ics);
        setResult(null);
        clearError();
    };

    // ─── Resolver EDO ───
    const handleSolve = useCallback(async () => {
        if (!equation.trim()) return;
        clearError();
        setResult(null);
        try {
        const res = await odeSolve(equation, ics.filter(ic => ic.v !== ""));
        setResult(res);
        } catch (err) {
        // Error manejado en el hook
        }
    }, [equation, ics, odeSolve, clearError]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !loading) handleSolve();
    };

    const friendlyErr = error ? getFriendlyError(error) : null;

    // ─── Orden de derivada como superíndice legible ───
    const derivLabel = (d) => {
        const ord = parseInt(d);
        if (ord === 0) return "y";
        if (ord === 1) return "y′";
        if (ord === 2) return "y″";
        return `y(${ord})`;
    };

    return (
        <div className="edo-panel fade-up">

        {/* ─── HEADER DEL PANEL ─── */}
        <div className="panel-header">
            <span className="panel-title">EDO de Orden Superior</span>
            <button
            className="syntax-toggle"
            onClick={() => setShowSyntax(v => !v)}
            title="Ver referencia de sintaxis"
            >
            {showSyntax ? "Ocultar sintaxis" : "Ver sintaxis"}
            </button>
        </div>

        {/* ─── REFERENCIA DE SINTAXIS (colapsable) ─── */}
        {showSyntax && (
            <div className="edo-syntax-ref fade-up">
            <div className="edo-syntax-title">Referencia de sintaxis</div>
            <div className="edo-syntax-grid">
                {SYNTAX_TIPS.map((tip, i) => (
                <div key={i} className="edo-syntax-item">
                    <code>{tip.sym}</code>
                    <span>{tip.desc}</span>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* ─── EJEMPLOS RÁPIDOS ─── */}
        <div className="edo-examples">
            <span className="edo-examples-label">Ejemplos</span>
            <div className="edo-examples-list">
            {EDO_EXAMPLES.map((ex, i) => (
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
            <div className="panel" id="edo-input-panel">
            <div className="panel-header">
                <span className="panel-title">Entrada</span>
            </div>
            <div className="panel-body">

                {/* Ecuación */}
                <div className="field">
                <label htmlFor="edo-equation">Ecuación diferencial</label>
                <input
                    id="edo-equation"
                    type="text"
                    value={equation}
                    onChange={e => setEquation(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="y'' + y = 0"
                    className="edo-eq-input"
                    autoComplete="off"
                    spellCheck={false}
                />
                <span className="field-hint">
                    Usá y′, y″, y‴ o y′, y″ para derivadas. Variable independiente: x.
                </span>
                </div>

                {/* Condiciones Iniciales */}
                <div className="field">
                <label>Condiciones Iniciales</label>
                <div className="ic-list">
                    {ics.map((ic, i) => (
                    <div key={i} className="ic-row">
                        <span className="ic-label">
                        {derivLabel(ic.d)}(
                        <input
                            type="text"
                            className="ic-at-input"
                            value={ic.at}
                            onChange={e => updateIC(i, "at", e.target.value)}
                            placeholder="0"
                            title="Punto de evaluación"
                        />
                        ) =
                        </span>
                        <input
                        type="text"
                        className="ic-value-input"
                        value={ic.v}
                        onChange={e => updateIC(i, "v", e.target.value)}
                        placeholder="0"
                        />
                        <select
                        className="ic-order-select"
                        value={ic.d}
                        onChange={e => updateIC(i, "d", e.target.value)}
                        title="Orden de la derivada"
                        >
                        {[0, 1, 2, 3, 4].map(n => (
                            <option key={n} value={String(n)}>{derivLabel(String(n))}</option>
                        ))}
                        </select>
                        <button
                        className="ic-remove-btn"
                        onClick={() => removeIC(i)}
                        title="Eliminar condición"
                        >✕</button>
                    </div>
                    ))}
                </div>
                <button className="ic-add-btn" onClick={addIC}>
                    + Agregar condición
                </button>
                </div>

                {/* Botón resolver */}
                <button
                className="calc-submit"
                onClick={handleSolve}
                disabled={loading || !equation.trim()}
                id="edo-solve-btn"
                >
                {loading
                    ? <><span className="calc-spinner" /> Resolviendo...</>
                    : "Resolver EDO"}
                </button>

                <button
                className="edo-btn secondary"
                style={{ marginTop: 8 }}
                onClick={() => { setResult(null); clearError(); }}
                >
                Limpiar
                </button>

            </div>
            </div>

            {/* ─── PANEL DERECHO: Resultado ─── */}
            <div className="panel" id="edo-result-panel">
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

                {/* Resultado */}
                {result && !error ? (
                <EDOResult result={result} equation={equation} />
                ) : !error ? (
                <div className="result-placeholder">
                    <span style={{ fontSize: 32, opacity: 0.3 }}>∂</span>
                    <p>Ingresá una EDO y sus condiciones iniciales, luego presioná Resolver.</p>
                </div>
                ) : null}

            </div>
            </div>
        </div>
        </div>
    );
    }

    // ─── COMPONENTE DE RESULTADO ───
    function EDOResult({ result, equation }) {
    const [showSteps, setShowSteps] = useState(false);

    return (
        <div className="edo-result fade-up">

        {/* Ecuación resuelta */}
        <div className="edo-result-header">
            <span className="edo-result-label">Ecuación resuelta</span>
            <code className="edo-result-eq">{equation}</code>
        </div>

        {/* Solución general */}
        {result.general_solution && (
            <div className="edo-result-block">
            <span className="edo-result-block-title">Solución general</span>
            <div className="edo-result-math">
                <code>{result.general_solution}</code>
            </div>
            </div>
        )}

        {/* Solución particular */}
        {result.particular_solution && (
            <div className="edo-result-block edo-result-block--highlight">
            <span className="edo-result-block-title">Solución particular (con C.I.)</span>
            <div className="edo-result-math edo-result-math--primary">
                <code>{result.particular_solution}</code>
            </div>
            </div>
        )}

        {/* Clasificación */}
        {result.classification && (
            <div className="edo-result-tags">
            {Object.entries(result.classification).map(([k, v]) => (
                <span key={k} className="edo-tag">
                <span className="edo-tag-key">{k}:</span> {String(v)}
                </span>
            ))}
            </div>
        )}

        {/* Pasos de resolución */}
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

        {/* Info de la respuesta */}
        {result.method && (
            <div className="edo-result-meta">
            <span>Método: <strong>{result.method}</strong></span>
            {result.order && <span>Orden: <strong>{result.order}</strong></span>}
            </div>
        )}
        </div>
    );
    }