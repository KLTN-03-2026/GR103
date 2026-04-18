from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class TourHistorySchema(BaseModel):
    tour_name: str
    booking_date: datetime
    status: str # "completed", "cancelled", etc.
    total_price: float
    itinerary_snapshot: List[str] = []

    class Config:
        from_attributes = True