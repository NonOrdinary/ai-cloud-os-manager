from dataclasses import dataclass ,field
from typing import Optional #this type hint that the variable can be specified
# or of None basically binding variable to particular type
# For example, Optional[int] means the value can be an integer or None. 
# This file is like a state of process
@dataclass
class Process:
    pid: int
    arrival_time: int
    burst_time: int
    priority: int = 0
    remaining_time: int = field(init=False)
    start_time: Optional[int] = None    #can be specified to only int
    finish_time: Optional[int] = None
    state: str = field(default="ready")  # ready, running, waiting, terminated

    def __post_init__(self):
        self.remaining_time = self.burst_time
        # initially remaining time is burst time only so 
        # when defining this variable, asking value is not correct as
        # remaining time changes