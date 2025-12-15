// frontend/src/components/JobForm.js
import React, { useState } from "react";

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
      setStatus("Error: Please fill in PID, Arrival, and Burst time.");
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

  function submitToApi() {
    // ... (Keep existing submit logic logic if you have it, or I can reprint) ...
    // For brevity, assuming logic is same as before. 
    setStatus("Submitted to API (Simulated)"); 
  }

  function handleSimulate() {
    if (!jobs.length) {
      setStatus("Error: Add at least one job first.");
      return;
    }
    setStatus("Starting Simulation...");
    onSimulate(jobs, algo, Number(quantum));
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", background: "white", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
      <h3 style={{ marginTop: 0 }}>1. Configure Jobs</h3>

      {/* Input Row */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "15px" }}>
        <div>
            <label style={{display:"block", fontSize:"12px", marginBottom:"4px"}}>PID</label>
            <input style={{padding: "6px", width: "60px"}} placeholder="1" value={pid} onChange={(e) => setPid(e.target.value)} type="number" />
        </div>
        <div>
            <label style={{display:"block", fontSize:"12px", marginBottom:"4px"}}>Arrival</label>
            <input style={{padding: "6px", width: "60px"}} placeholder="0" value={arrival} onChange={(e) => setArrival(e.target.value)} type="number" />
        </div>
        <div>
            <label style={{display:"block", fontSize:"12px", marginBottom:"4px"}}>Burst</label>
            <input style={{padding: "6px", width: "60px"}} placeholder="10" value={burst} onChange={(e) => setBurst(e.target.value)} type="number" />
        </div>
        <button 
            onClick={addJobLocal}
            style={{ padding: "8px 16px", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", height: "35px" }}
        >
            + Add Job
        </button>
      </div>

      {/* List of Added Jobs */}
      <div style={{ background: "#f8fafc", padding: "10px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
        <strong>Job Queue: </strong>
        {jobs.length === 0 ? <span style={{color:"#999"}}>Empty</span> : 
            jobs.map((j, i) => (
                <span key={i} style={{ display:"inline-block", background:"#fff", border:"1px solid #ccc", padding:"2px 6px", margin:"0 4px", borderRadius:"12px", fontSize:"12px" }}>
                    P{j.pid} (A:{j.arrival_time}, B:{j.burst_time})
                </span>
            ))
        }
      </div>

      {/* Control Row */}
      <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap", borderTop: "1px solid #eee", paddingTop: "15px" }}>
        <div>
            <label style={{marginRight: "5px"}}>Algorithm:</label>
            <select value={algo} onChange={(e) => setAlgo(e.target.value)} style={{padding: "5px"}}>
                <option value="fcfs">FCFS</option>
                <option value="rr">Round Robin</option>
            </select>
        </div>

        {algo === "rr" && (
            <div>
                <label style={{marginRight: "5px"}}>Quantum:</label>
                <input type="number" value={quantum} onChange={(e) => setQuantum(e.target.value)} style={{width: "50px", padding: "5px"}} />
            </div>
        )}

        <div style={{ marginLeft: "auto", display:"flex", gap:"10px" }}>
            <button onClick={() => setJobs([])} style={{ padding: "8px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Clear
            </button>
            <button onClick={handleSimulate} style={{ padding: "8px 16px", background: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                ▶ Run Simulation
            </button>
        </div>
      </div>
      
      {status && <div style={{ marginTop: "10px", fontSize: "14px", color: status.includes("Error") ? "red" : "blue" }}>{status}</div>}
    </div>
  );
}