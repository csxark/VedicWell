"""
Database Migrator and Schema Verification Module for Supabase.

Provides:
  1. check_schema() -> Inspects Supabase tables, columns, and functions.
  2. run_migrations() -> Executes idempotent migrations if PostgreSQL connection is provided.
  3. CLI runner -> Run directly via `python db_migrator.py` or `python db_migrator.py --migrate`.
"""

import os
import sys
import asyncio
from typing import Dict, Any, List, Optional
from pathlib import Path

REQUIRED_TABLES = [
    "profiles",
    "dosha_assessments",
    "symptom_history",
    "user_engagement",
]

REQUIRED_DOSHA_COLUMNS = [
    "user_id",
    "dominant_dosha",
    "vata_score",
    "pitta_score",
    "kapha_score",
    "answers",
    "confidence",
    "secondary_dosha",
    "secondary_confidence",
    "prediction_source",
    "key_traits",
    "guest_session_id",
    "claimed_at",
    "original_guest_session_id",
]

REQUIRED_FUNCTIONS = [
    "claim_guest_assessment",
]


def get_database_url() -> Optional[str]:
    """Retrieve direct PostgreSQL connection string from environment if set."""
    url = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL") or os.getenv("POSTGRES_URL")
    if not url:
        return None
    # asyncpg requires postgresql:// rather than postgres://
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    return url


def get_all_in_one_sql() -> str:
    """Load the all-in-one idempotent setup SQL script."""
    candidates = [
        Path(__file__).parent.parent / "supabase" / "migrations" / "all_in_one_setup.sql",
        Path(__file__).parent / "migrations" / "all_in_one_setup.sql",
        Path("supabase/migrations/all_in_one_setup.sql"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate.read_text(encoding="utf-8")
    raise FileNotFoundError("Could not locate all_in_one_setup.sql migration script.")


async def check_schema_postgres(db_url: str) -> Dict[str, Any]:
    """Check database schema using direct PostgreSQL connection via asyncpg."""
    import asyncpg

    result: Dict[str, Any] = {
        "connected": True,
        "method": "postgres",
        "tables": {},
        "missing_tables": [],
        "missing_columns": [],
        "functions": {},
        "missing_functions": [],
        "all_ready": False,
    }

    conn = await asyncpg.connect(db_url, statement_cache_size=0)
    try:
        # 1. Check tables
        table_rows = await conn.fetch(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            """
        )
        existing_tables = {r["table_name"] for r in table_rows}

        for table in REQUIRED_TABLES:
            present = table in existing_tables
            result["tables"][table] = present
            if not present:
                result["missing_tables"].append(table)

        # 2. Check columns on dosha_assessments
        if "dosha_assessments" in existing_tables:
            col_rows = await conn.fetch(
                """
                SELECT column_name, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'dosha_assessments'
                """
            )
            existing_cols = {r["column_name"]: r["is_nullable"] for r in col_rows}
            result["dosha_assessments_user_id_nullable"] = (existing_cols.get("user_id") == "YES")

            for col in REQUIRED_DOSHA_COLUMNS:
                if col not in existing_cols:
                    result["missing_columns"].append(f"dosha_assessments.{col}")

        # 3. Check functions
        fn_rows = await conn.fetch(
            """
            SELECT routine_name
            FROM information_schema.routines
            WHERE routine_schema = 'public'
            """
        )
        existing_fns = {r["routine_name"] for r in fn_rows}
        for fn in REQUIRED_FUNCTIONS:
            present = fn in existing_fns
            result["functions"][fn] = present
            if not present:
                result["missing_functions"].append(fn)

        result["all_ready"] = (
            len(result["missing_tables"]) == 0
            and len(result["missing_columns"]) == 0
            and len(result["missing_functions"]) == 0
        )
    finally:
        await conn.close()

    return result


async def check_schema_rest(supabase_url: str, service_key: str) -> Dict[str, Any]:
    """Check database schema using Supabase PostgREST endpoints via httpx."""
    import httpx

    result: Dict[str, Any] = {
        "connected": False,
        "method": "rest",
        "tables": {},
        "missing_tables": [],
        "functions": {},
        "missing_functions": [],
        "all_ready": False,
    }

    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
    }

    async with httpx.AsyncClient(timeout=8.0) as client:
        # Check tables
        for table in REQUIRED_TABLES:
            try:
                resp = await client.get(
                    f"{supabase_url}/rest/v1/{table}?limit=0",
                    headers=headers,
                )
                present = (resp.status_code == 200)
                result["tables"][table] = present
                if not present:
                    result["missing_tables"].append(table)
                result["connected"] = True
            except Exception as exc:
                result["tables"][table] = False
                result["missing_tables"].append(table)
                result["error"] = str(exc)

        # Check claim RPC function
        try:
            rpc_resp = await client.post(
                f"{supabase_url}/rest/v1/rpc/claim_guest_assessment",
                headers=headers,
                json={"p_guest_session_id": "test", "p_assessment_id": "00000000-0000-0000-0000-000000000000"},
            )
            # 200 means function exists and executed
            fn_present = rpc_resp.status_code in [200, 400]
            result["functions"]["claim_guest_assessment"] = fn_present
            if not fn_present:
                result["missing_functions"].append("claim_guest_assessment")
        except Exception:
            result["functions"]["claim_guest_assessment"] = False
            result["missing_functions"].append("claim_guest_assessment")

    result["all_ready"] = (
        len(result["missing_tables"]) == 0 and len(result["missing_functions"]) == 0
    )
    return result


async def check_schema() -> Dict[str, Any]:
    """Main entrypoint to check schema readiness across either Postgres or REST."""
    db_url = get_database_url()
    if db_url:
        try:
            return await check_schema_postgres(db_url)
        except Exception as exc:
            print(f"Warning: PostgreSQL connection check failed: {exc}")

    supabase_url = os.getenv("SUPABASE_URL", "")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if supabase_url and service_key:
        try:
            return await check_schema_rest(supabase_url, service_key)
        except Exception as exc:
            return {
                "connected": False,
                "error": f"REST check failed: {exc}",
                "all_ready": False,
            }

    return {
        "connected": False,
        "error": "Neither DATABASE_URL nor (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) are configured.",
        "all_ready": False,
    }


async def run_migrations(db_url: Optional[str] = None) -> Dict[str, Any]:
    """Execute all-in-one idempotent migrations using direct PostgreSQL connection."""
    import asyncpg

    url = db_url or get_database_url()
    if not url:
        return {
            "success": False,
            "error": "Cannot run migrations: DATABASE_URL is not set. To apply migrations, either set DATABASE_URL or execute supabase/migrations/all_in_one_setup.sql in the Supabase SQL editor.",
        }

    sql = get_all_in_one_sql()
    print("Connecting to database to apply migrations...")

    conn = await asyncpg.connect(url, statement_cache_size=0)
    try:
        # Execute the all-in-one script
        await conn.execute(sql)
        print("Migrations successfully applied.")

        # Re-verify schema
        verification = await check_schema_postgres(url)
        return {
            "success": True,
            "message": "All migrations executed successfully and schema verified.",
            "verification": verification,
        }
    except Exception as exc:
        print(f"Migration execution failed: {exc}")
        return {
            "success": False,
            "error": str(exc),
        }
    finally:
        await conn.close()


async def main():
    """CLI entrypoint."""
    action = sys.argv[1] if len(sys.argv) > 1 else "--check"

    if action in ["--migrate", "-m", "migrate"]:
        print("Running Supabase database migrations...")
        result = await run_migrations()
        print(result)
    else:
        print("Checking Supabase schema status...")
        status = await check_schema()
        print(status)
        if not status.get("all_ready"):
            print("\n[!] Warning: Database schema is missing required tables/functions.")
            print("Run with `--migrate` or apply `supabase/migrations/all_in_one_setup.sql` in the Supabase SQL Editor.")


if __name__ == "__main__":
    asyncio.run(main())
