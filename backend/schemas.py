"""
Pydantic v2 Validation Schemas (Single Source of Truth - Backend Layer)

Strictly mirrors frontend Zod schemas (src/lib/validation/schemas.ts):
  - extra = 'forbid'
  - str_strip_whitespace = True
  - Identical field names, types, literal enums, and error messages
  - Strict validation on email, password, name, DOB, phone, assessment, and symptoms
"""

import re
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


# ─── 1. Disposable Email Domains ───────────────────────────────────────────────

DEFAULT_DISPOSABLE_DOMAINS = {
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "throwawaymail.com",
    "yopmail.com",
    "sharklasers.com",
    "trashmail.com",
    "getairmail.com",
    "dispostable.com",
}

TOP_COMMON_PASSWORDS = {
    "password",
    "password123",
    "password1",
    "12345678",
    "123456789",
    "1234567890",
    "qwerty123",
    "admin123",
    "welcome1",
    "welcome123",
    "iloveyou",
    "letmein123",
    "monkey123",
    "dragon123",
    "sunshine",
    "master123",
    "trustno1",
}


def sanitize_text(text: str) -> str:
    """Strip control characters and HTML tags."""
    if not isinstance(text, str):
        return ""
    # Strip control characters
    cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)
    # Strip HTML tags
    cleaned = re.sub(r"<[^>]*>", "", cleaned)
    return cleaned.strip()


def is_junk_name(name: str) -> bool:
    """Check for obvious junk names."""
    trimmed = name.strip()
    if len(trimmed) < 2:
        return True
    if re.match(r"^(asdf|qwer|zxcv|hjkl|poiuy)+$", trimmed, re.IGNORECASE):
        return True
    if re.match(r"^(.)\1{3,}$", trimmed):
        return True
    if trimmed.isdigit():
        return True
    if re.search(r"<[^>]+>", trimmed):
        return True
    return False


# ─── 2. Assessment Literal Enums ───────────────────────────────────────────────

class BodyFrameEnum(str, Enum):
    THIN_AND_LEAN = "Thin and Lean"
    MEDIUM = "Medium"
    WELL_BUILT = "Well Built"


class PaceOfWorkEnum(str, Enum):
    FAST = "Fast"
    MEDIUM = "Medium"
    SLOW = "Slow"


class BodyEnergyEnum(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class HungerPatternEnum(str, Enum):
    SKIPS_MEALS = "Skips Meals"
    IRREGULAR = "Irregular"
    REGULAR = "Regular"


class HairTypeEnum(str, Enum):
    DRY = "Dry"
    NORMAL = "Normal"
    GREASY = "Greasy"


class SleepPatternEnum(str, Enum):
    LIGHT_SLEEPER = "Light Sleeper"
    NORMAL = "Normal"
    SLEEPY = "Sleepy"


class MentalActivityEnum(str, Enum):
    RESTLESS = "Restless"
    STABLE = "Stable"
    ACTIVE = "Active"


class VoiceQualityEnum(str, Enum):
    DEEP = "Deep"
    ROUGH = "Rough"
    FAST = "Fast"


class JointStructureEnum(str, Enum):
    LIGHT = "Light"
    MEDIUM = "Medium"
    HEAVY = "Heavy"


class SkinTypeEnum(str, Enum):
    DRY = "Dry"
    ROUGH = "Rough"
    SOFT = "Soft"
    OILY = "Oily"


class BodyOdorEnum(str, Enum):
    MILD = "Mild"
    MODERATE = "Moderate"
    STRONG = "Strong"


# ─── 3. Assessment Schemas ─────────────────────────────────────────────────────

class AssessmentInput(BaseModel):
    """
    Strict assessment input model.
    Rejects extra/unknown fields and requires exact enum literals.
    """
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    bodyFrame: BodyFrameEnum
    paceOfWork: PaceOfWorkEnum
    bodyEnergy: BodyEnergyEnum
    hungerPattern: HungerPatternEnum
    hairType: HairTypeEnum
    sleepPattern: SleepPatternEnum
    mentalActivity: MentalActivityEnum
    voiceQuality: VoiceQualityEnum
    jointStructure: JointStructureEnum
    skinType: SkinTypeEnum
    bodyOdor: BodyOdorEnum


class PredictionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    primaryDosha: str
    confidence: float
    secondaryDosha: str
    secondaryConfidence: float
    keyTraits: List[str]


# ─── 4. Auth & User Validation Schemas ─────────────────────────────────────────

class EmailModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    email: str = Field(..., max_length=254)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
            raise ValueError("Please enter a valid email address")
        domain = v.split("@")[1]
        if domain in DEFAULT_DISPOSABLE_DOMAINS:
            raise ValueError("Disposable or temporary email addresses are not allowed")
        return v


class NameModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    fullName: str = Field(..., min_length=2, max_length=60)

    @field_validator("fullName")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if is_junk_name(v):
            raise ValueError("Please enter a valid personal name")
        # Ensure only Unicode letters, spaces, hyphens, apostrophes, and periods
        if not re.match(r"^[\w\s.'-]+$", v, flags=re.UNICODE):
            raise ValueError("Name can only contain letters, spaces, hyphens, periods, and apostrophes")
        return v


class PasswordModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    password: str = Field(..., min_length=8)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must not exceed 72 bytes")
        if v.lower() in TOP_COMMON_PASSWORDS:
            raise ValueError("This password is too common and easily guessed")
        return v


# ─── 5. Symptom Checker Input Model ───────────────────────────────────────────

class SymptomCheckerInput(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    symptoms: str = Field(..., min_length=3, max_length=2000)
    doshaType: str = Field("Unknown")
    additionalContext: Optional[str] = Field(None, max_length=1000)

    @field_validator("symptoms", "additionalContext")
    @classmethod
    def sanitize(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        return sanitize_text(v)

    @field_validator("doshaType")
    @classmethod
    def validate_dosha(cls, v: str) -> str:
        allowed = {"vata", "pitta", "kapha", "tridosha", "Unknown"}
        if v not in allowed:
            raise ValueError(f"doshaType must be one of {allowed}")
        return v
