# api/models.py
from pydantic import BaseModel

class JobRequest(BaseModel):
    pid: int
    arrival_time: int
    burst_time: int

class MetricsResponse(BaseModel):
    algorithm : str
    average_turnaround_time: float
    average_waiting_time: float
    process_count: int
    # (optional) include detailed per-job stats:
    # details: list[dict]
