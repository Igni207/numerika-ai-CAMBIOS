/**
 * graphUtils.js — Utilidades para el gráfico del solver
 */

/**
 * Calcula rango de visualización considerando zoom
 */
export function calculateZoomedRange(baseMin, baseMax, zoomLevel, centerX) {
  const baseRange = Math.abs(baseMax - baseMin);
  const zoomedRange = baseRange / zoomLevel;
  const margin = zoomedRange / 2;

  return {
    min: centerX - margin,
    max: centerX + margin,
    range: zoomedRange,
  };
}

/**
 * Calcula el centro por defecto (entre baseMin y baseMax, o la raíz si existe)
 */
export function getDefaultCenter(baseMin, baseMax, root) {
  if (root !== null && root !== undefined && isFinite(root)) {
    return root;
  }
  return (baseMin + baseMax) / 2;
}
