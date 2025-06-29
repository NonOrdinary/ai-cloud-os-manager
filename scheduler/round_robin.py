from typing import List
from collections import deque
from .process import Process


def round_robin_schedule(processes: List[Process], time_quantum: int) -> List[Process]:
    """
    Round Robin scheduling simulation.
    Args:
        processes: List of Process objects (unsorted or sorted by arrival_time).
        time_quantum: Time slice each process receives per turn.
    Returns:
        List of Process objects with updated start_time, finish_time, and remaining_time.
    """
    # Initialize queue sorted by arrival
    queue = deque(sorted(processes, key=lambda p: p.arrival_time))
    current_time = 0
    finished = []

    # Ready queue for processes that have arrived
    ready = deque()

    while queue or ready:
        # Move earliest arrivals into ready
        while queue and queue[0].arrival_time <= current_time:
            ready.append(queue.popleft())

        if not ready:
            # CPU idle: jump to next arrival
            current_time = queue[0].arrival_time
            continue

        proc = ready.popleft()
        # If first run, record start_time
        if proc.start_time is None:
            proc.start_time = current_time
            proc.state = "running"

        # Execute for time_quantum or until completion
        exec_time = min(time_quantum, proc.remaining_time)
        proc.remaining_time -= exec_time
        current_time += exec_time

        # If process still has work, requeue it
        if proc.remaining_time > 0:
            proc.state = "ready"
            ready.append(proc)
        else:
            proc.finish_time = current_time
            proc.state = "terminated"
            finished.append(proc)

    return finished