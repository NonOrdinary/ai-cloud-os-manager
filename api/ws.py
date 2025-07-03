# api/ws.py

import asyncio
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

# Import the core Simulator
from scheduler.simulator import Simulator

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_json(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Expects initial JSON payload:
      {
        "jobs": [ { "pid":1, "arrival_time":0, "burst_time":5 }, … ],
        "algo": "rr",              # or "fcfs"
        "quantum": 2               # only for RR
      }

    Then streams:
      - { "event": "start",  "pid": X, "time": t }
      - { "event": "finish", "pid": X, "time": t }
      - { "event": "metrics", ... }
    """
    await manager.connect(websocket)
    try:
        data = await websocket.receive_json()
        jobs_data = data.get("jobs", [])
        algo      = data.get("algo", "fcfs")
        quantum   = data.get("quantum", 2)

        # Initialize Simulator
        sim = Simulator(algorithm=algo, quantum=quantum)
        for job in jobs_data:
            sim.submit(
                pid=job["pid"],
                arrival_time=job["arrival_time"],
                burst_time=job["burst_time"]
            )

        # Emit start/finish for each job
        current_time = 0
        for proc in sim.jobs:
            await manager.send_json(
                {"event": "start", "pid": proc.pid, "time": current_time},
                websocket
            )
            # Optional artificial delay for demo
            await asyncio.sleep(0.5)
            current_time += proc.burst_time
            await manager.send_json(
                {"event": "finish", "pid": proc.pid, "time": current_time},
                websocket
            )

        # Finally run full simulation to collect metrics
        sim.run()
        metrics = sim.get_metrics()
        await manager.send_json({"event": "metrics", **metrics}, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
