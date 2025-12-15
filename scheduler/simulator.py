# scheduler/simulator.py

from typing import List
from .process import Process
from .fcfs import fcfs_schedule
from .round_robin import round_robin_schedule
from .metrics import calculate_metrics

class Simulator:
    """
    Core simulation engine. 
    Submit jobs, choose algorithm, run, and get metrics.
    """

    def __init__(self, algorithm: str = "fcfs", quantum: int = 2):
        self.algorithm = algorithm
        self.quantum = quantum
        self.jobs: List[Process] = []
        self.finished: List[Process] = []
        self.timeline: List[tuple] = [] 

    def submit(self, pid: int, arrival_time: int, burst_time: int, priority: int = 0):
        proc = Process(pid=pid, arrival_time=arrival_time, burst_time=burst_time, priority=priority)
        self.jobs.append(proc)

    def run(self):
        jobs_copy = [Process(p.pid, p.arrival_time, p.burst_time, p.priority) for p in self.jobs]

        # Update to unpack both return values
        if self.algorithm == "fcfs":
            self.finished, self.timeline = fcfs_schedule(jobs_copy)
        elif self.algorithm == "rr":
            self.finished, self.timeline = round_robin_schedule(jobs_copy, time_quantum=self.quantum)
        else:
            raise ValueError(f"Unsupported algorithm: {self.algorithm!r}")

    def get_metrics(self) -> dict:
        if not self.finished:
            raise RuntimeError("Simulator.run() must be called before getting metrics")
        return calculate_metrics(self.finished)

    def reset(self):
        self.jobs.clear()
        self.finished.clear()
