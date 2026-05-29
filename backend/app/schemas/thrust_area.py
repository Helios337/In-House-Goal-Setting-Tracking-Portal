from pydantic import BaseModel


class ThrustAreaOut(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}
