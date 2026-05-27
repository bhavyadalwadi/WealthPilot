# ticker-pm-copilot Known Pitfalls

- provider completeness varies; missing premium options data can degrade downstream analysis quality
- cached ticker data can hide provider drift for five minutes
- fallback to mock providers is useful locally but can mask missing production env wiring
- Provider availability and premium endpoint coverage can change output quality without obvious code errors.
