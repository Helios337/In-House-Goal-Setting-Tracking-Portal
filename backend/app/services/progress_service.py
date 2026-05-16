def compute_uom_score(actual: float, target: float, uom_type: str) -> float:
    """
    Dynamic UoM score computation.
    Supported uom_types: 'PERCENTAGE', 'ABSOLUTE', 'INVERTED' (where lower is better, e.g., defects).
    Returns a normalized progress score out of 100.
    """
    if target == 0 and uom_type != 'INVERTED':
        return 0.0

    if uom_type in ['PERCENTAGE', 'ABSOLUTE']:
        # Standard: Higher is better
        score = (actual / target) * 100
        return min(score, 100.0) # Cap at 100% completion
        
    elif uom_type == 'INVERTED':
        # Inverted: Lower is better (e.g., Target: 5 bugs, Actual: 2 bugs -> 100% success)
        # If actual exceeds target in an inverted metric, score drops.
        if actual <= target:
            return 100.0
        else:
            # Simple linear penalty for exceeding inverted target.
            # (target / actual) means if target is 5 and actual is 10, score is 50%
            return (target / actual) * 100
            
    raise ValueError(f"Unsupported UoM Type: {uom_type}")
