# Business Value Interrogation — Question Bank & Challenge Moves

This is the engine of the skill. Its purpose is to keep redirecting the conversation from *solution* to *value*, and to refuse to accept vague value claims. Draw on these throughout the interview, especially in Round C (Business Value). Use them as needed — not all at once.

## The core reflex

Whenever the user states a benefit, run it through three filters before accepting it:
1. **Quantify** — how much?
2. **Attribute** — for whom, and how many of them, how often?
3. **Evidence** — how do we know? how confident are we?

If a claim survives all three, it's a candidate business outcome. If it doesn't, keep drilling.

## Translating vague claims (the most common ones)

| When they say…            | Ask…                                                                 |
|---------------------------|----------------------------------------------------------------------|
| "It'll save time."        | Whose time? How many minutes, times per day, times how many people? At what loaded cost? |
| "Better user experience." | Better measured how? What does a worse experience cost us today (drop-off, tickets, churn)? |
| "Stay competitive."       | Competitive on what dimension? What do we lose, concretely, if we don't? |
| "Increase engagement."    | Engagement with what, by whom — and does that engagement convert to revenue, retention, or cost saved? |
| "Improve efficiency."     | Efficiency of which process? Current throughput vs. target? Who feels the gain? |
| "Customers want it."      | Which customers? How many asked? Did any leave or refuse to buy without it? |
| "It's strategic."         | Strategic toward which measurable goal? What's the value if the strategy works? |

## The challenge moves

**The "so what?" ladder (value laddering).** Take any stated benefit and ask "so what / what does that get us?" repeatedly until you hit revenue, cost, risk, or retention. Example: "Faster page load" → so what? → "fewer abandoned carts" → so what? → "more completed purchases" → so what? → "+$X revenue/month." The bottom of the ladder is the real business value; the top was just a feature.

**The counterfactual ("do nothing").** "If we never build this, what happens? What does the status quo cost us per month/quarter?" If the answer is "nothing much," the epic may not be worth doing — and that's a valuable finding.

**The proxy check.** "Is the thing you named the actual value, or a means to it?" Activation, clicks, NPS, and adoption are usually *proxies*. Trace them to the business outcome they stand in for.

**The whose-value test.** Separate value to (a) the end user, (b) the economic buyer, and (c) our own business. An epic needs a path from user value to business value. Ask: "If users love this, how does that become revenue, retention, or lower cost for us?"

**The magnitude probe.** "Order of magnitude: is this a $10K, $100K, or $1M opportunity per year? Even a rough band changes whether this is an epic at all." Forces a sizing instinct without false precision.

**The confidence calibration.** For each business outcome ask: "How confident are we this is true — low, medium, high — and what's that based on (data, a few anecdotes, a hunch)?" Low-confidence outcomes are exactly what the MVP should test; label them `[ASSUMPTION]`.

**The evidence pull.** "What do we already have that supports this — data, support tickets, lost-deal notes, a competitor's results, a prior experiment?" Distinguish evidence from hope.

**The reversal (falsifiability).** "What would we expect to see if this hypothesis is *false*? What result would make you kill it?" If nothing could disprove it, it isn't a hypothesis yet.

**The segmentation cut.** When value is claimed for "users," split: "Is it equally valuable to all of them, or concentrated in one segment? Which segment carries most of the value?" This sharpens the `For…` line and the MVP.

**The timing test.** "Why now and not next year? What makes this urgent — a deadline, a market window, a compounding cost?" Distinguishes a real epic from a someday-idea.

## Keeping the user from designing the solution too early

The user will keep describing *how*. Redirect gently but firmly:
- "Hold that solution for a second — if that worked perfectly, what would change for the customer and for us?"
- "Let's treat that as one hypothesis for *how*. First, what's the value we're betting on? Then the solution is just our current best guess at capturing it."
- "If we couldn't build it the way you're imagining, would the value still be worth pursuing another way?"

## When you've circled enough

You can stop interrogating a given claim when it has: a number, a population, a timeframe, a stated confidence level, and either evidence or an explicit `[ASSUMPTION]` tag. Then it's a real business outcome and you can move on — or convert it into a leading indicator if it's an early signal rather than a lagging result.
