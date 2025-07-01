# api/routes.py
from fastapi import APIRouter, HTTPException
from typing import List
from scheduler.process import Process
from scheduler.fcfs import fcfs_schedule
from scheduler.metrics import calculate_metrics
from .models import JobRequest, MetricsResponse

router = APIRouter(prefix="")

# In‑memory store of submitted jobs
jobs: List[Process] = []

@router.post("/jobs", status_code=201)
def submit_job(job: JobRequest):
    """
    Submit a new process/job to the scheduler.
    """
    proc = Process(
        pid=job.pid,
        arrival_time=job.arrival_time,
        burst_time=job.burst_time
    )
    jobs.append(proc)
    print(jobs)
    return {"message": "Job submitted successfully"}



@router.get("/metrics", response_model=MetricsResponse)
def get_metrics():
    """
    Run FCFS on all submitted jobs and return scheduling metrics
    """
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs submitted yet")
    # Use a copy so tests don’t mutate original list
    
    finished = fcfs_schedule(jobs.copy())
    metrics = calculate_metrics(finished)
    # Drop the detailed breakdown if you only want the three core fields:
    return {
        "average_turnaround_time": metrics["average_turnaround_time"],
        "average_waiting_time": metrics["average_waiting_time"],
        "process_count": metrics["process_count"]
    }
