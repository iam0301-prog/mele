"""
Pydantic schemas for the Mele calculation API.

The API is used by web, mobile, and AR clients. Request models accept both the
internal numeric shape (`year/month/day/hour/minute`) and the product-friendly
shape (`birth_date`, `birth_time`) so clients do not need to know backend
implementation details.
"""

from datetime import datetime
from typing import Any, Literal, Optional
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import BaseModel, Field, field_validator, model_validator


def _nth_weekday_of_month(year: int, month: int, weekday: int, nth: int) -> int:
    first = datetime(year, month, 1)
    offset = (weekday - first.weekday()) % 7
    return 1 + offset + (nth - 1) * 7


def _us_dst_offset(year: int, month: int, day: int, standard: float, daylight: float) -> float:
    # US daylight saving time starts on the second Sunday in March and ends on
    # the first Sunday in November. This fallback is used on Windows when the
    # Python tzdata package is unavailable.
    starts = (3, _nth_weekday_of_month(year, 3, 6, 2))
    ends = (11, _nth_weekday_of_month(year, 11, 6, 1))
    current = (month, day)
    return daylight if starts <= current < ends else standard


def _fallback_iana_offset(value: str, next_data: dict[str, Any]) -> float | None:
    try:
        year = int(next_data.get("year"))
        month = int(next_data.get("month"))
        day = int(next_data.get("day"))
    except (TypeError, ValueError):
        return None

    fallback_rules = {
        "America/Los_Angeles": lambda: _us_dst_offset(year, month, day, -8.0, -7.0),
        "America/New_York": lambda: _us_dst_offset(year, month, day, -5.0, -4.0),
        "Europe/London": lambda: 1.0 if 4 <= month <= 10 else 0.0,
        "Europe/Paris": lambda: 2.0 if 4 <= month <= 10 else 1.0,
    }
    rule = fallback_rules.get(value)
    return rule() if rule else None


def _parse_utc_offset(value: str) -> float | None:
    stripped = value.strip()
    if not stripped:
        return None

    try:
        return float(stripped)
    except ValueError:
        pass

    upper = stripped.upper()
    if upper in {"UTC", "GMT"}:
        return 0.0
    if upper.startswith("UTC") or upper.startswith("GMT"):
        offset = stripped[3:].strip()
        if len(offset) >= 2 and offset[0] in "+-":
            sign = -1 if offset[0] == "-" else 1
            body = offset[1:]
            if ":" in body:
                raw_hours, raw_minutes = body.split(":", 1)
            else:
                raw_hours, raw_minutes = body, "0"
            try:
                hours = int(raw_hours)
                minutes = int(raw_minutes)
            except ValueError:
                return None
            return sign * (hours + minutes / 60)
    return None


def _coerce_timezone(value: Any, next_data: dict[str, Any]) -> Any:
    if not isinstance(value, str):
        return value

    timezone_map = {
        "Asia/Taipei": 8.0,
        "Asia/Shanghai": 8.0,
        "Asia/Hong_Kong": 8.0,
        "Asia/Singapore": 8.0,
        "Asia/Tokyo": 9.0,
        "Asia/Seoul": 9.0,
        "Asia/Ho_Chi_Minh": 7.0,
        "Asia/Jakarta": 7.0,
        "UTC": 0.0,
    }
    if value in timezone_map:
        return timezone_map[value]

    parsed = _parse_utc_offset(value)
    if parsed is not None:
        return parsed

    fallback = _fallback_iana_offset(value, next_data)
    if fallback is not None:
        return fallback

    try:
        year = int(next_data.get("year"))
        month = int(next_data.get("month"))
        day = int(next_data.get("day"))
        hour = int(next_data.get("hour", 12))
        minute = int(next_data.get("minute", 0))
        offset = datetime(year, month, day, hour, minute, tzinfo=ZoneInfo(value)).utcoffset()
    except (TypeError, ValueError, ZoneInfoNotFoundError):
        return value

    if offset is None:
        return value
    return offset.total_seconds() / 3600


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
    if timezone in (None, "") and next_data.get("birth_timezone") not in (None, ""):
        timezone = next_data.get("birth_timezone")
    if timezone not in (None, ""):
        next_data["timezone"] = _coerce_timezone(timezone, next_data)

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
