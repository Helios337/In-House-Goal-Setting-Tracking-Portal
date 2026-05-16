from pydantic import BaseModel, ConfigDict
from datetime import datetime

class CycleCreate(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime

class CycleOut(BaseModel):
    id: int
    name: str
    start_date: datetime
    end_date: datetime

    model_config = ConfigDict(from_attributes=True)
