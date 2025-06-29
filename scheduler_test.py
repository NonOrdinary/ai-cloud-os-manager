# Example Test for Round Robin Scheduler
from scheduler.process import Process
from scheduler.round_robin import round_robin_schedule

# Define sample processes
jobs = [
    Process(pid=1, arrival_time=0, burst_time=5),
    Process(pid=2, arrival_time=1, burst_time=3),
    Process(pid=3, arrival_time=2, burst_time=1),
]
# Run scheduler with time quantum = 2
finished_jobs = round_robin_schedule(jobs, time_quantum=2)

# Display results
for p in finished_jobs:
    print(f"PID={p.pid}, Start={p.start_time}, Finish={p.finish_time}, Remaining={p.remaining_time}")
