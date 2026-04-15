import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceDot, ResponsiveContainer, ReferenceArea,
} from "recharts";

// ─── Componente Principal ─────────────────────────────────────────────────────
// Modelo: Disipación térmica en un sistema CPU/GPU con disipador.
// Se busca la temperatura T (°C) donde la disipación iguala la generación de calor.
// Ecuación: f(T) = h·A·(T - T_amb) + ε·σ·A·(T⁴ - T_amb⁴) - Q = 0
//   h   = coeficiente de convección (W/m²·K)
//   A   = área del disipador (m²)
//   ε   = emisividad de la superficie
//   σ   = constante de Stefan-Boltzmann (5.67e-8 W/m²·K⁴)
//   Q   = potencia generada por el procesador (W)
//
// Simulación transitoria: T(t+dt) = T(t) + (Q - Qdisipado) / (m·Cp) · dt
//   m   = masa del disipador (kg)
//   Cp  = calor específico del material (J/kg·K)
export default function SimuladorEnfriamiento() {
  const [params, setParams] = useState({
    h: 35,          // Coeficiente de convección (W/m²·K)
    A: 0.015,       // Área del disipador (m²)
    eps: 0.85,       // Emisividad
    Q: 95,          // TDP / Potencia (W)
    Tamb: 25,       // Temperatura ambiente (°C)
    a: 30,          // Límite inferior de búsqueda (°C)
    b: 150,         // Límite superior de búsqueda (°C)
    Tlimit: 90,     // Temperatura límite (°C) — throttling / daño
    mass: 0.35,     // Masa del disipador (kg)
    Cp: 900,        // Calor específico del aluminio (J/kg·K)
    Toptmin: 40,    // Rango óptimo mínimo (°C)
    Toptmax: 75,    // Rango óptimo máximo (°C)
  });

  const [result, setResult] = useState(null);

  const SIGMA = 5.670374419e-8; // Constante de Stefan-Boltzmann

  // ─── Motor Bisección + Simulación Transitoria ──────────────────────────
  const calcularTemperatura = () => {
    const { h, A, eps, Q, Tamb, a, b, Tlimit, mass, Cp, Toptmin, Toptmax } = params;

    if (A <= 0 || Q <= 0 || h <= 0 || mass <= 0 || Cp <= 0) { setResult(null); return; }

    const TambK = Tamb + 273.15;

    // f(T) = convección + radiación - Q
    const f = (T) => {
      const Tk = T + 273.15;
      return h * A * (T - Tamb) + eps * SIGMA * A * (Math.pow(Tk, 4) - Math.pow(TambK, 4)) - Q;
    };

    let lo = parseFloat(a);
    let hi = parseFloat(b);
    const tol = 0.0001;
    const iterations = [];
    let converged = false;
    let mid = (lo + hi) / 2;

    if (f(lo) * f(hi) > 0) {
      setResult({ root: null, iterations: [], converged: false, totalIter: 0, error: "f(a) y f(b) tienen el mismo signo. No se garantiza raíz en el intervalo." });
      return;
    }

    for (let i = 0; i < 100; i++) {
      mid = (lo + hi) / 2;
      const fMid = f(mid);
      const err = Math.abs((hi - lo) / 2 / mid) * 100;

      iterations.push({
        n: i + 1,
        a: lo.toFixed(4),
        b: hi.toFixed(4),
        c: mid.toFixed(6),
        fc: fMid.toFixed(6),
        err: err.toFixed(6),
        converged: err < tol * 100,
      });

      if (Math.abs(fMid) < 1e-10 || err < tol * 100) {
        converged = true;
        break;
      }

      if (f(lo) * fMid < 0) {
        hi = mid;
      } else {
        lo = mid;
      }
    }

    // Métricas de equilibrio
    const Teq = mid;
    const TeqK = Teq + 273.15;
    const qConv = h * A * (Teq - Tamb);
    const qRad = eps * SIGMA * A * (Math.pow(TeqK, 4) - Math.pow(TambK, 4));
    const Rth = (Teq - Tamb) / Q;

    // ─── Simulación Transitoria (Euler explícito) ────────────────────────
    // T(t+dt) = T(t) + [Q - Qdisipado(T)] / (m·Cp) · dt
    const dt = 0.5; // paso de tiempo en segundos
    const maxTime = 300; // máximo 5 minutos de simulación
    const transient = [];
    let T = Tamb;
    let timeToLimit = null;
    let timeToOptMin = null;
    let timeToOptMax = null;

    for (let t = 0; t <= maxTime; t += dt) {
      const Tk = T + 273.15;
      const Qdis = h * A * (T - Tamb) + eps * SIGMA * A * (Math.pow(Tk, 4) - Math.pow(TambK, 4));
      const dT = (Q - Qdis) / (mass * Cp) * dt;

      // Registrar cada segundo entero (o cada 0.5s)
      if (t % 1 === 0 || Math.abs(dT) < 0.0001) {
        transient.push({
          t: parseFloat(t.toFixed(1)),
          T: parseFloat(T.toFixed(4)),
        });
      }

      // Detectar tiempos clave
      if (timeToOptMin === null && T >= Toptmin) timeToOptMin = t;
      if (timeToOptMax === null && T >= Toptmax) timeToOptMax = t;
      if (timeToLimit === null && T >= Tlimit) timeToLimit = t;

      T += dT;

      // Si la temperatura se estabilizó (cambio < 0.0001°C por paso)
      if (Math.abs(dT) < 0.0001) {
        // Agregar punto final si no se registró
        if (transient[transient.length - 1]?.t !== parseFloat(t.toFixed(1))) {
          transient.push({ t: parseFloat(t.toFixed(1)), T: parseFloat(T.toFixed(4)) });
        }
        break;
      }
    }

    const reachesLimit = Teq >= Tlimit;
    const isInOptimalRange = Teq >= Toptmin && Teq <= Toptmax;
    const margin = Tlimit - Teq; // Margen térmico (°C)

    setResult({
      root: mid,
      iterations,
      converged,
      totalIter: iterations.length,
      qConv,
      qRad,
      Rth,
      // Nuevos datos
      transient,
      timeToLimit,
      timeToOptMin,
      timeToOptMax,
      reachesLimit,
      isInOptimalRange,
      margin,
      Teq,
    });
  };

  useEffect(() => {
    calcularTemperatura();
  }, [params]);

  // ─── Puntos para el gráfico de balance f(T) ───────────────────────────
  const graphPoints = useMemo(() => {
    const { h, A, eps, Q, Tamb, a, b } = params;
    if (A <= 0 || Q <= 0) return [];

    const TambK = Tamb + 273.15;
    const lo = Math.max(parseFloat(a), Tamb + 1);
    const hi = parseFloat(b);
    const steps = 100;
    const points = [];

    for (let i = 0; i <= steps; i++) {
      const T = lo + (i / steps) * (hi - lo);
      const Tk = T + 273.15;
      const y = h * A * (T - Tamb) + eps * SIGMA * A * (Math.pow(Tk, 4) - Math.pow(TambK, 4)) - Q;
      if (isFinite(y)) {
        points.push({ x: parseFloat(T.toFixed(2)), y: parseFloat(y.toFixed(4)) });
      }
    }
    return points;
  }, [params]);

  return (
    <div className="sim-container">

      {/* ── Descripción del Método ─────────────────────────────────────────── */}
      <div className="sim-desc-box teal">
        <div className="sim-desc-header">
          <span className="sim-eyebrow">Modelo Matemático</span>
          <span className="sim-tag sim-tag-teal">
            Bisección + Euler
          </span>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.8, margin: "10px 0 6px" }}>
          Dado un procesador que genera <strong>Q</strong> watts de calor, un disipador
          con área <strong>A</strong> y coeficiente de convección <strong>h</strong>,
          se busca la temperatura de equilibrio <strong>T*</strong> donde la
          disipación total (convección + radiación) iguala la generación.
          Además, se simula la <strong>respuesta transitoria</strong> para determinar
          cuánto tiempo tarda en llegar al límite térmico.
        </p>
        <div className="sim-formula-box">
          f(T) = h·A·(T − T_amb) + ε·σ·A·(T⁴ − T⁴_amb) − Q = 0
        </div>
        <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.7, marginTop: 10 }}>
          <strong>Bisección:</strong> Encuentra T* de equilibrio. &nbsp;
          <strong>Euler:</strong> Simula T(t) = T + [Q − Q_dis] / (m·Cp) · Δt para calcular
          tiempos al límite y rango óptimo de operación.
        </p>
      </div>

      {/* ── Grid Principal ────────────────────────────────────────────────── */}
      <div className="sim-grid">

        {/* ── Panel de Configuración ── */}
        <div className="sim-panel">
          <div className="sim-panel-header">
            <span className="sim-eyebrow">Parámetros Térmicos</span>
            <span className="sim-tag sim-tag-teal">
              Disipador
            </span>
          </div>
          <div style={{ padding: 20 }}>

            <SectionLabel text="Procesador" />
            <Field
              label="Potencia térmica Q (W)"
              value={params.Q}
              onChange={v => setParams({ ...params, Q: v })}
              hint="TDP del procesador (65 – 250 W típico)"
              step={5}
            />
            <Field
              label="Temperatura ambiente T_amb (°C)"
              value={params.Tamb}
              onChange={v => setParams({ ...params, Tamb: v })}
              hint="Temperatura del entorno (20 – 35 °C)"
              step={1}
            />
            <Field
              label="Temperatura límite (°C)"
              value={params.Tlimit}
              onChange={v => setParams({ ...params, Tlimit: v })}
              hint="Throttling / daño térmico (85 – 100 °C)"
              step={5}
            />

            <div className="sim-divider" />
            <SectionLabel text="Disipador" />
            <Field
              label="Coeficiente de convección h (W/m²·K)"
              value={params.h}
              onChange={v => setParams({ ...params, h: v })}
              hint="Natural ≈ 5–25 · Forzada ≈ 25–250"
              step={5}
            />
            <Field
              label="Área del disipador A (m²)"
              value={params.A}
              onChange={v => setParams({ ...params, A: v })}
              hint="Área efectiva de aletas"
              step={0.001}
            />
            <Field
              label="Emisividad ε"
              value={params.eps}
              onChange={v => setParams({ ...params, eps: v })}
              hint="0 (reflectivo) a 1 (cuerpo negro)"
              step={0.05}
            />
            <Field
              label="Masa disipador (kg)"
              value={params.mass}
              onChange={v => setParams({ ...params, mass: v })}
              hint="Masa total del bloque + aletas"
              step={0.05}
            />
            <Field
              label="Calor específico Cp (J/kg·K)"
              value={params.Cp}
              onChange={v => setParams({ ...params, Cp: v })}
              hint="Aluminio ≈ 900 · Cobre ≈ 385"
              step={50}
            />

            <div className="sim-divider" />
            <SectionLabel text="Rango Óptimo de CPU (°C)" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Field
                label="Mínimo (°C)"
                value={params.Toptmin}
                onChange={v => setParams({ ...params, Toptmin: v })}
                hint="Temp. mínima óptima"
                step={5}
              />
              <Field
                label="Máximo (°C)"
                value={params.Toptmax}
                onChange={v => setParams({ ...params, Toptmax: v })}
                hint="Temp. máxima óptima"
                step={5}
              />
            </div>

            <div className="sim-divider" />
            <SectionLabel text="Intervalo de Búsqueda (°C)" />
            <Field
              label="Límite inferior a (°C)"
              value={params.a}
              onChange={v => setParams({ ...params, a: v })}
              hint="Debe cumplir f(a) < 0"
              step={5}
            />
            <Field
              label="Límite superior b (°C)"
              value={params.b}
              onChange={v => setParams({ ...params, b: v })}
              hint="Debe cumplir f(b) > 0"
              step={5}
            />

            {/* Advertencia si no hay cambio de signo */}
            {result && result.error && (
              <div className="sim-warn">
                ⚠ {result.error}
              </div>
            )}

          </div>
        </div>

        {/* ── Panel de Resultados ── */}
        <div className="sim-panel">
          <div className="sim-panel-header">
            <span className="sim-eyebrow">Resultado</span>
            {result && result.totalIter > 0 && (
              <span style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "1px" }}>
                {result.totalIter} iteración{result.totalIter !== 1 ? "es" : ""}
              </span>
            )}
          </div>
          <div style={{ padding: 20 }}>
            {!result || result.error ? (
              <div className="sim-placeholder">
                <p className="sim-placeholder-text">
                  {result?.error || "Ajustá los parámetros para calcular"}
                </p>
              </div>
            ) : (
              <>
                {/* Status principal */}
                <div className="sim-status" style={{
                  background: result.converged ? "rgba(108,189,181,0.1)" : "rgba(220,180,100,0.1)",
                  border: `1px solid ${result.converged ? "rgba(108,189,181,0.3)" : "rgba(220,180,100,0.3)"}`,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: result.converged ? "var(--teal)" : "#d4a84b", flexShrink: 0 }} />
                  <span style={{ color: result.converged ? "var(--teal)" : "#d4a84b", fontSize: 10, letterSpacing: "1px", textTransform: "uppercase" }}>
                    {result.converged
                      ? `Equilibrio térmico · T* ≈ ${result.root.toFixed(2)} °C`
                      : `Sin convergencia tras ${result.totalIter} iteraciones`}
                  </span>
                </div>

                {/* Status de límite térmico */}
                <div className="sim-status" style={{
                  background: result.reachesLimit ? "rgba(200,80,80,0.1)" : "rgba(108,189,181,0.08)",
                  border: `1px solid ${result.reachesLimit ? "rgba(200,80,80,0.3)" : "rgba(108,189,181,0.25)"}`,
                  marginTop: 8,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: result.reachesLimit ? "#c85050" : "var(--teal)", flexShrink: 0 }} />
                  <span style={{ color: result.reachesLimit ? "#c85050" : "var(--teal)", fontSize: 10, letterSpacing: "1px", textTransform: "uppercase" }}>
                    {result.reachesLimit
                      ? `⚠ Alcanza el límite (${params.Tlimit}°C) — Margen: ${result.margin.toFixed(1)}°C`
                      : `✓ Seguro — No llega al límite (${params.Tlimit}°C) · Margen: +${result.margin.toFixed(1)}°C`}
                  </span>
                </div>

                {/* Métricas rápidas */}
                <div className="sim-metrics-row" style={{ marginTop: 12 }}>
                  <Metric label="Temperatura T*" value={`${result.root.toFixed(2)} °C`} highlight />
                  <Metric label="Margen Térmico" value={`${result.margin > 0 ? "+" : ""}${result.margin.toFixed(1)} °C`} />
                  <Metric label="Calor Convección" value={`${result.qConv.toFixed(2)} W`} />
                  <Metric label="Calor Radiación" value={`${result.qRad.toFixed(2)} W`} />
                  <Metric label="Rₜₕ Efectiva" value={`${result.Rth.toFixed(3)} K/W`} />
                  <Metric label="Rango Óptimo" value={result.isInOptimalRange ? "✓ Dentro" : "✗ Fuera"} />
                </div>

                {/* ── Tiempos clave ── */}
                <div style={{ marginTop: 16 }}>
                  <span className="sim-eyebrow">Tiempos de Transición</span>
                  <div className="sim-metrics-row" style={{ marginTop: 8 }}>
                    <Metric
                      label={`Alcanza ${params.Toptmin}°C (óptimo mín)`}
                      value={result.timeToOptMin !== null ? `${result.timeToOptMin.toFixed(1)} s` : "—"}
                    />
                    <Metric
                      label={`Alcanza ${params.Toptmax}°C (óptimo máx)`}
                      value={result.timeToOptMax !== null ? `${result.timeToOptMax.toFixed(1)} s` : "No alcanza"}
                    />
                    <Metric
                      label={`Alcanza ${params.Tlimit}°C (LÍMITE)`}
                      value={result.timeToLimit !== null ? `${result.timeToLimit.toFixed(1)} s` : "No alcanza ✓"}
                    />
                  </div>
                </div>

                {/* ── Gráfico Transitorio T(t) ── */}
                <div className="sim-graph" style={{ marginTop: 20 }}>
                  <div className="sim-graph-title">
                    T(t) — Respuesta Transitoria · Temperatura vs Tiempo
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={result.transient} margin={{ top: 8, right: 20, left: -5, bottom: 4 }}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                      <XAxis
                        dataKey="t"
                        tick={{ fontSize: 9, fill: "var(--muted)", fontFamily: "'DM Mono', monospace" }}
                        label={{ value: "Tiempo (s)", position: "insideBottomRight", offset: -5, fontSize: 9, fill: "var(--muted)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 9, fill: "var(--muted)", fontFamily: "'DM Mono', monospace" }}
                        label={{ value: "T (°C)", angle: -90, position: "insideLeft", offset: 15, fontSize: 9, fill: "var(--muted)" }}
                        domain={[params.Tamb - 2, 'auto']}
                      />
                      <Tooltip
                        contentStyle={{ fontSize: 10, borderRadius: 8, fontFamily: "'DM Mono', monospace", border: "1px solid var(--border)", background: "var(--surface)" }}
                        labelFormatter={(v) => `t = ${v} s`}
                        formatter={(v) => [`T = ${v} °C`, ""]}
                      />
                      {/* Zona óptima (franja verde) */}
                      <ReferenceArea
                        y1={params.Toptmin}
                        y2={params.Toptmax}
                        fill="rgba(108, 189, 181, 0.08)"
                        stroke="none"
                      />
                      {/* Línea del mínimo óptimo (azul) */}
                      <ReferenceLine
                        y={params.Toptmin}
                        stroke="#4a90d9"
                        strokeDasharray="5 3"
                        strokeWidth={1.5}
                        label={{ value: `Óptimo mín ${params.Toptmin}°C`, position: "insideBottomRight", fontSize: 8, fill: "#4a90d9" }}
                      />
                      {/* Línea del máximo óptimo (naranja) */}
                      <ReferenceLine
                        y={params.Toptmax}
                        stroke="#e89030"
                        strokeDasharray="5 3"
                        strokeWidth={1.5}
                        label={{ value: `Óptimo máx ${params.Toptmax}°C`, position: "insideTopRight", fontSize: 8, fill: "#e89030" }}
                      />
                      {/* Línea del límite térmico (rojo) */}
                      <ReferenceLine
                        y={params.Tlimit}
                        stroke="#c85050"
                        strokeDasharray="3 3"
                        strokeWidth={2}
                        label={{ value: `LÍMITE ${params.Tlimit}°C`, position: "insideTopRight", fontSize: 9, fill: "#c85050", fontWeight: 600 }}
                      />
                      {/* Línea de equilibrio T* */}
                      <ReferenceLine
                        y={result.Teq}
                        stroke="#6CBDB5"
                        strokeDasharray="6 3"
                        strokeWidth={1.5}
                        label={{ value: `T*=${result.Teq.toFixed(1)}°C`, position: "insideTopLeft", fontSize: 8, fill: "#6CBDB5" }}
                      />
                      {/* Punto T* de equilibrio (verde) */}
                      {result.transient.length > 0 && (
                        <ReferenceDot
                          x={result.transient[result.transient.length - 1].t}
                          y={result.Teq}
                          r={5}
                          fill="#6CBDB5"
                          stroke="white"
                          strokeWidth={2}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="T"
                        stroke="#6CBDB5"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* ── Gráfico de Balance f(T) ── */}
                <div className="sim-graph" style={{ marginTop: 16 }}>
                  <div className="sim-graph-title">
                    f(T) = Disipación total − Q · Balance térmico
                  </div>
                  <ResponsiveContainer width="100%" height={175}>
                    <LineChart data={graphPoints} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                      <XAxis dataKey="x" tick={{ fontSize: 9, fill: "var(--muted)", fontFamily: "'DM Mono', monospace" }} label={{ value: "T (°C)", position: "insideBottomRight", offset: -5, fontSize: 9, fill: "var(--muted)" }} />
                      <YAxis tick={{ fontSize: 9, fill: "var(--muted)", fontFamily: "'DM Mono', monospace" }} />
                      <Tooltip
                        contentStyle={{ fontSize: 10, borderRadius: 8, fontFamily: "'DM Mono', monospace", border: "1px solid var(--border)", background: "var(--surface)" }}
                        labelFormatter={(v) => `T = ${v} °C`}
                        formatter={(v) => [`f(T) = ${v} W`, ""]}
                      />
                      {/* Zona óptima (franja verde en eje X) */}
                      <ReferenceArea
                        x1={params.Toptmin}
                        x2={params.Toptmax}
                        fill="rgba(108, 189, 181, 0.08)"
                        stroke="none"
                      />
                      <ReferenceLine y={0} stroke="var(--muted)" strokeWidth={1} />
                      {/* Mínimo óptimo (azul) */}
                      <ReferenceLine
                        x={params.Toptmin}
                        stroke="#4a90d9"
                        strokeDasharray="4 3"
                        strokeWidth={1}
                        label={{ value: `${params.Toptmin}°C`, position: "top", fontSize: 8, fill: "#4a90d9" }}
                      />
                      {/* Máximo óptimo (naranja) */}
                      <ReferenceLine
                        x={params.Toptmax}
                        stroke="#e89030"
                        strokeDasharray="4 3"
                        strokeWidth={1}
                        label={{ value: `${params.Toptmax}°C`, position: "top", fontSize: 8, fill: "#e89030" }}
                      />
                      {/* Límite térmico (rojo) */}
                      <ReferenceLine
                        x={params.Tlimit}
                        stroke="#c85050"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                        label={{ value: `LÍM ${params.Tlimit}°C`, position: "top", fontSize: 8, fill: "#c85050", fontWeight: 600 }}
                      />
                      {/* T* equilibrio (verde) */}
                      {result.converged && (
                        <ReferenceLine
                          x={parseFloat(result.root.toFixed(2))}
                          stroke="#6CBDB5"
                          strokeDasharray="5 3"
                          strokeWidth={1.5}
                          label={{ value: `T*=${result.root.toFixed(1)}°C`, position: "top", fontSize: 9, fill: "#6CBDB5" }}
                        />
                      )}
                      <Line type="monotone" dataKey="y" stroke="#6CBDB5" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* ── Tabla de últimos registros transitorios ── */}
                <div style={{ marginTop: 20 }}>
                  <span className="sim-eyebrow">Últimos Registros de Temperatura (transitorio)</span>
                  <div className="sim-table-wrap" style={{ marginTop: 8 }}>
                    <table className="sim-table">
                      <thead>
                        <tr>
                          <th>t (s)</th>
                          <th>T (°C)</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.transient.slice(-10).map((row, i) => {
                          let estado = "";
                          let color = "var(--text)";
                          if (row.T >= params.Tlimit) { estado = "⛔ LÍMITE"; color = "#c85050"; }
                          else if (row.T >= params.Toptmax) { estado = "⚠ Cerca del máx"; color = "#e89030"; }
                          else if (row.T >= params.Toptmin) { estado = "✓ Óptimo"; color = "var(--teal)"; }
                          else { estado = "↗ Calentando"; color = "#4a90d9"; }
                          return (
                            <tr key={i}>
                              <td>{row.t}</td>
                              <td>{row.T}</td>
                              <td style={{ color, fontWeight: 500, fontSize: 10 }}>{estado}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── Tabla de Iteraciones (Bisección) ── */}
                <div style={{ marginTop: 20 }}>
                  <span className="sim-eyebrow">Tabla de Iteraciones (Bisección) — Todas</span>
                  <div className="sim-table-wrap" style={{ marginTop: 8 }}>
                    <table className="sim-table">
                      <thead>
                        <tr>
                          {["n", "a", "b", "c (T)", "f(c)", "Error %"].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.iterations.map((row, i) => (
                          <tr key={i} style={{ background: row.converged ? "rgba(108,189,181,0.07)" : "transparent" }}>
                            <td>{row.n}</td>
                            <td>{row.a}</td>
                            <td>{row.b}</td>
                            <td>{row.c}</td>
                            <td>{row.fc}</td>
                            <td style={{ color: row.converged ? "var(--teal)" : "var(--text)", fontWeight: row.converged ? 500 : 400 }}>
                              {row.err === "0.000000" ? "—" : `${row.err}%`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Insight */}
                <div className="sim-ai-box" style={{ marginTop: 20 }}>
                  <div className="sim-ai-label">
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--teal)", display: "inline-block", marginRight: 6 }} />
                    Interpretación Térmica
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--muted)", lineHeight: 1.8 }}>
                    Un procesador de <strong>{params.Q} W</strong> con un disipador de
                    área <strong>{params.A} m²</strong> (h = <strong>{params.h} W/m²·K</strong>,
                    ε = <strong>{params.eps}</strong>, masa = <strong>{params.mass} kg</strong>) alcanza
                    el equilibrio térmico
                    en <strong style={{ color: "var(--teal)" }}>T* = {result.root.toFixed(2)} °C</strong> sobre
                    una ambiente de <strong>{params.Tamb} °C</strong>.
                    {" "}
                    {result.reachesLimit ? (
                      <span style={{ color: "#c85050" }}>
                        <strong>⚠ ALERTA:</strong> La temperatura de equilibrio supera el límite
                        de <strong>{params.Tlimit}°C</strong>
                        {result.timeToLimit !== null && <> — se alcanza en <strong>{result.timeToLimit.toFixed(1)} segundos</strong></>}.
                        Es necesario mejorar la refrigeración.
                      </span>
                    ) : (
                      <span style={{ color: "var(--teal)" }}>
                        <strong>✓ Seguro:</strong> La temperatura se estabiliza sin llegar a los {params.Tlimit}°C.
                        Margen de seguridad: <strong>+{result.margin.toFixed(1)}°C</strong>.
                      </span>
                    )}
                    {" "}
                    {result.isInOptimalRange ? (
                      <span>El CPU opera dentro del rango óptimo ({params.Toptmin}–{params.Toptmax}°C).</span>
                    ) : result.Teq < params.Toptmin ? (
                      <span>El CPU opera por debajo del rango óptimo (bajo rendimiento térmico).</span>
                    ) : (
                      <span>El CPU opera por encima del rango óptimo — considerar mejor disipación.</span>
                    )}
                    {" "}De la potencia total, <strong>{result.qConv.toFixed(1)} W</strong> se disipan
                    por convección y <strong>{result.qRad.toFixed(1)} W</strong> por radiación.
                    La resistencia térmica efectiva es <strong>{result.Rth.toFixed(3)} K/W</strong>.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────
function SectionLabel({ text }) {
  return (
    <div className="sim-section-label">
      {text}
    </div>
  );
}

function Metric({ label, value, highlight }) {
  return (
    <div className={`sim-metric ${highlight ? 'highlight' : ''}`}>
      <div className="sim-metric-label">{label}</div>
      <div className="sim-metric-val">{value}</div>
    </div>
  );
}

function Field({ label, value, onChange, hint, step = 1 }) {
  return (
    <div className="sim-field">
      <label className="sim-field-label">
        {label}
      </label>
      <input
        type="number"
        step={step}
        className="sim-field-input"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      {hint && <div className="sim-field-hint">{hint}</div>}
    </div>
  );
}
