"use client";

import Card from "@/components/ui/Card";

const RESOURCES_NUDGES = [
  {
    id: "breath_box",
    category: "breath",
    name: "Box breath",
    prompt: "Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat four times.",
    why: "Slowing the exhale activates the parasympathetic nervous system. The count gives your attention something to hold onto.",
  },
  {
    id: "breath_long_exhale",
    category: "breath",
    name: "Long exhale",
    prompt: "Breathe in for 4, out for 8. Repeat six times.",
    why: "Longer exhales than inhales signal safety to the body, even when the mind doesn't yet feel it.",
  },
  {
    id: "breath_physiological_sigh",
    category: "breath",
    name: "Physiological sigh",
    prompt: "Two short inhales through the nose, then one long exhale through the mouth. Repeat three times.",
    why: "This resets carbon-dioxide balance faster than any other breath pattern. It's the body's built-in reset.",
  },
  {
    id: "reframe_fortune_telling",
    category: "reframe",
    name: "Fortune telling",
    prompt: "You're predicting a bad outcome you can't actually know. What's one thing that could also be true?",
    why: "When the mind treats a feared future as fact, the body responds as if it's already happening. Naming the pattern interrupts the response.",
  },
  {
    id: "reframe_catastrophising",
    category: "reframe",
    name: "Catastrophising",
    prompt: "You're assuming the worst case is the likely case. On a scale of 1–10, how bad is this actually likely to be?",
    why: "The brain's threat system rounds up. A specific number forces a more honest estimate.",
  },
  {
    id: "reframe_mind_reading",
    category: "reframe",
    name: "Mind reading",
    prompt: "You're assuming you know what someone else is thinking. What evidence do you actually have? What else could explain it?",
    why: "Most 'they think X about me' is projection of our own fear. Asking for evidence breaks the loop.",
  },
  {
    id: "reframe_all_or_nothing",
    category: "reframe",
    name: "All-or-nothing",
    prompt: "You're seeing this as total success or total failure. What's the partial truth between the two extremes?",
    why: "Black-and-white thinking strips out the 80% of life that's grey. Naming a middle removes the cliff.",
  },
  {
    id: "reframe_should",
    category: "reframe",
    name: "Should statements",
    prompt: "You're measuring yourself against an imagined rule. Whose voice is the 'should' in? Is it actually yours?",
    why: "Most shoulds are inherited. Once you see whose they are, you can choose whether to keep them.",
  },
  {
    id: "ground_5_4_3_2_1",
    category: "grounding",
    name: "5-4-3-2-1",
    prompt: "Name 5 things you can see, 4 you can hear, 3 you can touch, 2 you can smell, 1 you can taste.",
    why: "Anxiety lives in the future. The senses live only in the present. Each name pulls you back.",
  },
  {
    id: "ground_feet_floor",
    category: "grounding",
    name: "Feet on the floor",
    prompt: "Press both feet firmly into the floor for 30 seconds. Notice the pressure, the temperature, the contact.",
    why: "The body cannot be anywhere except where it is. When the mind is racing, the body is the anchor.",
  },
];

const BODY_TOOLS = [
  {
    category: "walk",
    name: "Five-minute walk",
    prompt:
      "Step outside, leave your phone, walk for five minutes. Turn around. Walk back.",
    why: "Short walks regulate the nervous system and reset attention. The point is the doing, not the distance.",
  },
  {
    category: "stretch",
    name: "Doorway stretch",
    prompt:
      "Stand in a doorway. Place forearms on the frame at shoulder height. Step one foot forward and lean gently. Hold for 30 seconds.",
    why: "Opens the chest and shoulders, which collapse from sitting. Two minutes daily compounds.",
  },
  {
    category: "stretch",
    name: "Hip flexor stretch",
    prompt:
      "Kneel on one knee, other foot forward. Push hips slightly forward. Hold 30 seconds each side.",
    why: "Sitting shortens the hip flexors. Lengthening them daily protects the lower back.",
  },
  {
    category: "strength",
    name: "Wall sit",
    prompt:
      "Back against a wall, slide down until thighs are parallel to the floor. Hold for 30 seconds.",
    why: "Builds leg strength with no equipment. Good legs make every other movement easier.",
  },
  {
    category: "strength",
    name: "Ten push-ups",
    prompt:
      "Ten push-ups, on knees if needed, full range of motion. Stop one rep before failure.",
    why: "Push-ups train the upper body and core in one move. Quality beats quantity every time.",
  },
  {
    category: "breath",
    name: "Two-minute breath",
    prompt:
      "Sit upright. Breathe in for 4, out for 6. For two minutes. That's it.",
    why: "Slower exhales than inhales tell the body it's safe. Cheaper than meditation, just as useful.",
  },
];

const PRINCIPLES = [
  {
    title: "Decisions create destiny",
    body: "A real decision is one you take immediate action on. Anything less is a preference.",
  },
  {
    title: "Pain and pleasure",
    body: "Behaviour follows what we link to pain and what we link to pleasure. Change the link, change the behaviour.",
  },
  {
    title: "Action over awareness",
    body: "Insight without action is entertainment. The smallest move beats the biggest realisation.",
  },
  {
    title: "Identity follows action",
    body: "You become the person who does the things, not the person who plans to.",
  },
];

const CATEGORY_TITLES: Record<string, string> = {
  breath: "Breath",
  reframe: "Reframes",
  grounding: "Grounding",
};

const CATEGORY_ORDER = ["breath", "reframe", "grounding"];

export default function ResourcesPage() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: RESOURCES_NUDGES.filter((n) => n.category === cat),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-ink-primary">Resources</h1>
        <p className="mt-1 text-sm text-ink-muted">Things to return to</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-medium text-ink-primary">For your mind</h2>
        {grouped.map(({ cat, items }) => (
          <div key={cat} className="space-y-4">
            <h3 className="text-base font-medium text-ink-secondary">
              {CATEGORY_TITLES[cat]}
            </h3>
            {items.map((n) => (
              <Card key={n.id}>
                <div className="text-xs uppercase tracking-wide text-ink-muted">
                  {n.category}
                </div>
                <h4 className="text-lg font-medium text-ink-primary mt-1">{n.name}</h4>
                <p className="text-base text-ink-primary mt-3">{n.prompt}</p>
                <p className="text-sm text-ink-secondary mt-3">
                  <span className="text-xs uppercase tracking-wide text-ink-muted mr-2">Why</span>
                  {n.why}
                </p>
              </Card>
            ))}
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-medium text-ink-primary">For your body</h2>
          <p className="text-sm text-ink-muted mb-4">
            Simple movements you can do anywhere.
          </p>
        </div>
        {BODY_TOOLS.map((t) => (
          <Card key={t.name}>
            <div className="text-xs uppercase tracking-wide text-ink-muted">
              {t.category}
            </div>
            <h4 className="text-lg font-medium text-ink-primary mt-1">{t.name}</h4>
            <p className="text-base text-ink-primary mt-3">{t.prompt}</p>
            <p className="text-sm text-ink-secondary mt-3">
              <span className="text-xs uppercase tracking-wide text-ink-muted mr-2">Why</span>
              {t.why}
            </p>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium text-ink-primary">Principles</h2>
        {PRINCIPLES.map((p) => (
          <Card key={p.title} variant="quiet">
            <h3 className="text-lg font-medium text-ink-primary">{p.title}</h3>
            <p className="text-base text-ink-secondary mt-3">{p.body}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
