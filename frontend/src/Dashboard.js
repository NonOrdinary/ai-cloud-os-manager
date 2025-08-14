
import React, { useEffect, useRef, useState } from "react";
import { createWebSocket } from "./wsClient";
import JobForm from "./components/jobform";
import GanttChart from "./components/GanttChart"; // if you have this component


/**
 * Dashboard:
 *  - maintains ws connection
 *  - collects events (start/finish)
 *  - holds latest metrics and details for Gantt
 */
export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    // createWebSocket takes a callback for incoming messages
    const ws = createWebSocket((data) => {
      if (data.event === "metrics") {
        // metrics likely contains details array
        setMetrics(data);
      } else {
        // start/finish events
        setEvents((prev) => [...prev, data]);
      }
    });

    wsRef.current = ws;
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // simulateHandler is passed to JobForm: sends jobs/algo/quantum over WS
  function handleSimulate(jobs, algo = "fcfs", quantum = 2) {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      // Try to open a fresh WS and send after open
      const temp = new WebSocket("ws://127.0.0.1:8000/ws");
      temp.onopen = () => {
        temp.send(JSON.stringify({ jobs, algo, quantum }));
      };
      temp.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        if (data.event === "metrics") setMetrics(data);
        else setEvents((prev) => [...prev, data]);
      };
      temp.onerror = (err) => console.error(err);
      wsRef.current = temp;
      return;
    }

    ws.send(JSON.stringify({ jobs, algo, quantum }));
  }

  return (
    <div style={{ padding: 14 }}>
      <h1>AI-OS Process Manager — Dashboard</h1>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <JobForm onSimulate={handleSimulate} apiBase="" />
          <section style={{ marginTop: 10 }}>
            <h3>Events (live)</h3>
            <ul style={{ maxHeight: 220, overflow: "auto", background: "#fff", padding: 8, border: "1px solid #eee" }}>
              {events.map((ev, idx) => (
                <li key={idx}>
                  [{ev.time}] PID {ev.pid} — <strong>{ev.event}</strong>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Gantt / Metrics</h3>
          <div style={{ marginBottom: 12 }}>
            <GanttChart details={metrics?.details || []} />
          </div>

          {metrics ? (
            <div style={{ padding: 8, border: "1px solid #eee", background: "#fff" }}>
              <p><strong>Algorithm:</strong> {metrics.algorithm}</p>
              <p><strong>Avg Turnaround:</strong> {Number(metrics.average_turnaround_time).toFixed(2)}</p>
              <p><strong>Avg Waiting:</strong> {Number(metrics.average_waiting_time).toFixed(2)}</p>
              <p><strong>Process Count:</strong> {metrics.process_count}</p>
            </div>
          ) : (
            <div style={{ padding: 8 }}>No metrics yet — run a simulation.</div>
          )}
        </div>
      </div>
    </div>
  );
}
