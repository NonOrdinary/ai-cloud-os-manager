# api/routes.py

from fastapi import APIRouter, HTTPException, Query
from typing import List

from .models import JobRequest, MetricsResponse
from scheduler.simulator import Simulator
from scheduler.process import Process

router = APIRouter()

# In‑memory store of submitted jobs
jobs: List[Process] = [] #type hint , enforcing the data that would be in job(list of processes)


@router.post("/jobs", status_code=201)  # status tellls that it has successfully created resources
def submit_job(job: JobRequest):
    """
    Submit a new process/job to the scheduler.
    Frontend to logic layer data transmission
    """
    proc = Process(
        pid=job.pid,
        arrival_time=job.arrival_time,
        burst_time=job.burst_time
    )
    jobs.append(proc)
    return {"message": "Job submitted successfully"}


@router.get("/metrics", response_model=MetricsResponse)
def get_metrics(
    #the query thing tells server to look for algo(configuration) in HTTP request URL and not json body
    algo: str = Query("fcfs", description="Scheduling algorithm: 'fcfs' or 'rr'"),
    quantum: int = Query(2, gt=0, description="Time quantum for Round Robin")
):
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs submitted yet")

    # Instantiate simulator correctly
    sim = Simulator(algorithm=algo, quantum=quantum)

    # Submit all jobs
    for proc in jobs:
        sim.submit(
            pid=proc.pid,
            arrival_time=proc.arrival_time,
            burst_time=proc.burst_time,
            priority=proc.priority
        )

    # Run and get metric
    try:
        sim.run()
        result = sim.get_metrics()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "algorithm": algo,
        "average_turnaround_time": result["average_turnaround_time"],
        "average_waiting_time": result["average_waiting_time"],
        "process_count": result["process_count"],
        "details": result.get("details")
    }
