# test_day3.py
from scheduler.process import Process
from scheduler.fcfs import fcfs_schedule
from scheduler.metrics import calculate_metrics

jobs = [
    Process(pid=1, arrival_time=0, burst_time=5),
    Process(pid=2, arrival_time=2, burst_time=3),
    Process(pid=3, arrival_time=4, burst_time=1),
]

done = fcfs_schedule(jobs)
metrics = calculate_metrics(done)

print("Metrics:", metrics)
