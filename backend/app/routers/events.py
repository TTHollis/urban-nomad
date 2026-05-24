from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from ..services.ticketmaster import search_ticketmaster
from ..services.eventbrite import search_eventbrite
from ..services.geocoding import zip_to_location

router = APIRouter(tags=["events"])


@router.get("/events")
async def get_events(
    city: str | None = Query(None, max_length=100),
    state: str | None = Query(None, max_length=50, description="State code or name, e.g. FL or Florida"),
    zip_code: str | None = Query(None, max_length=20, description="ZIP or postal code"),
    category: str | None = Query(None),
    start_date: str | None = Query(None, description="ISO date YYYY-MM-DD"),
    end_date: str | None = Query(None, description="ISO date YYYY-MM-DD"),
    size: int = Query(20, ge=1, le=50),
):
    if not city and not zip_code:
        raise HTTPException(status_code=422, detail="Provide either city or zip_code")

    # If a zip was given, expand to the city level so we get useful results.
    # Most events aren't ticketed at the exact zip — they're across the city.
    resolved_label = None
    if zip_code and not city:
        location = await zip_to_location(zip_code)
        if location:
            city = location["city"]
            state = state or location.get("state") or None
            resolved_label = f"{city}{', ' + state if state else ''} ({zip_code})"
        # If lookup failed, fall through and let services try the zip directly

    # Default start time to NOW (UTC) so we never show past events
    if start_date:
        start_iso = f"{start_date}T00:00:00Z"
    else:
        start_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    end_iso = f"{end_date}T23:59:59Z" if end_date else None

    try:
        tm = await search_ticketmaster(
            city=city,
            state=state,
            zip_code=zip_code if not city else None,
            category=category,
            start_iso=start_iso,
            end_iso=end_iso,
            size=size,
        )
        try:
            eb = await search_eventbrite(
                city=city,
                state=state,
                zip_code=zip_code if not city else None,
                category=category,
                start_iso=start_iso,
                end_iso=end_iso,
                size=size,
            )
        except Exception:
            eb = []

        # Defensive filter: drop anything whose start_date is in the past
        # (in case an upstream provider ignores our filter)
        today = datetime.now(timezone.utc).date().isoformat()
        combined = [
            e for e in ((tm or []) + (eb or []))
            if not e.get("start_date") or e["start_date"] >= today
        ]
        combined.sort(key=lambda e: e.get("start_date") or "")

        if resolved_label:
            label = resolved_label
        elif zip_code:
            label = zip_code
        else:
            label = f"{city}{', ' + state if state else ''}"

        return {"location": label, "count": len(combined), "events": combined}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc))
