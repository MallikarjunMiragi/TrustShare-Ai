from collections import Counter
from typing import Dict, List


VALUE_TIER_RANK = {"LOW": 1, "MEDIUM": 2, "HIGH": 3}


def clamp01(value: float) -> float:
    return max(0.0, min(1.0, float(value or 0.0)))


def is_value_allowed(item_tier: str, max_tier: str) -> bool:
    return VALUE_TIER_RANK.get(item_tier or "LOW", 1) <= VALUE_TIER_RANK.get(max_tier or "LOW", 1)


def build_recommendations(payload: Dict) -> Dict:
    user = payload.get("user", {})
    profile = payload.get("profile", {})
    items = payload.get("items", [])
    borrow_history = payload.get("borrowHistory", [])
    limit = max(1, min(int(payload.get("limit", 4)), 8))

    category_counter = Counter()
    seen_owner_ids = set()
    for entry in borrow_history:
        item = entry.get("itemId", entry)
        category = str(item.get("category", "")).strip()
        owner_id = str(item.get("ownerId", entry.get("ownerId", ""))).strip()
        if category:
            category_counter[category] += 1
        if owner_id:
            seen_owner_ids.add(owner_id)

    total_history = sum(category_counter.values())
    trust_score = float(profile.get("trustScore", user.get("trustScore", 0)))
    borrow_limits = profile.get("borrowLimits", {})
    max_value_tier = borrow_limits.get("maxValueTier", "LOW")
    max_duration = int(borrow_limits.get("maxDurationDays", 7))
    user_id = str(user.get("_id", user.get("id", "")))

    recommendations = []
    for item in items:
        item_id = str(item.get("_id", ""))
        owner = item.get("ownerId", {})
        owner_id = str(owner.get("_id", owner if isinstance(owner, str) else ""))
        if user_id and owner_id == user_id:
            continue
        if not item.get("available", True):
            continue

        category = str(item.get("category", "")).strip()
        owner_trust = float(owner.get("trustScore", 0)) if isinstance(owner, dict) else 0.0
        value_tier = str(item.get("valueTier", "LOW"))
        category_hits = category_counter.get(category, 0)
        affinity_score = (category_hits / total_history) if total_history else 0.45
        value_match = 1.0 if is_value_allowed(value_tier, max_value_tier) else 0.0
        owner_repeat_penalty = 0.08 if owner_id in seen_owner_ids else 0.0
        recency_boost = 0.04

        raw_score = (
            affinity_score * 0.34
            + (owner_trust / 100.0) * 0.28
            + value_match * 0.18
            + (trust_score / 100.0) * 0.1
            + recency_boost
            - owner_repeat_penalty
        )
        score = round(clamp01(raw_score) * 100)

        reasons = []
        if category_hits > 0:
            reasons.append(f"Matches your past interest in {category.lower()} items")
        else:
            reasons.append("Adds variety beyond your usual borrowing pattern")
        if owner_trust >= 75:
            reasons.append("Shared by a highly trusted community member")
        elif owner_trust >= 55:
            reasons.append("Shared by a reasonably trusted owner")
        if value_match:
            reasons.append(f"Fits within your current {max_value_tier.lower()} value-tier limit")

        caution = ""
        if not value_match:
            caution = f"Your current trust tier does not yet comfortably support {value_tier.lower()}-value borrowing."
        elif value_tier == "HIGH":
            caution = "Use a shorter duration and message the owner clearly because this is a high-value item."

        suggested_duration_days = max(2, min(max_duration, 5 if value_tier == "HIGH" else 7 if value_tier == "MEDIUM" else 10))

        recommendations.append(
            {
                "itemId": item_id,
                "score": score,
                "fitLabel": "High fit" if score >= 75 else "Good fit" if score >= 58 else "Explore",
                "reasons": reasons[:3],
                "caution": caution,
                "suggestedDurationDays": suggested_duration_days,
                "item": item,
            }
        )

    recommendations.sort(key=lambda entry: entry["score"], reverse=True)

    summary = (
        "Recommendations are personalized using your past borrowing categories, trust limits, and owner reliability."
        if total_history
        else "Recommendations are generated using owner reliability, trust limits, and fresh community availability."
    )

    return {
        "source": "python-fastapi",
        "engineVersion": "hybrid-recommender-v1",
        "summary": summary,
        "recommendations": recommendations[:limit],
    }
