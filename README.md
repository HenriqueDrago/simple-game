# Simple Game

A turn-based combat and resource-management game built with React and Vite. Both players take turns executing actions, managing resource pools, and countering their opponent. A match ends when either player's health or max health reaches 0, ending in victory, defeat, or a draw.

[Image: Game Setup Screen]

Simple Game Expanded can be played at: https://simple-game-hd.vercel.app/

---

## Pre-Battle Setup & Attribute Allocation

Before starting a match, players configure battle settings during the setup phase:

* **Attribute Allocation:** Players have 10 base attribute points to distribute freely between two core attributes:
  * **Str (Strength):** Increases the damage dealt by certain offensive actions.
  * **Def (Defense):** Decreases the physical damage taken.
* **Stat Distribution Modes:** Stat points can be allocated manually or assigned through preset distribution modes:
  * **Custom:** Manual point distribution, with an optional random roller.
  * **Challenge:** Assigns the preset attribute distribution used by the controller in Progression Mode.
  * **Balanced:** Splits points evenly between Str and Def.
  * **Full Str / Full Def:** Assigns all 10 available points into a single attribute.
* **Match Configuration:** Players choose who takes the first turn (Player One, Player Two, or Random) and set the controller for each entity (Human manual control or autonomous AI archetypes).

---

## Battle Structure

A basic round consists of the following phases, though rounds can be extended with additional transitional phases:

* **Round Start:** A transitional phase at the start of a round.
* **Turn:** An active player's sequence, subdivided into three subphases:
  * **Upkeep:** Applies turn-start triggers, states, and resource conversions.
  * **Plan:** The player executes available actions and manages combat interactions.
  * **Commit:** Applies turn-end effects, resource decays, and damage over time.
* **Round End:** A transitional phase concluding the active round.

---

## Resources

Abilities that consume resources draw from **Mitigation Resources**, **Free Resources**, and **Limited Resources** in that order, while resource restoration occurs in reverse:

* **Mitigation Resources:** Temporary defensive pools that absorb incoming physical and piercing damage before health is lost.
* **Free Resources:** Uncapped pools used to scale damage, fuel actions, or trigger mechanical effects.
* **Limited Resources:** Primary capacity pools (health and mana) with non-fixed caps that route overflow recovery into secondary pools.
* **Fixed Resources:** Percentage-based meters with strict limits that track mechanic progress, trigger state transformations, or modify damage parameters.
* **Ranked Resources:** Tier-based counters that scale the strength of specific effects.

---

## Progression Mode

- **Mundane:** A tutorial enemy utilizing basic Attack, Guard, and Heal actions.
- **Warlock:** Focuses on Special Attack damage scaling based on mana imbalance.
- **Bloodknight:** Uses Sacrifice and Mana Bleed to convert health into physical damage and delayed healing.
- **Paladin:** Generates mitigation shields and builds divine energy to scale attributes and restore resources.
- **Shadow Sorcerer:** Enters Umbral Core to manage self-damaging burn loops and restoration triggers.
- **Cyborg:** Fires laser attacks while managing heat buildup and dynamo charge.
- **Maestro:** Manipulates Sonority through offensive and defensive actions, using Babel and The Sound of Silence to invert its polarity.
- **Augur:** Sockets runes into an array through actions and detonates them with Curse.
- **Voyager:** Assigns colored stars to resolve Starfall effects.
- **Lunatic:** Configures elemental crystal combinations and adapts actions according to the mirrored moon phase.

---

## Controls & Shortcuts

* **Middle Mouse Click (Wheel):** Click on any term or UI element to open a tooltip; clicking highlighted terms inside opens nested tooltips.
* **Hover Over Actions:** Simulates the immediate outcome of an action.
* **Shift (Hold):** Simulates end-of-turn commit effects and upcoming starfall resolutions.
* **Spacebar:** Pauses or resumes automatic turn progression timers.

---

## Getting Started

### Prerequisites

* Node.js (v18 or higher recommended)
* npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-folder>
```

2. Install dependencies:
```bash
npm install
```


3. Start the local development server:
```bash
npm run dev
```