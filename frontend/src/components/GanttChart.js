// frontend/src/components/GanttChart.js
import React from "react";

/**
 * props:
 *  - details: array of { pid, arrival, burst, start, finish, ... }
 *  - heightPerRow: optional
 */
export default function GanttChart({ details = [], heightPerRow = 24 }) {
  if (!details || !details.length) {
    return <div style={{ padding: 8 }}>No Gantt data yet.</div>;
  }

  // Normalize: sort by start time
  const rows = details.slice().sort((a, b) => a.start - b.start || a.pid - b.pid);

  const minT = Math.min(...rows.map((r) => r.start));
  const maxT = Math.max(...rows.map((r) => r.finish));
  const total = Math.max(1, maxT - minT);

  const width = 700; // px
  const height = rows.length * heightPerRow + 40;

  const timeToX = (t) => ((t - minT) / total) * (width - 100) + 80; // left margin

  return (
    <svg width={width} height={height} style={{ border: "1px solid #eee", background: "#fafafa" }}>
      {/* time axis */}
      <g>
        <text x={10} y={14} fontSize={12}>Gantt Chart</text>
      </g>

      {/* rows */}
      {rows.map((r, i) => {
        const y = i * heightPerRow + 30;
        const x1 = timeToX(r.start);
        const x2 = timeToX(r.finish);
        const w = Math.max(2, x2 - x1);
        return (
          <g key={r.pid}>
            <text x={10} y={y + heightPerRow / 2 + 4} fontSize={12}>PID {r.pid}</text>
            <rect x={x1} y={y} width={w} height={heightPerRow - 6} rx={3} ry={3} fill="#4f46e5" opacity={0.9}/>
            <text x={x1 + 6} y={y + heightPerRow / 2 + 4} fontSize={11} fill="#fff">
              {r.start} → {r.finish}
            </text>
          </g>
        );
      })}

      {/* time ticks at bottom */}
      <g>
        {Array.from({ length: 6 }).map((_, i) => {
          const t = minT + (i / 5) * total;
          const x = timeToX(t);
          return (
            <g key={i}>
              <line x1={x} y1={height - 20} x2={x} y2={height - 16} stroke="#999" />
              <text x={x - 10} y={height - 4} fontSize={11}>{Math.round(t)}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
