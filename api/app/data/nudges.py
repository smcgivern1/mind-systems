NUDGES = [
    # Breath
    {
        "id": "breath_box",
        "category": "breath",
        "name": "Box breath",
        "prompt": "Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat four times.",
        "why": "Slowing the exhale activates the parasympathetic nervous system. The count gives your attention something to hold onto.",
        "keywords": [],
    },
    {
        "id": "breath_long_exhale",
        "category": "breath",
        "name": "Long exhale",
        "prompt": "Breathe in for 4, out for 8. Repeat six times.",
        "why": "Longer exhales than inhales signal safety to the body, even when the mind doesn't yet feel it.",
        "keywords": ["overwhelmed", "racing", "panic", "anxious", "anxiety"],
    },
    {
        "id": "breath_physiological_sigh",
        "category": "breath",
        "name": "Physiological sigh",
        "prompt": "Two short inhales through the nose, then one long exhale through the mouth. Repeat three times.",
        "why": "This resets carbon-dioxide balance faster than any other breath pattern. It's the body's built-in reset.",
        "keywords": ["panicking", "can't breathe", "stressed"],
    },
    # Reframes
    {
        "id": "reframe_fortune_telling",
        "category": "reframe",
        "name": "Fortune telling",
        "prompt": "You're predicting a bad outcome you can't actually know. What's one thing that could also be true?",
        "why": "When the mind treats a feared future as fact, the body responds as if it's already happening. Naming the pattern interrupts the response.",
        "keywords": ["will", "won't", "going to", "never", "always", "definitely"],
    },
    {
        "id": "reframe_catastrophising",
        "category": "reframe",
        "name": "Catastrophising",
        "prompt": "You're assuming the worst case is the likely case. On a scale of 1–10, how bad is this actually likely to be?",
        "why": "The brain's threat system rounds up. A specific number forces a more honest estimate.",
        "keywords": ["disaster", "ruined", "terrible", "awful", "worst"],
    },
    {
        "id": "reframe_mind_reading",
        "category": "reframe",
        "name": "Mind reading",
        "prompt": "You're assuming you know what someone else is thinking. What evidence do you actually have? What else could explain it?",
        "why": "Most 'they think X about me' is projection of our own fear. Asking for evidence breaks the loop.",
        "keywords": ["they", "he", "she", "people", "everyone", "nobody"],
    },
    {
        "id": "reframe_all_or_nothing",
        "category": "reframe",
        "name": "All-or-nothing",
        "prompt": "You're seeing this as total success or total failure. What's the partial truth between the two extremes?",
        "why": "Black-and-white thinking strips out the 80% of life that's grey. Naming a middle removes the cliff.",
        "keywords": ["completely", "totally", "failure", "useless", "pointless"],
    },
    {
        "id": "reframe_should",
        "category": "reframe",
        "name": "Should statements",
        "prompt": "You're measuring yourself against an imagined rule. Whose voice is the 'should' in? Is it actually yours?",
        "why": "Most shoulds are inherited. Once you see whose they are, you can choose whether to keep them.",
        "keywords": ["should", "must", "have to", "supposed to"],
    },
    # Grounding
    {
        "id": "ground_5_4_3_2_1",
        "category": "grounding",
        "name": "5-4-3-2-1",
        "prompt": "Name 5 things you can see, 4 you can hear, 3 you can touch, 2 you can smell, 1 you can taste.",
        "why": "Anxiety lives in the future. The senses live only in the present. Each name pulls you back.",
        "keywords": [],
    },
    {
        "id": "ground_feet_floor",
        "category": "grounding",
        "name": "Feet on the floor",
        "prompt": "Press both feet firmly into the floor for 30 seconds. Notice the pressure, the temperature, the contact.",
        "why": "The body cannot be anywhere except where it is. When the mind is racing, the body is the anchor.",
        "keywords": [],
    },
]

ACKNOWLEDGEMENTS = [
    "Thanks for being honest with yourself.",
    "Noted. Here's something that might help.",
    "Got it. Try this if you have a minute.",
    "Acknowledged. One small thing to try.",
]


def select_nudge(content: str | None, exclude_ids: list[str] | None = None, entry_id: str | None = None) -> dict:
    exclude = set(exclude_ids or [])
    text = (content or "").lower()

    matched_category = None
    if text and len(text) >= 20:
        for n in NUDGES:
            if any(k in text for k in n["keywords"]):
                matched_category = n["category"]
                break

    if matched_category is None:
        if not text or len(text) < 20:
            matched_category = "grounding"
        else:
            categories = ["breath", "reframe", "grounding"]
            seed = sum(ord(c) for c in (entry_id or "")) if entry_id else 0
            matched_category = categories[seed % 3]

    pool = [n for n in NUDGES if n["category"] == matched_category and n["id"] not in exclude]
    if not pool:
        pool = [n for n in NUDGES if n["id"] not in exclude]
    if not pool:
        pool = NUDGES

    seed = sum(ord(c) for c in (entry_id or "x")) if entry_id else 0
    return pool[seed % len(pool)]


def pick_acknowledgement(entry_id: str | None) -> str:
    seed = sum(ord(c) for c in (entry_id or "x")) if entry_id else 0
    return ACKNOWLEDGEMENTS[seed % len(ACKNOWLEDGEMENTS)]
