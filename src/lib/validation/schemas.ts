/**
 * Shared Validation Schemas & Sanitization Utilities (Single Source of Truth)
 *
 * Enforces strict, identical validation rules across Frontend, Node.js, and FastAPI.
 * Rules:
 *  - Email: max 254 chars, RFC 5321, trimmed, lowercased, disposable domain check.
 *  - Password: min 8 chars, max 72 bytes (bcrypt limit), top breached/common password rejection.
 *  - Name: Unicode letters (\p{L}), spaces, hyphens, apostrophes, periods, 2-60 chars.
 *          Rejects digits-only, repeated single char ("aaaa"), keyboard mash, emoji, and HTML tags.
 *  - Phone: E.164 international format (+1234567890).
 *  - DOB / Age: Valid date, not in future, realistic age (5-120 yrs, configurable).
 *  - Assessment: Strict literal enums for all 11 questions matching ML model one-hot encoding.
 *  - Symptoms: 3-2000 chars, stripped of HTML and control characters.
 *  - Extra fields: Rejected via .strict().
 */

import { z } from "zod";

// ─── 1. Disposable Email Domains (Configurable) ────────────────────────────────

export const DEFAULT_DISPOSABLE_DOMAINS = new Set([
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
]);

export function isDisposableEmail(email: string, customDomains?: string[]): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return false;
  if (customDomains && customDomains.length > 0) {
    const customSet = new Set(customDomains.map((d) => d.toLowerCase().trim()));
    if (customSet.has(domain)) return true;
  }
  return DEFAULT_DISPOSABLE_DOMAINS.has(domain);
}

// ─── 2. Top Breached & Common Passwords List ───────────────────────────────────

export const TOP_COMMON_PASSWORDS = new Set([
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
]);

// ─── 3. Sanitization Helpers ──────────────────────────────────────────────────

/**
 * Strips HTML tags (<...>), script/javascript injection, and ASCII control characters.
 */
export function sanitizeText(input: string): string {
  if (typeof input !== "string") return "";
  return input
    // Strip control characters except newline and carriage return
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Strip HTML tags
    .replace(/<[^>]*>/g, "")
    // Trim surrounding whitespace
    .trim();
}

/**
 * Escapes HTML special characters for safe output display.
 */
export function escapeHtml(input: string): string {
  if (typeof input !== "string") return "";
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return input.replace(/[&<>"']/g, (char) => map[char] || char);
}

// ─── 4. Name Junk & Mashed Detection ──────────────────────────────────────────

const JUNK_NAME_PATTERNS = [
  /^(asdf|qwer|zxcv|hjkl|poiuy)+$/i, // Keyboard mash
  /^(.)\1{3,}$/u,                    // Single repeated character e.g. "aaaa"
  /^[0-9]+$/,                        // Digits only
  /<[^>]+>/,                         // HTML tags
];

export function isJunkName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2) return true;
  for (const pattern of JUNK_NAME_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  // Check for emojis
  if (/\p{Extended_Pictographic}/u.test(trimmed)) return true;
  return false;
}

// ─── 5. Core Atomic Schemas ───────────────────────────────────────────────────

export const EmailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .max(254, "Email must not exceed 254 characters")
  .email("Please enter a valid email address")
  .refine((val) => !isDisposableEmail(val), {
    message: "Disposable or temporary email addresses are not allowed",
  });

export const PasswordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters long")
  .refine(
    (val) => new TextEncoder().encode(val).length <= 72,
    "Password must not exceed 72 bytes"
  )
  .refine(
    (val) => !TOP_COMMON_PASSWORDS.has(val.toLowerCase()),
    "This password is too common and easily guessed. Please choose a more secure password."
  );

export const NameSchema = z
  .string({ required_error: "Full name is required" })
  .trim()
  .min(2, "Full name must be at least 2 characters long")
  .max(60, "Full name must not exceed 60 characters")
  .refine(
    (val) => /^[\p{L}\p{M}\s.'-]+$/u.test(val),
    "Name can only contain letters, spaces, hyphens, periods, and apostrophes"
  )
  .refine((val) => !isJunkName(val), {
    message: "Please enter a valid personal name",
  });

export const PhoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{1,14}$/, "Phone must be in valid E.164 international format (e.g. +1234567890)")
  .optional()
  .or(z.literal(""));

export const DateOfBirthSchema = (minAgeYears = 5, maxAgeYears = 120) =>
  z
    .string()
    .trim()
    .refine((val) => !isNaN(Date.parse(val)), "Please provide a valid date")
    .refine((val) => {
      const birth = new Date(val);
      const now = new Date();
      return birth <= now;
    }, "Date of birth cannot be in the future")
    .refine((val) => {
      const birth = new Date(val);
      const now = new Date();
      const age = (now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return age >= minAgeYears && age <= maxAgeYears;
    }, `Age must be between ${minAgeYears} and ${maxAgeYears} years old`);

// ─── 6. Assessment Enums & Schema (11 Fixed Options) ──────────────────────────

export const BodyFrameEnum = z.enum(["Thin and Lean", "Medium", "Well Built"], {
  errorMap: () => ({ message: "bodyFrame must be 'Thin and Lean', 'Medium', or 'Well Built'" }),
});

export const PaceOfWorkEnum = z.enum(["Fast", "Medium", "Slow"], {
  errorMap: () => ({ message: "paceOfWork must be 'Fast', 'Medium', or 'Slow'" }),
});

export const BodyEnergyEnum = z.enum(["Low", "Medium", "High"], {
  errorMap: () => ({ message: "bodyEnergy must be 'Low', 'Medium', or 'High'" }),
});

export const HungerPatternEnum = z.enum(["Skips Meals", "Irregular", "Regular"], {
  errorMap: () => ({ message: "hungerPattern must be 'Skips Meals', 'Irregular', or 'Regular'" }),
});

export const HairTypeEnum = z.enum(["Dry", "Normal", "Greasy"], {
  errorMap: () => ({ message: "hairType must be 'Dry', 'Normal', or 'Greasy'" }),
});

export const SleepPatternEnum = z.enum(["Light Sleeper", "Normal", "Sleepy"], {
  errorMap: () => ({ message: "sleepPattern must be 'Light Sleeper', 'Normal', or 'Sleepy'" }),
});

export const MentalActivityEnum = z.enum(["Restless", "Stable", "Active"], {
  errorMap: () => ({ message: "mentalActivity must be 'Restless', 'Stable', or 'Active'" }),
});

export const VoiceQualityEnum = z.enum(["Deep", "Rough", "Fast"], {
  errorMap: () => ({ message: "voiceQuality must be 'Deep', 'Rough', or 'Fast'" }),
});

export const JointStructureEnum = z.enum(["Light", "Medium", "Heavy"], {
  errorMap: () => ({ message: "jointStructure must be 'Light', 'Medium', or 'Heavy'" }),
});

export const SkinTypeEnum = z.enum(["Dry", "Rough", "Soft", "Oily"], {
  errorMap: () => ({ message: "skinType must be 'Dry', 'Rough', 'Soft', or 'Oily'" }),
});

export const BodyOdorEnum = z.enum(["Mild", "Moderate", "Strong"], {
  errorMap: () => ({ message: "bodyOdor must be 'Mild', 'Moderate', or 'Strong'" }),
});

export const AssessmentAnswersSchema = z
  .object({
    bodyFrame: BodyFrameEnum,
    paceOfWork: PaceOfWorkEnum,
    bodyEnergy: BodyEnergyEnum,
    hungerPattern: HungerPatternEnum,
    hairType: HairTypeEnum,
    sleepPattern: SleepPatternEnum,
    mentalActivity: MentalActivityEnum,
    voiceQuality: VoiceQualityEnum,
    jointStructure: JointStructureEnum,
    skinType: SkinTypeEnum,
    bodyOdor: BodyOdorEnum,
  })
  .strict();

export type AssessmentAnswersType = z.infer<typeof AssessmentAnswersSchema>;

// ─── 7. Auth Form Schemas ─────────────────────────────────────────────────────

export const SignUpFormSchema = z
  .object({
    fullName: NameSchema,
    email: EmailSchema,
    password: PasswordSchema,
  })
  .strict();

export const SignInFormSchema = z
  .object({
    email: EmailSchema,
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password cannot be empty")
      .max(72, "Password exceeds maximum length"),
  })
  .strict();

export const PasswordResetRequestSchema = z
  .object({
    email: EmailSchema,
  })
  .strict();

export const PasswordUpdateSchema = z
  .object({
    password: PasswordSchema,
  })
  .strict();

// ─── 8. Profile & Symptom Checker Schemas ──────────────────────────────────────

export const ProfileUpdateSchema = z
  .object({
    fullName: NameSchema,
    avatarUrl: z.string().url("Avatar must be a valid URL").optional().or(z.literal("")),
    phone: PhoneSchema.optional(),
  })
  .strict();

export const DoshaTypeEnum = z.enum(["vata", "pitta", "kapha", "Unknown", "tridosha"], {
  errorMap: () => ({ message: "doshaType must be 'vata', 'pitta', 'kapha', 'tridosha', or 'Unknown'" }),
});

export const SymptomCheckerInputSchema = z
  .object({
    symptoms: z
      .string({ required_error: "Please describe your symptoms" })
      .trim()
      .min(3, "Symptoms description must be at least 3 characters long")
      .max(2000, "Symptoms description cannot exceed 2000 characters")
      .transform(sanitizeText),
    doshaType: DoshaTypeEnum.default("Unknown"),
    additionalContext: z
      .string()
      .trim()
      .max(1000, "Additional context cannot exceed 1000 characters")
      .transform(sanitizeText)
      .optional()
      .or(z.literal("")),
  })
  .strict();

export type SymptomCheckerInputType = z.infer<typeof SymptomCheckerInputSchema>;
