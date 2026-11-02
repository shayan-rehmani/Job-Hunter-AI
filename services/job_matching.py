
import re



def normalize_skill(skill: str) -> str:
    """Normalize equivalent skill names."""

    skill = skill.lower().strip()
    skill = re.sub(r"[^a-z0-9+#]", "", skill)

    aliases = {
        "advancedexcel": "excel",
        "advanceexcel": "excel",
        "msexcel": "excel",
        "excel365": "excel",
        "powerbi": "powerbi",
        "msPowerbi": "powerbi",
        "postgresql": "postgres",
        "scikitlearn": "sklearn",
        "js": "javascript",
        "restapi": "restapis",
        "restfulapi": "restapis",
    }

    return aliases.get(skill, skill)


def calculate_skill_match(
    candidate_skills: list,
    required_skills: list,
) -> dict:
    """Calculate transparent skills coverage."""

    if not isinstance(candidate_skills, list):
        candidate_skills = []

    if not isinstance(required_skills, list):
        required_skills = []

    candidate_map = {}

    for skill in candidate_skills:
        if isinstance(skill, str) and skill.strip():
            normalized = normalize_skill(skill)
            if normalized:
                candidate_map[normalized] = skill.strip()

    required_map = {}

    for skill in required_skills:
        if isinstance(skill, str) and skill.strip():
            normalized = normalize_skill(skill)
            if normalized:
                required_map[normalized] = skill.strip()

    if not required_map:
        return {
            "match_percentage": None,
            "matched_skills": [],
            "missing_skills": [],
            "match_basis": "Skills requirements unavailable",
        }

    matched = []
    missing = []

    for normalized, original in required_map.items():
        if normalized in candidate_map:
            matched.append(original)
        else:
            missing.append(original)

    percentage = round(
        len(matched) / len(required_map) * 100
    )

    return {
        "match_percentage": percentage,
        "matched_skills": matched,
        "missing_skills": missing,
        "match_basis": "Required skills coverage",
    }
