from sqlalchemy.orm import Session
from .db import SessionLocal
from .models import Program, ProgramVersion, Day, Step

PROGRAM = {"name": "Personal Power II", "version": 1, "is_active": True}

DAYS = [
    {
        "day_number": 1,
        "title": "The Key to Personal Power",
        "steps": [
            {
                "step_number": 1,
                "step_type": "info",
                "prompt": "The Key to Personal Power",
                "body": (
                    "**The Ultimate Success Formula:**\n\n"
                    "- Know your outcome.\n"
                    "- Get yourself to take action by *deciding* to do so.\n"
                    "- Notice what you're getting from your actions.\n"
                    "- If what you're doing is not working, change your approach.\n\n"
                    "To save time and energy, use *role models* to accelerate your success: "
                    "find someone who's already getting the results you want, find out what "
                    "that person is doing, do the same things, and you'll get the same results.\n\n"
                    "*It's impossible to fail as long as you learn something from what you do.*"
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
            {
                "step_number": 2,
                "step_type": "list",
                "prompt": "Two decisions I've been putting off which, when I make them now, will change my life.",
                "field_key": "decisions",
                "helper_text": None,
                "body": None,
                "config": {"slot_count": 2, "multiline": True},
            },
            {
                "step_number": 3,
                "step_type": "actions_list",
                "prompt": "Three simple things I can do immediately that will be consistent with my two new decisions.",
                "helper_text": (
                    "Now that you've made a real decision, you must take immediate action. "
                    "Write down the first few steps. For example: if you decided to stop smoking — "
                    "what could you do with the cigarettes that are in the house right now? "
                    "Who could you call? What could you commit to? What letter could you write? "
                    "What could you do instead of your old behaviour?"
                ),
                "field_key": None,
                "body": None,
                "config": {"min_count": 3},
            },
            {
                "step_number": 4,
                "step_type": "action_complete",
                "prompt": "Mark at least one action as complete to finish Day 1.",
                "body": "*Never leave the site of setting a goal or making a decision without taking some action toward its attainment.*",
                "field_key": None,
                "helper_text": None,
                "config": {"min_completed": 1, "reinforcement": "Good. This is how you take control."},
            },
            {
                "step_number": 5,
                "step_type": "info",
                "prompt": "Day 1 complete.",
                "body": None,
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
        ],
    },
    {
        "day_number": 2,
        "title": "The Controlling Force That Directs Your Life",
        "steps": [
            {
                "step_number": 1,
                "step_type": "info",
                "prompt": "The Controlling Force That Directs Your Life",
                "body": (
                    "Ultimately, everything we do in our lives is driven by our fundamental need "
                    "to avoid pain and our desire to gain pleasure; both are biologically driven "
                    "and constitute a controlling force in our lives.\n\n"
                    "**We will do far more to avoid pain than we will to gain pleasure.**\n\n"
                    "At any moment in time, whatever you focus your attention on is what is most "
                    "real to you. So if you want to change your behaviour, you must focus your "
                    "attention on:\n\n"
                    "- how *not* changing your behaviour will be more painful than changing it\n"
                    "- how changing will bring you measurable and immediate pleasure\n\n"
                    "You must change what you link pain and pleasure to in order to change your behaviour.\n\n"
                    "*Use pain and pleasure instead of letting pain and pleasure use you.*\n\n"
                    "To take control of your life, you must take control of the force of decision. "
                    "**The power to change anything in your life is born the moment you make a "
                    "real decision — which by definition is something you take immediate action upon.**"
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
            {
                "step_number": 2,
                "step_type": "actions_list",
                "prompt": "Four new actions I know I should take now.",
                "field_key": None,
                "helper_text": None,
                "body": None,
                "config": {"min_count": 4},
            },
            {
                "step_number": 3,
                "step_type": "multi_line",
                "prompt": "The pain I've associated with these actions in the past.",
                "field_key": "pain",
                "helper_text": None,
                "body": None,
                "config": {},
            },
            {
                "step_number": 4,
                "step_type": "multi_line",
                "prompt": "The pleasure I took from not following through in the past.",
                "field_key": "pleasure",
                "helper_text": None,
                "body": None,
                "config": {},
            },
            {
                "step_number": 5,
                "step_type": "multi_line",
                "prompt": "What it will cost me if I don't follow through now. What will I miss out on? What will I lose?",
                "field_key": "cost",
                "helper_text": None,
                "body": None,
                "config": {},
            },
            {
                "step_number": 6,
                "step_type": "multi_line",
                "prompt": "The benefits I'll gain by taking action in each of these areas now.",
                "helper_text": (
                    "Now begin to associate pleasure with taking action. What are all the benefits "
                    "you'll gain by taking action in each of these areas now? How will it enhance "
                    "your life? How will it create greater joy, happiness, success, freedom or pride?"
                ),
                "field_key": "benefits",
                "body": None,
                "config": {},
            },
            {
                "step_number": 7,
                "step_type": "action_complete",
                "prompt": "Mark at least one action as complete to finish Day 2.",
                "body": None,
                "field_key": None,
                "helper_text": None,
                "config": {"min_completed": 1, "reinforcement": "Good. This is how you take control."},
            },
            {
                "step_number": 8,
                "step_type": "info",
                "prompt": "Day 2 complete.",
                "body": None,
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
        ],
    },
    {
        "day_number": 3,
        "title": "Taking Control: The First Step",
        "steps": [
            {
                "step_number": 1,
                "step_type": "info",
                "prompt": "Taking Control: The First Step",
                "body": (
                    "What drives our lives is our neuro-associations: whatever pleasure or pain "
                    "we associate or \"link\" to a situation in our nervous system is going to "
                    "determine our behaviour.\n\n"
                    "**If we want to change our lives, we must change our neuro-associations.**\n\n"
                    "The science you'll learn in this program is **Neuro-Associative Conditioning (NAC)**. "
                    "It allows you to link massive pleasure to tasks you've been putting off but need "
                    "to take action on today, and link pain to behaviours you're currently indulging "
                    "in but need to stop. It gives you a way to take direct control of all your "
                    "behaviours and emotions through the power of reinforcement, not discipline.\n\n"
                    "Your neuro-associations control your level of motivation.\n\n"
                    "Every action you take has an effect on your destiny. Everything in life has "
                    "four parts: every thought or action is a *cause* set in motion; every cause "
                    "has an *effect* or *result*; results stack up to take our lives in a particular "
                    "*direction*; and every direction has an ultimate *destination* or *destiny*."
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
            {
                "step_number": 2,
                "step_type": "list",
                "prompt": "Three neuro-associations I've made in the past that have shaped my destiny positively.",
                "field_key": "positive_associations",
                "helper_text": None,
                "body": None,
                "config": {"slot_count": 3, "multiline": True},
            },
            {
                "step_number": 3,
                "step_type": "list",
                "prompt": "Three neuro-associations that have disempowered me until now.",
                "field_key": "disempowering_associations",
                "helper_text": None,
                "body": None,
                "config": {"slot_count": 3, "multiline": True},
            },
            {
                "step_number": 4,
                "step_type": "multi_line",
                "prompt": "What is your ultimate destiny? What do you want your life to be about?",
                "helper_text": (
                    "Few people know precisely how their lives will turn out, but we can decide "
                    "in advance the kind of person we want to become and how we want to live. "
                    "Having this bigger picture pulls us through short-term tough times and keeps "
                    "things in perspective."
                ),
                "field_key": "identity_statement",
                "body": None,
                "config": {},
            },
            {
                "step_number": 5,
                "step_type": "info",
                "prompt": "Day 3 complete.",
                "body": (
                    "*Decide you will change these today.*\n\n"
                    "*Simple awareness can be curative. It can break the pattern of allowing our "
                    "unconscious conditioning to control us.*"
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
        ],
    },
    {
        "day_number": 4,
        "title": "Neuro-Associative Conditioning",
        "steps": [
            {
                "step_number": 1,
                "step_type": "info",
                "prompt": "Neuro-Associative Conditioning",
                "body": (
                    "Whatever you link massive pain to, you'll move away from. Whatever you link "
                    "massive pleasure to, you'll move toward. The science of NAC is the discipline "
                    "of choosing those links on purpose, instead of letting them be set for you.\n\n"
                    "Today you'll work through three patterns or behaviours you want to change. "
                    "For each, you'll generate the reasons you *must* change, the reasons you *can* "
                    "change, the pattern interrupts that break the old neuro-association, and the "
                    "new association you want to install. The point isn't insight — it's intensity. "
                    "Write more than feels comfortable. The list is the leverage."
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
            {
                "step_number": 2,
                "step_type": "list",
                "prompt": "Pattern 1 — Ten reasons you absolutely *must* change this.",
                "field_key": "nac_must_change_1",
                "helper_text": "Pile up the pain. What does it cost you if this stays the same?",
                "body": None,
                "config": {"slot_count": 10, "multiline": True},
            },
            {
                "step_number": 3,
                "step_type": "list",
                "prompt": "Pattern 1 — Ten reasons you absolutely *can* change this.",
                "field_key": "nac_can_change_1",
                "helper_text": "Stack the evidence. Why is it possible — for you, now?",
                "body": None,
                "config": {"slot_count": 10, "multiline": True},
            },
            {
                "step_number": 4,
                "step_type": "list",
                "prompt": "Pattern 2 — Ten reasons you absolutely *must* change this.",
                "field_key": "nac_must_change_2",
                "helper_text": None,
                "body": None,
                "config": {"slot_count": 10, "multiline": True},
            },
            {
                "step_number": 5,
                "step_type": "list",
                "prompt": "Pattern 2 — Ten reasons you absolutely *can* change this.",
                "field_key": "nac_can_change_2",
                "helper_text": None,
                "body": None,
                "config": {"slot_count": 10, "multiline": True},
            },
            {
                "step_number": 6,
                "step_type": "list",
                "prompt": "Pattern 3 — Ten reasons you absolutely *must* change this.",
                "field_key": "nac_must_change_3",
                "helper_text": None,
                "body": None,
                "config": {"slot_count": 10, "multiline": True},
            },
            {
                "step_number": 7,
                "step_type": "list",
                "prompt": "Pattern 3 — Ten reasons you absolutely *can* change this.",
                "field_key": "nac_can_change_3",
                "helper_text": None,
                "body": None,
                "config": {"slot_count": 10, "multiline": True},
            },
            {
                "step_number": 8,
                "step_type": "list",
                "prompt": "Pattern 1 — Five pattern interrupts you'll use the next time the old behaviour shows up.",
                "field_key": "nac_pattern_interrupts_1",
                "helper_text": (
                    "A pattern interrupt is anything that breaks the neuro-association in the moment — "
                    "a physical movement, a different question, a phone call, a change of room. "
                    "Five small concrete options are better than one perfect plan."
                ),
                "body": None,
                "config": {"slot_count": 5, "multiline": True},
            },
            {
                "step_number": 9,
                "step_type": "list",
                "prompt": "Pattern 2 — Five pattern interrupts.",
                "field_key": "nac_pattern_interrupts_2",
                "helper_text": None,
                "body": None,
                "config": {"slot_count": 5, "multiline": True},
            },
            {
                "step_number": 10,
                "step_type": "list",
                "prompt": "Pattern 3 — Five pattern interrupts.",
                "field_key": "nac_pattern_interrupts_3",
                "helper_text": None,
                "body": None,
                "config": {"slot_count": 5, "multiline": True},
            },
            {
                "step_number": 11,
                "step_type": "list",
                "prompt": "Three new associations you want to install — what you'll link to pleasure from now on.",
                "field_key": "nac_new_associations",
                "helper_text": (
                    "These are the new behaviours that replace the old patterns. Be specific. "
                    "If 'eat well' is one, what does that look like Monday morning?"
                ),
                "body": None,
                "config": {"slot_count": 3, "multiline": True},
            },
            {
                "step_number": 12,
                "step_type": "info",
                "prompt": "Conditioning, not deciding.",
                "body": (
                    "Decisions don't change behaviour. *Conditioned* responses do. Run the new "
                    "association through your nervous system enough times — with intensity, "
                    "repetition, and emotion — and the new behaviour becomes automatic.\n\n"
                    "The lists you just wrote are the raw material. Read them tomorrow. Read them "
                    "the day after. Read them when the old pattern starts to surface."
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
            {
                "step_number": 13,
                "step_type": "info",
                "prompt": "Day 4 complete.",
                "body": None,
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
        ],
    },
    {
        "day_number": 5,
        "title": "State and Physiology",
        "steps": [
            {
                "step_number": 1,
                "step_type": "info",
                "prompt": "State controls behaviour.",
                "body": (
                    "Every behaviour you've ever produced — every action you've taken, every "
                    "result you've created — happened in a *state*. State is the sum of what you're "
                    "feeling, thinking, and doing in any given moment. Change the state, and the "
                    "behaviour available to you changes too.\n\n"
                    "You can't reliably will yourself into action from a depleted state. But you "
                    "can reliably *change your state* — and the action then becomes natural."
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
            {
                "step_number": 2,
                "step_type": "info",
                "prompt": "Physiology is the fastest lever.",
                "body": (
                    "The two ways to change state are physiology and focus. Physiology is faster "
                    "and more reliable. How you breathe, how you stand, how you move, the "
                    "expression on your face — these are not symptoms of state, they are *causes* "
                    "of it.\n\n"
                    "Sit slumped, breathing shallow, looking at the floor — and try to feel "
                    "powerful. You can't. The body doesn't allow it. Now stand tall, breathe "
                    "deep, look up — and try to feel hopeless. Same answer.\n\n"
                    "If you want a different state, take a different physiology. Immediately."
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
            {
                "step_number": 3,
                "step_type": "info",
                "prompt": "Today's experiment.",
                "body": (
                    "Choose one person or situation in your life right now where you'd like a "
                    "different result. The next time you're in front of them — or about to be — "
                    "deliberately change your physiology *first*. Stand differently. Breathe "
                    "differently. Hold your face differently. Then notice what happens.\n\n"
                    "You're not pretending. You're choosing the state from which the interaction "
                    "will run."
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
            {
                "step_number": 4,
                "step_type": "multi_line",
                "prompt": "Who or what is your experiment subject today?",
                "field_key": "state_experiment_subject",
                "helper_text": (
                    "A person, a meeting, a difficult conversation, a recurring task you avoid. "
                    "Be specific enough that you'll recognise the moment when it arrives."
                ),
                "body": None,
                "config": {},
            },
            {
                "step_number": 5,
                "step_type": "info",
                "prompt": "Day 5 complete.",
                "body": "*Change your physiology. Change your state. Change your life.*",
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
        ],
    },
    {
        "day_number": 6,
        "title": "Biomarkers of a Resourceful State",
        "steps": [
            {
                "step_number": 1,
                "step_type": "info",
                "prompt": "Mapping your best state.",
                "body": (
                    "If state is something you can choose, then you need a clear map of the state "
                    "you want to choose into. Think of a recent moment where you were at your most "
                    "resourceful — confident, present, capable, calm. That state had specific "
                    "physical markers.\n\n"
                    "Today you'll write them down. The clearer the map, the easier the return "
                    "trip. These are the *biomarkers* you'll use the next time you need to change "
                    "state on purpose."
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
            {
                "step_number": 2,
                "step_type": "list",
                "prompt": "Ten biomarkers of you at your best.",
                "field_key": "state_biomarkers",
                "helper_text": (
                    "Posture, breath rate and depth, where your eyes go, the angle of your "
                    "shoulders, the rhythm of your speech, where your weight sits, what your "
                    "hands do, your facial expression, your pace, your temperature. The more "
                    "physical and specific, the more useful."
                ),
                "body": None,
                "config": {"slot_count": 10, "multiline": True},
            },
            {
                "step_number": 3,
                "step_type": "info",
                "prompt": "Day 6 complete.",
                "body": (
                    "*The next time you need that state, don't try to feel your way there. "
                    "Run the physiology and the state will follow.*"
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
        ],
    },
    {
        "day_number": 7,
        "title": "Apply State Control",
        "steps": [
            {
                "step_number": 1,
                "step_type": "info",
                "prompt": "From map to use.",
                "body": (
                    "You know what to change in your state. You know how to change it. Today is "
                    "the day you do it on purpose, in the situations where you need it most.\n\n"
                    "Not all situations. Three. Pick three places this week where deliberately "
                    "running a different state would change the outcome. Then take one small action "
                    "in each one — and notice what changes."
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
            {
                "step_number": 2,
                "step_type": "actions_list",
                "prompt": "Three small actions where you'll deliberately change state first.",
                "helper_text": (
                    "Be specific. 'Have the conversation with Sam at lunch on Thursday after a "
                    "two-minute walk' beats 'communicate better.'"
                ),
                "field_key": None,
                "body": None,
                "config": {"min_count": 3},
            },
            {
                "step_number": 3,
                "step_type": "action_complete",
                "prompt": "Mark at least one as complete to finish Day 7.",
                "body": None,
                "field_key": None,
                "helper_text": None,
                "config": {"min_completed": 1, "reinforcement": "Good. State chosen, action taken."},
            },
            {
                "step_number": 4,
                "step_type": "info",
                "prompt": "Day 7 complete.",
                "body": None,
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
        ],
    },
    {
        "day_number": 8,
        "title": "Focus — Morning Power Questions",
        "steps": [
            {
                "step_number": 1,
                "step_type": "info",
                "prompt": "Whatever you focus on, you feel.",
                "body": (
                    "Focus is the second great lever of state. Where attention goes, energy flows. "
                    "Most people focus on what's missing, what's wrong, what they fear — and then "
                    "wonder why they feel the way they do.\n\n"
                    "You can't simply tell yourself to focus on better things. But you can ask "
                    "yourself better questions. Questions force the brain to search — and what it "
                    "finds becomes your experience."
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
            {
                "step_number": 2,
                "step_type": "info",
                "prompt": "Morning Power Questions.",
                "body": (
                    "Each morning, before the day takes you, ask yourself a small set of questions "
                    "designed to put you in a resourceful state. Suggestions to draw from:\n\n"
                    "- What am I happy about in my life right now?\n"
                    "- What am I excited about?\n"
                    "- What am I proud of?\n"
                    "- What am I grateful for?\n"
                    "- Who do I love? Who loves me?\n"
                    "- What am I committed to today?\n\n"
                    "Pick five — or write your own. The questions you live with shape the life you "
                    "live."
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
            {
                "step_number": 3,
                "step_type": "list",
                "prompt": "Your five Morning Power Questions.",
                "field_key": "morning_questions",
                "helper_text": (
                    "Choose five you will ask yourself every morning for the next seven days. "
                    "Edit them so they're in your voice."
                ),
                "body": None,
                "config": {"slot_count": 5, "multiline": True},
            },
            {
                "step_number": 4,
                "step_type": "info",
                "prompt": "Day 8 complete.",
                "body": "*Quality questions create a quality life.*",
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
        ],
    },
    {
        "day_number": 9,
        "title": "Values and Rules",
        "steps": [
            {
                "step_number": 1,
                "step_type": "info",
                "prompt": "Values: the compass underneath behaviour.",
                "body": (
                    "Values are the emotional states you spend your life moving toward, and the "
                    "states you spend your life moving away from. Most people have never written "
                    "theirs down — and so they live by inherited values, not chosen ones.\n\n"
                    "Today you'll do two things. List the states you want to feel as much as "
                    "possible (your *toward* values), and the states you'll do almost anything "
                    "to avoid (your *away-from* values). Both shape every choice you make."
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
            {
                "step_number": 2,
                "step_type": "list",
                "prompt": "Up to ten emotional states you want to move toward.",
                "field_key": "values_toward",
                "helper_text": (
                    "Examples: love, freedom, contribution, growth, peace, mastery, presence, "
                    "playfulness, integrity. Use your own words."
                ),
                "body": None,
                "config": {"slot_count": 10, "multiline": True},
            },
            {
                "step_number": 3,
                "step_type": "list",
                "prompt": "Up to ten emotional states you want to move away from.",
                "field_key": "values_away_from",
                "helper_text": (
                    "Examples: rejection, failure, boredom, loneliness, humiliation. The honest "
                    "list, not the polite one."
                ),
                "body": None,
                "config": {"slot_count": 10, "multiline": True},
            },
            {
                "step_number": 4,
                "step_type": "info",
                "prompt": "Rules: the conditions you've placed on your values.",
                "body": (
                    "A rule is your personal answer to: *what has to happen for me to feel this?* "
                    "If 'love' is a toward value, your rules might say love requires a partner who "
                    "never lets you down — making love almost impossible. Or your rules might say "
                    "you feel love any time you're truly present with someone you care about — "
                    "making love available daily.\n\n"
                    "Rules are usually invisible until you write them down. Once you see them, you "
                    "can keep them, change them, or replace them."
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
            {
                "step_number": 5,
                "step_type": "multi_line",
                "prompt": "What are your current rules for the toward values? What has to happen for you to feel them?",
                "field_key": "rules_toward",
                "helper_text": None,
                "body": None,
                "config": {},
            },
            {
                "step_number": 6,
                "step_type": "multi_line",
                "prompt": "What are your current rules for the away-from values? What triggers them?",
                "field_key": "rules_away_from",
                "helper_text": None,
                "body": None,
                "config": {},
            },
            {
                "step_number": 7,
                "step_type": "list",
                "prompt": "Up to ten rules you want to change.",
                "field_key": "rules_to_change",
                "helper_text": (
                    "Phrase the new rule. 'I feel loved any time I'm truly present.' 'I feel "
                    "successful any time I follow through on something hard.' Make the toward "
                    "values easier and the away-from triggers fewer."
                ),
                "body": None,
                "config": {"slot_count": 10, "multiline": True},
            },
            {
                "step_number": 8,
                "step_type": "info",
                "prompt": "Day 9 complete.",
                "body": "*Rewrite the rules. The values follow.*",
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
        ],
    },
    {
        "day_number": 10,
        "title": "The Dickens Pattern",
        "steps": [
            {
                "step_number": 1,
                "step_type": "info",
                "prompt": "The Dickens Pattern.",
                "body": (
                    "In *A Christmas Carol*, three ghosts force Scrooge to confront his past, his "
                    "present, and his future. He sees what his beliefs have already cost him, and "
                    "what they will cost him if nothing changes — and so he changes.\n\n"
                    "Today you'll do the same with the beliefs that have been holding you back. "
                    "Not all your beliefs — the ones you've been reluctant to look at directly. "
                    "List them, then walk them through the same three ghosts. The pattern works "
                    "because the brain takes the future seriously when the cost becomes real."
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
            {
                "step_number": 2,
                "step_type": "list",
                "prompt": "Five limiting beliefs you're ready to change.",
                "field_key": "beliefs_to_change",
                "helper_text": (
                    "Beliefs about money, relationships, your body, your worth, your past, what's "
                    "possible. Write the actual sentence you tell yourself — even if you're "
                    "embarrassed by it."
                ),
                "body": None,
                "config": {"slot_count": 5, "multiline": True},
            },
            {
                "step_number": 3,
                "step_type": "multi_line",
                "prompt": "If you don't change these beliefs, what will it cost you in 5, 10, and 20 years?",
                "field_key": "dickens_past_cost",
                "helper_text": (
                    "Be specific and emotional. Health, relationships, money, identity, the "
                    "regret you'll feel. Don't write what should hurt — write what will."
                ),
                "body": None,
                "config": {},
            },
            {
                "step_number": 4,
                "step_type": "list",
                "prompt": "Five new, empowering beliefs to install in their place.",
                "field_key": "new_beliefs",
                "helper_text": (
                    "One per old belief. Phrase each in the present tense as if it's already true. "
                    "'I am the kind of person who finishes what I start.' 'My body responds to how "
                    "I treat it.'"
                ),
                "body": None,
                "config": {"slot_count": 5, "multiline": True},
            },
            {
                "step_number": 5,
                "step_type": "multi_line",
                "prompt": "If you adopt these new beliefs now, what will you gain in 5, 10, and 20 years?",
                "field_key": "dickens_future_gain",
                "helper_text": (
                    "Health, relationships, work, the kind of person you'll be. The future is "
                    "downstream of the beliefs you carry today."
                ),
                "body": None,
                "config": {},
            },
            {
                "step_number": 6,
                "step_type": "multi_line",
                "prompt": "How will these new beliefs improve your quality of life starting today?",
                "field_key": "new_beliefs_quality_of_life",
                "helper_text": "Make it tangible. What changes in your week, this week?",
                "body": None,
                "config": {},
            },
            {
                "step_number": 7,
                "step_type": "info",
                "prompt": "Program complete.",
                "body": (
                    "*You've reached the end of Personal Power.*\n\n"
                    "*The work doesn't end here — it changes shape. The beliefs you carry, the "
                    "rules you live by, the state you choose, and the actions you condition into "
                    "yourself are now yours to keep working with. Identity follows action. "
                    "Keep showing up.*"
                ),
                "field_key": None,
                "helper_text": None,
                "config": {},
            },
        ],
    },
]

def seed(db: Session):
    # Upsert program
    program = db.query(Program).filter(Program.name == PROGRAM["name"]).first()
    if not program:
        program = Program(name=PROGRAM["name"])
        db.add(program)
        db.commit()
        db.refresh(program)
    # Deactivate any previously active version
    db.query(ProgramVersion).filter(ProgramVersion.program_id == program.id, ProgramVersion.is_active == True).update({"is_active": False})
    # Upsert active version
    version = db.query(ProgramVersion).filter(ProgramVersion.program_id == program.id, ProgramVersion.version == PROGRAM["version"]).first()
    if not version:
        version = ProgramVersion(program_id=program.id, version=PROGRAM["version"], is_active=PROGRAM["is_active"])
        db.add(version)
        db.commit()
        db.refresh(version)
    else:
        version.is_active = PROGRAM["is_active"]
        db.commit()
    # Upsert days
    for day_data in DAYS:
        day = db.query(Day).filter(Day.program_version_id == version.id, Day.day_number == day_data["day_number"]).first()
        if not day:
            day = Day(program_version_id=version.id, day_number=day_data["day_number"], title=day_data["title"])
            db.add(day)
            db.commit()
            db.refresh(day)
        else:
            day.title = day_data["title"]
            db.commit()
        # Upsert steps
        for step_data in day_data["steps"]:
            step = db.query(Step).filter(Step.day_id == day.id, Step.step_number == step_data["step_number"]).first()
            if not step:
                step = Step(
                    day_id=day.id,
                    step_number=step_data["step_number"],
                    step_type=step_data["step_type"],
                    prompt=step_data["prompt"],
                    helper_text=step_data["helper_text"],
                    body=step_data["body"],
                    field_key=step_data["field_key"],
                    config=step_data["config"]
                )
                db.add(step)
            else:
                step.step_type = step_data["step_type"]
                step.prompt = step_data["prompt"]
                step.helper_text = step_data["helper_text"]
                step.body = step_data["body"]
                step.field_key = step_data["field_key"]
                step.config = step_data["config"]
            db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed(db)
        print("Seeded successfully")
    finally:
        db.close()