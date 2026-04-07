import { useState } from "react";
import { METHOD_DOCUMENTATION } from "../constants/methodDocs";

/**
 * MethodTooltip — Tooltip flotante con info del método al hacer hover
 */
export const MethodTooltip = ({ methodId, children }) => {
  const [visible, setVisible] = useState(false);
  const doc = METHOD_DOCUMENTATION[methodId];

  if (!doc) return children;

  return (
    <div
      className="method-tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      {visible && (
        <div className="method-tooltip-card">
          <div className="mtt-header">
            <span className="mtt-name">{doc.name}</span>
            <span className="mtt-convergence">{doc.convergenceType}</span>
          </div>

          <p className="mtt-desc">{doc.shortDesc}</p>

          <div className="mtt-section">
            <span className="mtt-section-title">✓ Ventajas</span>
            <ul className="mtt-list pros">
              {doc.pros.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="mtt-section">
            <span className="mtt-section-title">✗ Limitaciones</span>
            <ul className="mtt-list cons">
              {doc.cons.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="mtt-footer">
            <div className="mtt-meta">
              <span className="mtt-meta-label">Complejidad</span>
              <span className="mtt-meta-value">{doc.complexity}</span>
            </div>
            <div className="mtt-meta">
              <span className="mtt-meta-label">Mejor para</span>
              <span className="mtt-meta-value">{doc.bestFor}</span>
            </div>
          </div>

          <div className="mtt-arrow" />
        </div>
      )}
    </div>
  );
};
