# scheduler/metrics.py
from typing import List
from .process import Process

def calculate_metrics(processes: List[Process]) -> dict:
    total_turnaround = 0
    total_waiting = 0
    detailed = []

    for p in processes:
        turnaround = p.finish_time - p.arrival_time
        waiting = turnaround - p.burst_time

        total_turnaround += turnaround
        total_waiting += waiting

        detailed.append({
            "pid": p.pid,
            "arrival": p.arrival_time,
            "burst": p.burst_time,
            "start": p.start_time,
            "finish": p.finish_time,
            "turnaround": turnaround,
            "waiting": waiting
        })

    n = len(processes)
    return {
        "average_turnaround_time": total_turnaround / n,
        "average_waiting_time": total_waiting / n,
        "process_count": n,
        "details": detailed
    }
