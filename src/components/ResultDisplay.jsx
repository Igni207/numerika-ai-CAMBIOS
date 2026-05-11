import { MathRenderer } from "./MathComponents";

export function ResultDisplay({ result, type = "text" }) {
    if (!result) return null;

    return (
        <div className={`result-display ${type}`}>
            <div className="result-label">
                {type === "ode" ? "Solución ODE:" : "Resultados:"}
            </div>
            {result.has_ics ? (
                 <MathRenderer latex={result.particular_sol} />
            ) : (
                <MathRenderer latex={result.general_sol} />
            )}
            {result.error && (
                <div className="result-error">{result.error}</div>
            )}
        </div>
    );
}
