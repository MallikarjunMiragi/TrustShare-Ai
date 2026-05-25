from typing import Dict, List


SIGNAL_LABELS = {
    "punctuality": "return punctuality",
    "completion": "completion rate",
    "rating": "reputation quality",
    "care": "item care",
    "contribution": "community contribution",
    "diversity": "interaction diversity",
    "verification": "verification",
    "responsiveness": "responsiveness",
    "valueHandling": "high-value handling",
}


def clamp01(value: float) -> float:
    return max(0.0, min(1.0, float(value or 0.0)))


def _positive_drivers(signals: Dict, weights: Dict) -> List[Dict]:
    ranked = []
    for key, value in signals.items():
        weight = float(weights.get(key, 0.0))
        ranked.append(
            {
                "label": SIGNAL_LABELS.get(key, key),
                "value": float(value or 0.0),
                "impact": float(value or 0.0) * weight,
            }
        )
    ranked.sort(key=lambda entry: entry["impact"], reverse=True)
    return [
        {
            "label": entry["label"],
            "impact": round(entry["value"] * 100),
            "detail": f'{round(entry["value"] * 100)}% on {entry["label"]}',
        }
        for entry in ranked[:3]
    ]


def _risk_drivers(penalties: Dict, flags: List[Dict]) -> List[Dict]:
    drivers = []
    if penalties.get("overdueExposure", 0) > 0:
        drivers.append(
            {
                "label": "overdue exposure",
                "impact": round(float(penalties.get("overdueExposure", 0)) * 100),
                "detail": "Active overdue items reduce confidence and borrowing freedom.",
            }
        )
    if penalties.get("latePattern", 0) > 0:
        drivers.append(
            {
                "label": "late return pattern",
                "impact": round(float(penalties.get("latePattern", 0)) * 100),
                "detail": "Delayed returns are treated as behavioural risk.",
            }
        )
    concentration = float(penalties.get("counterpartyConcentration", 0)) + float(
        penalties.get("ratingConcentration", 0)
    )
    if concentration > 0:
        drivers.append(
            {
                "label": "concentrated interactions",
                "impact": round(concentration * 100),
                "detail": "Repeated activity with a small group is treated cautiously.",
            }
        )
    for flag in flags[:2]:
        drivers.append(
            {
                "label": str(flag.get("code", "trust flag")).replace("_", " ").lower(),
                "impact": 85 if flag.get("severity") == "high" else 60,
                "detail": flag.get("label", "Detected AI risk flag."),
            }
        )
    return drivers[:3]


def analyze_trust(payload: Dict) -> Dict:
    user = payload.get("user", {})
    profile = payload.get("profile", {})
    breakdown = profile.get("breakdown", {})
    signals = breakdown.get("signals", {})
    weights = breakdown.get("signalWeights", {})
    penalties = breakdown.get("penalties", {})
    counts = breakdown.get("counts", {})
    confidence = breakdown.get("confidence", {})
    trust_score = float(profile.get("trustScore", user.get("trustScore", 0)))

    weighted_signal_strength = sum(float(signals.get(key, 0.0)) * float(weights.get(key, 0.0)) for key in signals)
    model_score = round(
        clamp01(
            trust_score / 100.0 * 0.42
            + weighted_signal_strength * 0.32
            + float(confidence.get("overall", 0.0)) * 0.16
            - float(penalties.get("total", 0.0)) * 0.35
            + float(signals.get("verification", 0.0)) * 0.05
        )
        * 100
    )

    if counts.get("activeOverdueCount", 0) > 0 or trust_score < 45 or penalties.get("total", 0) >= 0.2:
        risk_level = "HIGH"
    elif counts.get("lateReturns", 0) > 0 or trust_score < 65 or penalties.get("total", 0) >= 0.1:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    history_cap_applied = bool(breakdown.get("antiGaming", {}).get("historyCapApplied"))
    borrow_limits = profile.get("borrowLimits", {})

    if risk_level == "HIGH":
        lending_advice = "Recommend manual review before approving expensive or long-duration requests."
        summary = "AI analysis recommends caution due to weak history or active risk factors."
    elif history_cap_applied:
        lending_advice = (
            f'Good early pattern, but still build more history before handling '
            f'{str(borrow_limits.get("maxValueTier", "LOW")).lower()}-value items freely.'
        )
        summary = "AI analysis sees healthy potential, but some behavioural signals still need strengthening."
    elif trust_score >= 80:
        lending_advice = "Safe to lend for standard durations, including higher-value items within limits."
        summary = "AI analysis sees this account as dependable for normal community borrowing."
    else:
        lending_advice = "Suitable for normal community borrowing, with best results on shorter and well-defined requests."
        summary = "AI analysis sees healthy potential, but some behavioural signals still need strengthening."

    actions = []
    if counts.get("lateReturns", 0) > 0:
        actions.append("Focus on on-time returns for the next few requests to lift the trust ceiling faster.")
    if counts.get("uniqueCounterparties", 0) < 3:
        actions.append("Borrow and lend with a wider set of community members to increase trust diversity.")
    if penalties.get("ratingConcentration", 0) > 0 or penalties.get("counterpartyConcentration", 0) > 0:
        actions.append("Avoid repeated closed-loop borrowing with the same people; broader activity helps more.")
    if (profile.get("trustTier") or "LOW") == "LOW" or risk_level == "HIGH":
        actions.append(
            f'Start with {borrow_limits.get("maxDurationDays", 7)}-day or shorter requests and lower-value items.'
        )
    else:
        actions.append("Keep response time fast and complete more successful cycles to move into the next tier.")

    return {
        "source": "python-fastapi",
        "engineVersion": "hybrid-behavior-v1",
        "modelScore": model_score,
        "riskLevel": risk_level,
        "confidence": round(float(confidence.get("overall", 0.0)) * 100),
        "lendingAdvice": lending_advice,
        "summary": summary,
        "positiveDrivers": _positive_drivers(signals, weights),
        "riskDrivers": _risk_drivers(penalties, breakdown.get("flags", [])),
        "recommendedActions": actions[:3],
    }
