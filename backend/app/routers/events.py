from fastapi import APIRouter, HTTPException, Query
from ..services.ticketmaster import search_ticketmaster
from ..services.eventbrite import search_eventbrite

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
    try:
        tm = await search_ticketmaster(city, state, zip_code, category, start_date, end_date, size)
        try:
            eb = await search_eventbrite(city, state, zip_code, category, start_date, end_date, size)
        except Exception:
            eb = []

        events = sorted(
            (tm or []) + (eb or []),
            key=lambda e: e.get("start_date") or "",
        )
        label = zip_code if zip_code else f"{city}{', ' + state if state else ''}"
        return {"location": label, "count": len(events), "events": events}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc))
