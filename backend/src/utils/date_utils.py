import datetime
from typing import Any, Optional
import pandas as pd

def format_posted_date_for_csv(raw_date: Any) -> str:
    """
    Standardizes any raw date, ISO string, or numeric epoch timestamp into 'YYYY-MM-DD'.
    If the date is missing, empty, or unparseable into a realistic valid date, returns 'N/A'.
    """
    if raw_date is None:
        return "N/A"
    
    s_val = str(raw_date).strip()
    if not s_val or s_val.lower() in ["none", "null", "nan", "n/a", "", "undefined", "nat"]:
        return "N/A"
        
    try:
        # Check numeric epoch timestamp (seconds or milliseconds)
        clean_num = s_val.replace(".", "", 1)
        if clean_num.isdigit():
            ts = float(s_val)
            # Timestamp in milliseconds
            if ts > 1e11:
                ts = ts / 1000.0
            # Realistic epoch range (Between 2010-01-01 and 2035-01-01)
            if 1262304000 <= ts <= 2051222400:
                dt = datetime.datetime.utcfromtimestamp(ts)
                return dt.strftime("%Y-%m-%d")
            else:
                return "N/A"
                
        # Check ISO timestamp e.g. "2026-08-20T14:32:00Z"
        if "T" in s_val:
            date_part = s_val.split("T")[0].strip()
            if len(date_part) == 10 and date_part[4] == "-" and date_part[7] == "-":
                return date_part

        # Check standard YYYY-MM-DD format
        if len(s_val) >= 10 and s_val[4] == "-" and s_val[7] == "-":
            # Validate numeric parts
            parts = s_val[:10].split("-")
            if len(parts) == 3 and parts[0].isdigit() and parts[1].isdigit() and parts[2].isdigit():
                year = int(parts[0])
                if 2010 <= year <= 2035:
                    return s_val[:10]

        # Use Pandas robust timestamp parser
        parsed = pd.to_datetime(s_val, errors="coerce")
        if pd.notna(parsed) and 2010 <= parsed.year <= 2035:
            return parsed.strftime("%Y-%m-%d")
    except Exception:
        pass
        
    return "N/A"

def is_within_days(raw_date: Any, max_days: int) -> bool:
    """
    Checks if a given raw date is within max_days from now.
    If max_days is 0 or >= 999, returns True.
    If max_days is specified (<= 7 days) and date is missing/N/A, returns False
    to prevent ancient undated jobs from bypassing freshness filters.
    """
    if not max_days or max_days <= 0 or max_days >= 999:
        return True
    if not raw_date:
        return False if max_days <= 7 else True
    
    formatted = format_posted_date_for_csv(raw_date)
    if formatted == "N/A":
        return False if max_days <= 7 else True
        
    try:
        dt = datetime.datetime.strptime(formatted, "%Y-%m-%d")
        now = datetime.datetime.utcnow()
        diff_days = (now - dt).total_seconds() / (24 * 3600)
        # Allow up to 1.5 days future timezone leeway
        return -1.5 <= diff_days <= float(max_days)
    except Exception:
        return False if max_days <= 7 else True
