// frontend/src/components/GanttChart.js
import React from "react";

export default function GanttChart({ details = [], heightPerRow = 40 }) {
  if (!details || !details.length) {
    return <div style={{ padding: 8, color: "#666" }}>Waiting for simulation...</div>;
  }

  // 1. Identify Unique PIDs to assign static rows
  const uniquePids = Array.from(new Set(details.map(d => d.pid))).sort((a,b) => a-b);
  const pidToRowIndex = {};
  uniquePids.forEach((pid, index) => {
    pidToRowIndex[pid] = index;
  });

  // 2. Calculate Chart Dimensions
  const maxTime = Math.max(...details.map((r) => r.finish));
  const totalDuration = Math.max(1, maxTime);
  
  const width = 800;
  const chartHeight = uniquePids.length * heightPerRow + 50;
  const leftMargin = 60;
  const chartWidth = width - leftMargin - 20;

  const timeToX = (t) => (t / totalDuration) * chartWidth + leftMargin;

  // Colors for different PIDs
  const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <svg width={width} height={chartHeight} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", background: "#ffffff" }}>
      
      {/* Y-Axis Labels (PID names) */}
      {uniquePids.map((pid, i) => (
        <text 
          key={pid} 
          x={10} 
          y={i * heightPerRow + 30 + heightPerRow/2} 
          fontSize={14} 
          fontWeight="bold" 
          fill="#374151"
        >
          PID {pid}
        </text>
      ))}

      {/* Grid Lines (Vertical) */}
      {Array.from({ length: 11 }).map((_, i) => {
        const t = (i / 10) * totalDuration;
        const x = timeToX(t);
        return (
          <g key={i}>
            <line x1={x} y1={30} x2={x} y2={chartHeight - 20} stroke="#e5e7eb" strokeDasharray="4" />
            <text x={x} y={chartHeight - 5} fontSize={10} textAnchor="middle" fill="#9ca3af">{Math.round(t)}</text>
          </g>
        );
      })}

      {/* The Bars (Time Slices) */}
      {details.map((r, i) => {
        const rowIndex = pidToRowIndex[r.pid];
        const y = rowIndex * heightPerRow + 40;
        const x1 = timeToX(r.start);
        const x2 = timeToX(r.finish);
        const w = Math.max(1, x2 - x1);
        
        return (
          <g key={i}>
            <rect 
              x={x1} y={y} width={w} height={heightPerRow - 16} 
              rx={4} ry={4} 
              fill={colors[r.pid % colors.length]} 
              opacity={0.9}
            />
            {w > 20 && (
              <text x={x1 + w/2} y={y + 14} fontSize={10} fill="white" textAnchor="middle" pointerEvents="none">
                {r.finish - r.start}ms
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}