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
        # required to disconnect the websocket connection to closed client
        self.active_connections.remove(websocket)

    async def send_json(self, message: dict, websocket: WebSocket):
        # this actually does the work to take the dict and send it as JSON using FastAPI internal mechanism
        await websocket.send_json(message)

    async def broadcast(self, message: dict):
        # as name suggest , broadcast message to all, but no use here
        # but i think it good to have in my project
        for connection in self.active_connections:
            await connection.send_json(message)


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # websocket is the name of the connection basically, could have named newConnection or something
    """
    Expects initial JSON payload:
        this is what the frontend would actually send
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
    await manager.connect(websocket) # connect to the client that sent request to , the handshake 
    try:
        while True:
            #  Wait for a "Simulate" command (blocks here until you click the button)
            data = await websocket.receive_json()
            
            jobs_data = data.get("jobs", [])
            algo      = data.get("algo", "fcfs")
            quantum   = data.get("quantum", 2)

            #  Create a FRESH Simulator for this run
            
            sim = Simulator(algorithm=algo, quantum=quantum)
            
            for job in jobs_data:
                sim.submit(
                    pid=job["pid"],
                    arrival_time=job["arrival_time"],
                    burst_time=job["burst_time"]
                )

            #  Run Math (Logic Layer)
            sim.run()

            #  Stream Animation (Visualization Layer)
            # We iterate through the timeline we fixed in step 1
            for pid, start_time, end_time in sim.timeline:
                
                await manager.send_json({
                    "event": "start", 
                    "pid": pid, 
                    "time": start_time
                }, websocket)

                duration = end_time - start_time
                
                # Speed control: 0.5s real time = 1 unit simulation time
                await asyncio.sleep(duration * 0.5)

                await manager.send_json({
                    "event": "finish", 
                    "pid": pid, 
                    "time": end_time
                }, websocket)

            # Send Final Score
            metrics = sim.get_metrics()
            await manager.send_json({"event": "metrics", **metrics}, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
