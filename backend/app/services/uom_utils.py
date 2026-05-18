"""Map frontend UoM labels to progress_service types."""

FRONTEND_UOM_MAP = {
    "Min (Numeric / %)": "PERCENTAGE",
    "Max (Numeric / %)": "INVERTED",
    "Zero": "INVERTED",
    "Timeline": "PERCENTAGE",
    "Min": "PERCENTAGE",
    "Max": "INVERTED",
    "PERCENTAGE": "PERCENTAGE",
    "ABSOLUTE": "ABSOLUTE",
    "INVERTED": "INVERTED",
}


def normalize_uom_type(uom_type: str | None) -> str:
    if not uom_type:
        return "PERCENTAGE"
    return FRONTEND_UOM_MAP.get(uom_type, uom_type.upper())
