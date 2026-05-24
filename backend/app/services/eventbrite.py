import os
import httpx

BASE_URL = "https://www.eventbriteapi.com/v3/events/search/"


def _normalize(event: dict) -> dict:
    venue = event.get("venue") or {}
    address = venue.get("address") or {}
    logo = event.get("logo") or {}

    return {
        "id": f"eb-{event['id']}",
        "source": "eventbrite",
        "name": (event.get("name") or {}).get("text"),
        "start_date": (event.get("start") or {}).get("local", "")[:10] or None,
        "start_time": (event.get("start") or {}).get("local", "")[11:16] or None,
        "venue_name": venue.get("name"),
        "venue_address": address.get("address_1"),
        "city": address.get("city"),
        "state": address.get("region"),
        "url": event.get("url"),
        "image": (logo.get("original") or {}).get("url"),
        "category": None,
    }


async def search_eventbrite(
    *,
    city: str | None,
    state: str | None,
    zip_code: str | None,
    category: str | None,
    start_iso: str | None,
    end_iso: str | None,
    size: int,
) -> list[dict]:
    token = os.getenv("EVENTBRITE_TOKEN")
    if not token:
        return []

    if zip_code and not city:
        location = zip_code
    elif state and city:
        location = f"{city}, {state}"
    else:
        location = city

    params = {
        "location.address": location,
        "expand": "venue",
        "page_size": min(size, 50),
        "sort_by": "date",
    }
    # Eventbrite expects un-zoned local datetime (no Z suffix)
    if start_iso:
        params["start_date.range_start"] = start_iso.replace("Z", "")
    if end_iso:
        params["start_date.range_end"] = end_iso.replace("Z", "")

    async with httpx.AsyncClient(
        timeout=10,
        headers={"Authorization": f"Bearer {token}"},
    ) as client:
        resp = await client.get(BASE_URL, params=params)
        resp.raise_for_status()
        data = resp.json()

    return [_normalize(e) for e in data.get("events", [])]
