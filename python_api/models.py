"""
Pydantic schemas for the Mele calculation API.

The API is used by web, mobile, and AR clients. Request models accept both the
internal numeric shape (`year/month/day/hour/minute`) and the product-friendly
shape (`birth_date`, `birth_time`) so clients do not need to know backend
implementation details.
"""

from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field, field_validator, model_validator


def _coerce_birth_fields(data: Any, *, include_time: bool = False) -> Any:
    if not isinstance(data, dict):
        return data

    next_data = dict(data)
    birth_date = next_data.get("birth_date") or next_data.get("date")
    if birth_date and not all(k in next_data for k in ("year", "month", "day")):
        year, month, day = str(birth_date).split("-")[:3]
        next_data.setdefault("year", int(year))
        next_data.setdefault("month", int(month))
        next_data.setdefault("day", int(day))

    if include_time:
        birth_time = next_data.get("birth_time") or next_data.get("time")
        if birth_time and "hour" not in next_data:
            hour, minute, *_ = str(birth_time).split(":") + ["0"]
            next_data.setdefault("hour", int(hour))
            next_data.setdefault("minute", int(minute))

    timezone = next_data.get("timezone")
    if isinstance(timezone, str):
        timezone_map = {
            "Asia/Taipei": 8.0,
            "Asia/Shanghai": 8.0,
            "Asia/Hong_Kong": 8.0,
            "Asia/Tokyo": 9.0,
            "UTC": 0.0,
        }
        next_data["timezone"] = timezone_map.get(timezone, timezone)

    return next_data


class RenderBundle(BaseModel):
    """Visual and narrative render data for web, mobile, and AR clients."""

    svg: Optional[str] = Field(None, description="Inline SVG for result display.")
    html: Optional[str] = Field(None, description="Readable HTML explanation.")
    palette: list[str] = Field(default_factory=list, description="Recommended colors for AR/native clients.")
    animations: list[dict] = Field(default_factory=list, description="Animation hints for AR/native clients.")
    speech: Optional[str] = Field(None, description="Short spoken summary for TTS or AR narration.")


class CalcResponse(BaseModel):
    tool: str
    version: str = "1.0.0"
    computed_at: datetime
    input: dict
    data: dict = Field(..., description="Structured calculation result for AR/native/web clients.")
    render: RenderBundle


class NumerologyRequest(BaseModel):
    year: int = Field(..., ge=1, le=9999)
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)

    @model_validator(mode="before")
    @classmethod
    def accept_birth_date(cls, data: Any) -> Any:
        return _coerce_birth_fields(data)


class MayaRequest(BaseModel):
    year: int
    month: int
    day: int
    include_leap_day: bool = False

    @model_validator(mode="before")
    @classmethod
    def accept_birth_date(cls, data: Any) -> Any:
        return _coerce_birth_fields(data)


class BaziRequest(BaseModel):
    year: int
    month: int
    day: int
    hour: int = Field(..., ge=0, le=23)
    minute: int = Field(0, ge=0, le=59)
    sect: Literal[1, 2] = 2
    longitude: Optional[float] = None

    @model_validator(mode="before")
    @classmethod
    def accept_birth_date_time(cls, data: Any) -> Any:
        return _coerce_birth_fields(data, include_time=True)


class ZiweiRequest(BaseModel):
    year: int
    month: int
    day: int
    hour: int = Field(..., ge=0, le=23)
    minute: int = Field(0, ge=0, le=59)
    gender: str = "男"

    @model_validator(mode="before")
    @classmethod
    def accept_birth_date_time(cls, data: Any) -> Any:
        return _coerce_birth_fields(data, include_time=True)

    @field_validator("gender")
    @classmethod
    def normalize_gender(cls, value: str) -> str:
        gender_map = {
            "male": "男",
            "m": "男",
            "man": "男",
            "男": "男",
            "female": "女",
            "f": "女",
            "woman": "女",
            "女": "女",
        }
        normalized = gender_map.get(str(value).strip().lower(), value)
        if normalized not in ("男", "女"):
            raise ValueError("gender must be 男/女 or male/female")
        return normalized


class TarotRequest(BaseModel):
    model_config = {"populate_by_name": True}

    count: int = Field(3, ge=1, le=10)
    reversed_enabled: bool = Field(True, alias="reversed")
    spread: str = "three_card"
    seed: Optional[int] = None
    question: Optional[str] = None
    tarot_style: Optional[Literal["forest_athena", "ocean_poseidon", "ancient_pharaoh"]] = "ocean_poseidon"


class RunesRequest(BaseModel):
    model_config = {"populate_by_name": True}

    count: int = Field(3, ge=1, le=24)
    reversed_enabled: bool = Field(True, alias="reversed")
    spread: Optional[str] = None
    material: Optional[str] = "stone"
    seed: Optional[int] = None
    question: Optional[str] = None


class AstroRequest(BaseModel):
    year: int
    month: int
    day: int
    hour: int = Field(..., ge=0, le=23)
    minute: int = Field(0, ge=0, le=59)
    timezone: float = 8.0
    latitude: float = 25.0330
    longitude: float = 121.5654
    house_system: str = "P"

    @model_validator(mode="before")
    @classmethod
    def accept_birth_date_time(cls, data: Any) -> Any:
        return _coerce_birth_fields(data, include_time=True)


class HumanDesignRequest(BaseModel):
    year: int
    month: int
    day: int
    hour: int = Field(..., ge=0, le=23)
    minute: int = Field(0, ge=0, le=59)
    timezone: float = 8.0

    @model_validator(mode="before")
    @classmethod
    def accept_birth_date_time(cls, data: Any) -> Any:
        return _coerce_birth_fields(data, include_time=True)
