import { useState, useCallback, useEffect } from "react";
import { useMathEngine } from "./useMathEngine";
import { ResultDisplay } from "./ResultDisplay";
import { MathRenderer } from "./MathComponents";

export function EDOOrdenSuperior() {
    const { odeSolve, loading, error, clearError } = useMathEngine();
    const [equation, setEquation] = useState("y'' + y = 0");
    const [ics, setIcs] = useState([
        { d: "0", at: "0", v: "1" },
        { d: "1", at: "0", v: "0" },
    ]);
    const [result, setResult] = useState(null);
    const [errorState, setError] = useState("");

    const handleSolve = async () => {
        clearError();
        if (!loading) {
            try {
                // Payload: ics mapeado a { derivative, at, value }
                const icsPayload = ics.filter(ic => ic.v !== "")
                    .map(ic => ({
                        derivative: parseInt(ic.d) || 0,
                        at: ic.at || "0",
                        value: ic.v || "0"
                    }));

                const res = await odeSolve(equation, icsPayload);
                setResult(res);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const addIC = () => setIcs(p => [...p, { d: String(p.length), at: "0", v: "0" }]);
    const removeIC = (i) => setIcs(p => p.filter((_, idx) => idx !== i));
    const updateIC = (i, field, val) => setIcs(p => p.map((ic, idx) => idx === i ? { ...ic, [field]: val } : ic));
    const handleEquationChange = (val) => setEquation(val);

    // Handlers para el historial
    const addToHistory = (input, output) => {
        // Se manejará en CalculadoraPage, esto es solo lógica auxiliar
    };

    const reset = () => {
        setEquation("y'' + y = 0");
        setIcs([{ d: "0", at: "0", v: "1" }, { d: "1", at: "0", v: "0" }]);
        setResult(null);
        clearError();
    };

    return (
        <div className="edo-panel fade-up">
            <div className="panel-header">
                <span className="panel-title">Configuración de EDO de Orden Superior</span>
            </div>
            
            <div className="edo-input-group">
                <div className="field">
                    <label>Ecuación</label>
                    <input
                        type="text"
                        value={equation}
                        onChange={e => handleEquationChange(e.target.value)}
                        placeholder="y'' + y = 0"
                    />
                </div>
            </div>

            <div className="edo-input-group">
                <div className="field">
                    <label>Condiciones Iniciales (ICs)</label>
                    {ics.map((ic, i) => (
                        <div key={i} className="ic-row">
                            <input type="text" value={ic.d} onChange={e => updateIC(i, "d", e.target.value)} placeholder="d" />
                            <span>@</span>
                            <input type="text" value={ic.at} onChange={e => updateIC(i, "at", e.target.value)} placeholder="at" />
                            <input type="text" value={ic.v} onChange={e => updateIC(i, "v", e.target.value)} placeholder="v" />
                            <button onClick={() => removeIC(i)}>✕</button>
                        </div>
                    ))}
                    <button onClick={addIC}>+ Agregar IC</button>
                </div>
            </div>

            <div className="edo-actions">
                <button className="edo-btn primary" onClick={handleSolve}>
                    {loading ? "Calculando..." : "SOLUCIONAR EDO"}
                </button>
                <button className="edo-btn secondary" onClick={reset}>Reiniciar</button>
            </div>

            <div className="edo-result-group">
                {error && <div className="solver-error">{error}</div>}
                {result && (
                    <ResultDisplay result={result} />
                )}
            </div>
        </div>
    );
}
