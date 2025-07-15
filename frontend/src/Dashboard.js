// src/Dashboard.js

import React, { useState, useEffect } from "react";
import { createWebSocket } from "./wsClient";

export default function Dashboard() {
  const [events, setEvents] = useState([]);     // holds start/finish events
  const [metrics, setMetrics] = useState(null); // holds the final metrics object

  useEffect(() => {
    // Open WS on mount
    const ws = createWebSocket((data) => {
      if (data.event === "metrics") {
        setMetrics(data);
      } else {
        setEvents((prev) => [...prev, data]);
      }
    });

    // Clean up on unmount
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Live Scheduler Dashboard</h1>

      <section style={{ marginBottom: 20 }}>
        <h2>Events</h2>
        <ul>
          {events.map((ev, i) => (
            <li key={i}>
              [{ev.time}] PID {ev.pid} <strong>{ev.event}</strong>
            </li>
          ))}
        </ul>
      </section>

      {metrics && (
        <section>
          <h2>Metrics</h2>
          <p><strong>Algorithm:</strong> {metrics.algorithm}</p>
          <p><strong>Avg Turnaround:</strong> {metrics.average_turnaround_time.toFixed(2)}</p>
          <p><strong>Avg Waiting:</strong> {metrics.average_waiting_time.toFixed(2)}</p>
          <p><strong>Process Count:</strong> {metrics.process_count}</p>
        </section>
      )}
    </div>
  );
}
