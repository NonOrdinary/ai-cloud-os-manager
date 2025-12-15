// frontend/src/components/JobForm.js
import React, { useState } from "react";

/**
 * Props:
 *  - onSimulate(jobs, algo, quantum): called to start WS simulation
 *  - apiBase (optional): base url for REST calls, default "http://127.0.0.1:8000"
 */
export default function JobForm({ onSimulate, apiBase = "http://127.0.0.1:8000" }) {
  const [pid, setPid] = useState("");
  const [arrival, setArrival] = useState("");
  const [burst, setBurst] = useState("");
  const [jobs, setJobs] = useState([]);
  const [algo, setAlgo] = useState("fcfs");
  const [quantum, setQuantum] = useState(2);
  const [status, setStatus] = useState(null);

  function addJobLocal() {
    if (!pid || arrival === "" || burst === "") {
      setStatus("Fill pid, arrival_time and burst_time");
      return;
    }
    const newJob = {
      pid: Number(pid),
      arrival_time: Number(arrival),
      burst_time: Number(burst),
    };
    setJobs((s) => [...s, newJob]);
    setPid("");
    setArrival("");
    setBurst("");
    setStatus(null);
  }

  async function submitToApi() {
    if (!jobs.length) {
      setStatus("No local jobs to submit");
      return;
    }

    let anyFailed = false;
    let errorMessages = [];

    for (const j of jobs) {
      try {
        const res = await fetch(`${apiBase.replace(/\/$/, "")}/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(j),
        });

        if (!res.ok) {
          // backend returned non-2xx (404, 500, etc.)
          const text = await res.text().catch(() => "");
          anyFailed = true;
          errorMessages.push(`PID ${j.pid}: ${res.status} ${text}`);
        }
      } catch (err) {
        // network error / connection refused
        anyFailed = true;
        errorMessages.push(`PID ${j.pid}: ${err.message}`);
      }
    }

    if (anyFailed) {
      setStatus("Some submissions failed. Jobs still stored locally. Errors: " + errorMessages.join(" | "));
      // keep local jobs so you can still simulate locally/over WS
    } else {
      setStatus("All jobs submitted to API successfully");
      // optional: clear local jobs after successful submit
      // setJobs([]);
    }
  }

  function clearLocal() {
    setJobs([]);
    setStatus(null);
  }

  function handleSimulate() {
    if (!jobs.length) {
      setStatus("No local jobs to simulate");
      return;
    }
    setStatus("Simulating via WebSocket...");
    onSimulate(jobs, algo, Number(quantum));
  }

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
      <h3>Job Form</h3>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input placeholder="pid" value={pid} onChange={(e) => setPid(e.target.value)} />
        <input placeholder="arrival_time" value={arrival} onChange={(e) => setArrival(e.target.value)} />
        <input placeholder="burst_time" value={burst} onChange={(e) => setBurst(e.target.value)} />
        <button onClick={addJobLocal}>Add</button>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>
          Algo:
          <select value={algo} onChange={(e) => setAlgo(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="fcfs">FCFS</option>
            <option value="rr">Round Robin</option>
          </select>
        </label>

        {algo === "rr" && (
          <label style={{ marginLeft: 12 }}>
            Quantum:
            <input type="number" value={quantum} onChange={(e) => setQuantum(e.target.value)} style={{ width: 64, marginLeft: 8 }} />
          </label>
        )}
      </div>

      <div style={{ marginBottom: 8 }}>
        <button onClick={handleSimulate} style={{ marginRight: 8 }}>
          Simulate (WebSocket)
        </button>
        <button onClick={submitToApi} style={{ marginRight: 8 }}>
          Submit to API (/jobs)
        </button>
        <button onClick={clearLocal}>Clear</button>
      </div>

      <div>
        <strong>Local jobs:</strong>
        <ul>
          {jobs.map((j, idx) => (
            <li key={idx}>
              PID {j.pid}, arrival: {j.arrival_time}, burst: {j.burst_time}
            </li>
          ))}
        </ul>
      </div>

      {status && <div style={{ marginTop: 8, color: "#333" }}>{status}</div>}
    </div>
  );
}
