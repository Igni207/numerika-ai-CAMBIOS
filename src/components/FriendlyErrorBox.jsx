import { useState } from "react";
import { getFriendlyError } from "../utils/friendlyErrors";

/**
 * FriendlyErrorBox
 * 
 * Muestra errores/warnings de métodos numéricos de forma amigable.
 * Incluye:
 *  - Mensaje principal friendly (visible siempre)
 *  - Tip / sugerencia
 *  - Detalle técnico desplegable
 * 
 * Props:
 *  - errorMsg: string del error técnico original
 *  - compact: boolean (default false) - modo compacto para tablas
 */
export const FriendlyErrorBox = ({ errorMsg, compact = false }) => {
  const [showDetail, setShowDetail] = useState(false);

  if (!errorMsg) return null;

  const info = getFriendlyError(errorMsg);
  const isWarning = info.severity === "warning";

  if (compact) {
    return (
      <div className={`friendly-error-compact ${info.severity}`}>
        <div className="friendly-error-compact-icon">
          {isWarning ? "⚠" : "✕"}
        </div>
        <div className="friendly-error-compact-body">
          <p className="friendly-error-compact-text">{info.friendly}</p>
          <button
            className="friendly-error-detail-toggle compact"
            onClick={() => setShowDetail((v) => !v)}
            type="button"
          >
            {showDetail ? "Ocultar detalle técnico" : "Ver detalle técnico"}
          </button>
          {showDetail && (
            <code className="friendly-error-technical compact">{info.technical}</code>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`friendly-error-box ${info.severity}`}>
      {/* Header con ícono */}
      <div className="friendly-error-header">
        <span className="friendly-error-icon">
          {isWarning ? "⚠" : "✕"}
        </span>
        <span className="friendly-error-title">
          {isWarning ? "Atención" : "Error"}
        </span>
      </div>

      {/* Mensaje amigable */}
      <p className="friendly-error-message">{info.friendly}</p>

      {/* Tip */}
      {info.tip && (
        <p className="friendly-error-tip">
          <strong>💡 Sugerencia:</strong> {info.tip}
        </p>
      )}

      {/* Detalle técnico desplegable */}
      <button
        className="friendly-error-detail-toggle"
        onClick={() => setShowDetail((v) => !v)}
        type="button"
      >
        <span className="friendly-error-detail-arrow">{showDetail ? "▾" : "▸"}</span>
        {showDetail ? "Ocultar detalle técnico" : "Ver detalle técnico"}
      </button>

      {showDetail && (
        <code className="friendly-error-technical">{info.technical}</code>
      )}
    </div>
  );
};
