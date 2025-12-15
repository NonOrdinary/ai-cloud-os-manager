// frontend/src/Dashboard.js
import React, { useEffect, useRef, useState, useMemo } from "react";
import { createWebSocket } from "./wsClient";
import JobForm from "./components/JobForm";
import GanttChart from "./components/GanttChart";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const wsRef = useRef(null);

  // --- LOGIC: Compute Gantt Slices from Events ---
  const ganttData = useMemo(() => {
    const slices = [];
    const tempStarts = {}; 

    events.forEach((ev) => {
      if (ev.event === "start") {
        tempStarts[ev.pid] = ev.time;
      } else if (ev.event === "finish") {
        const start = tempStarts[ev.pid];
        if (start !== undefined) {
          slices.push({ 
            pid: ev.pid, 
            start: start, 
            finish: ev.time 
          });
          delete tempStarts[ev.pid];
        }
      }
    });
    return slices;
  }, [events]);

  // --- LOGIC: WebSocket Setup ---
  useEffect(() => {
    const ws = createWebSocket((data) => {
      if (data.event === "metrics") {
        setMetrics(data);
      } else {
        setEvents((prev) => [...prev, data]);
      }
    });

    wsRef.current = ws;
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  function handleSimulate(jobs, algo = "fcfs", quantum = 2) {
    setEvents([]); 
    setMetrics(null);

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      const temp = new WebSocket("ws://127.0.0.1:8000/ws");
      temp.onopen = () => {
        temp.send(JSON.stringify({ jobs, algo, quantum }));
      };
      temp.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        if (data.event === "metrics") setMetrics(data);
        else setEvents((prev) => [...prev, data]);
      };
      wsRef.current = temp;
      return;
    }
    ws.send(JSON.stringify({ jobs, algo, quantum }));
  }

  // --- VIEW: Vertical Stack Layout (Safer) ---
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>AI-OS Process Manager</h1>

      {/* TOP SECTION: FORM */}
      <div style={{ marginBottom: "30px" }}>
        <JobForm onSimulate={handleSimulate} apiBase="http://127.0.0.1:8000" />
      </div>

      {/* MIDDLE SECTION: CHART (Scrollable if too wide) */}
      <div style={{ marginBottom: "30px" }}>
        <h3>Gantt Chart (Live)</h3>
        <div style={{ overflowX: "auto", border: "1px solid #ccc", padding: "10px", background: "#f9f9f9" }}>
           <GanttChart details={ganttData} />
        </div>
      </div>

      {/* BOTTOM SECTION: LOGS & METRICS */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        
        {/* Left: Events Log */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h4>Execution Log</h4>
          <ul style={{ 
              height: "200px", overflowY: "auto", 
              background: "#1e1e1e", color: "#00ff00", 
              padding: "10px", borderRadius: "4px", listStyle: "none", fontFamily: "monospace", margin: 0 
            }}>
              {events.length === 0 && <li style={{color: "#555"}}>Waiting for simulation...</li>}
              {events.map((ev, idx) => (
                <li key={idx}>
                  <span style={{color: "#888"}}>[{ev.time.toString().padStart(3, '0')}]</span> 
                  {" "}PID {ev.pid} : 
                  <strong style={{ color: ev.event === "start" ? "#4fc3f7" : "#ff8a65" }}> {ev.event.toUpperCase()}</strong>
                </li>
              ))}
              <div ref={(el) => el?.scrollIntoView({ behavior: "smooth" })} />
            </ul>
        </div>

        {/* Right: Metrics Scorecard */}
        <div style={{ flex: 1, minWidth: "200px" }}>
           <h4>Metrics Report</h4>
           {metrics ? (
            <div style={{ padding: "15px", border: "1px solid #4caf50", background: "#e8f5e9", borderRadius: "4px" }}>
              <p style={{margin: "5px 0"}}><strong>Algorithm:</strong> {metrics.algorithm.toUpperCase()}</p>
              <p style={{margin: "5px 0"}}><strong>Avg Turnaround:</strong> {Number(metrics.average_turnaround_time).toFixed(2)}ms</p>
              <p style={{margin: "5px 0"}}><strong>Avg Waiting:</strong> {Number(metrics.average_waiting_time).toFixed(2)}ms</p>
              <p style={{margin: "5px 0"}}><strong>Total Jobs:</strong> {metrics.process_count}</p>
            </div>
          ) : (
            <div style={{ padding: "15px", border: "1px dashed #ccc", background: "#fafafa", borderRadius: "4px", color: "#666" }}>
              Simulation in progress or waiting to start...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}