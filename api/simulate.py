# api/simulate.py

from typing import List
from scheduler.process import Process
from scheduler.fcfs import fcfs_schedule
from scheduler.round_robin import round_robin_schedule
from scheduler.metrics import calculate_metrics

def simulate(
    processes: List[Process],
    algo: str,
    quantum: int = 2
) -> dict:
    """
    Run the specified scheduler on a list of processes and compute metrics.

    Args:
        processes: List of Process objects to schedule.
        algo:      "fcfs" or "rr".
        quantum:   Time quantum for RR  otherwise 2.

    Returns:
        Dict with keys:
          - average_turnaround_time
          - average_waiting_time
          - process_count
          - (optionally) details not right now, we will do it later on
    """
    if algo == "fcfs":
        finished = fcfs_schedule(processes)
    elif algo == "rr":
        finished = round_robin_schedule(processes, time_quantum=quantum)
    else:
        raise ValueError(f"Unsupported algorithm: {algo!r}")

    return calculate_metrics(finished)
