THOUGHTS = [
    {"text": "Small, consistent action outlasts grand intention.", "attribution": None},
    {"text": "You don't have to feel ready to begin.", "attribution": None},
    {"text": "The work is the reward. The result is a by-product.", "attribution": None},
    {"text": "Today is enough. You don't need to solve every tomorrow.", "attribution": None},
    {"text": "What you give attention to grows.", "attribution": None},
    {"text": "Slow is smooth. Smooth is steady. Steady is fast.", "attribution": None},
    {"text": "Your nervous system learns from how you treat it.", "attribution": None},
    {"text": "Discipline is remembering what you actually want.", "attribution": None},
    {"text": "The hardest minute is the first one.", "attribution": None},
    {"text": "You can do hard things gently.", "attribution": None},
    {"text": "Rest is part of the work, not the opposite of it.", "attribution": None},
    {"text": "Notice without judging. The noticing is the practice.", "attribution": None},
    {"text": "You are allowed to begin again, as many times as you need.", "attribution": None},
    {"text": "The version of you that shows up today shapes the one who shows up tomorrow.", "attribution": None},
    {"text": "Effort, not outcome, is the only thing fully in your hands.", "attribution": None},
    {"text": "You don't have to perform calm. You can practise it.", "attribution": None},
    {"text": "Most progress is invisible while it's happening.", "attribution": None},
    {"text": "The gap between intention and action closes with one small step.", "attribution": None},
    {"text": "Curiosity is gentler than control, and often more effective.", "attribution": None},
    {"text": "You are not behind. There is no schedule.", "attribution": None},
    {"text": "What feels heavy today is information, not verdict.", "attribution": None},
    {"text": "The body keeps score, but it can also be retrained.", "attribution": None},
    {"text": "A clear no makes room for a real yes.", "attribution": None},
    {"text": "Identity follows action, not the other way around.", "attribution": None},
    {"text": "You don't owe anyone a constant performance of being fine.", "attribution": None},
    {"text": "Patience is a skill, not a personality trait.", "attribution": None},
    {"text": "Choose the next right thing, not the perfect thing.", "attribution": None},
    {"text": "What you tolerate becomes what you live with.", "attribution": None},
    {"text": "The standard you walk past is the standard you accept.", "attribution": None},
    {"text": "You are the one who decides what this day means.", "attribution": None},
]


def thought_for(user_id: str, date_iso: str) -> dict:
    seed = sum(ord(c) for c in f"{user_id}:{date_iso}")
    return THOUGHTS[seed % len(THOUGHTS)]
