import { useState, useEffect, useCallback } from "react";
import { useMathEngine } from "./useMathEngine";
import { ResultDisplay } from "./ResultDisplay";
import { MathRenderer } from "./MathComponents";

export function SistemaEDO() {
    const { odeSystem, loading, error, clearError } = useMathEngine();
    const [equations, setEquations] = useState(`x' = y; y' = -x`);
    const [ics, setIcs] = useState({ x: "1", y: "0" });
    const [result, setResult] = useState(null);
    const [errorState, setError] = useState("");

    const handleSolve = async () => {
        clearError();
        if (!loading) {
            try {
                const equationsArray = equations.split(";").map(e => e.trim());
                const res = await odeSystem(equationsArray, ics);
                setResult(res);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const reset = () => {
        setEquations(`x' = y; y' = -x`);
        setIcs({ x: "1", y: "0" });
        setResult(null);
        clearError();
    };

    // Para el historial
    const addToHistory = (input, output) => {
        // Lógica de historial externa
    };

    return (
        <div className="edo-panel fade-up">
            <div className="panel-header">
                <span className="panel-title">Sistema de EDOs</span>
            </div>

            <div className="edo-input-group">
                <div className="field">
                    <label>Ecuaciones (x' = y; y' = -x)</label>
                    <textarea
                        rows={4}
                        value={equations}
                        onChange={e => setEquations(e.target.value)}
                    />
                </div>
            </div>

            <div className="edo-input-group">
                <div className="field-row">
                    <div className="field">
                        <label>x(0)</label>
                        <input type="text" value={ics.x} onChange={e => setIcs(p => ({ ...p, x: e.target.value }))} placeholder="x0" />
                    </div>
                    <div className="field">
                        <label>y(0)</label>
                        <input type="text" value={ics.y} onChange={e => setIcs(p => ({ ...p, y: e.target.value }))} placeholder="y0" />
                    </div>
                </div>
            </div>

            <div className="edo-actions">
                <button className="edo-btn primary" onClick={handleSolve}>
                    {loading ? "Calculando..." : "SOLUCIONAR SISTEMA"}
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
