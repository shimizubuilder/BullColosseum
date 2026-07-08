# Charge Arena — Black Bull Bloodline

A crypto/CT-flavored PvP bull-charging game. You play **Ansem, the Charger**: roam a
top-down open world, talk in global chat, train your Bull, then fight in the **Colosseum**
through the real-time **Charge Clash** duel — no retreat, only charge.

> **"No Retreat. Only Charge."**

## Tech stack

A greenfield rebuild toward an **isometric pixel-art** game.

- **Frontend:** Vue 3 + Vite + TypeScript + PixiJS (renderer)
- **Backend:** PHP + MySQL (JSON API)
- **Offline mode:** a `localStorage` fallback keeps the game playable without a server

See **[SETUP.md](SETUP.md)** to install and run it.

## Features

- **Login and avatar** — username, avatar (Ansem plus color variants), and a Bull element and name, persisted to the database.
- **Top-down open world** — walk with WASD or click-to-move; enter the Colosseum, Stable, Shop, Vault, and Leaderboard buildings. The camera follows your character.
- **Global chat** — polled from MySQL, with a local fallback when offline.
- **Multiplayer presence** — other players walk around in real time (position heartbeats), an online counter, and ambient NPC handlers so the city never feels empty.
- **Colosseum** — a tiered arena with animated torches where duels take place.
- **Spectate live** — watch AI-vs-AI duels between top players, with a live badge, viewer count, floating emotes, and auto-advance to the next match.
- **Betting** — while spectating, stake gold on fighter A or B (25–200) for a 1.9x payout on a correct pick.
- **Tournaments** — an 8-fighter single-elimination bracket (quarterfinal → semifinal → final) with a prize pool; join with an entry fee and win it all to take the pool. Practice, Daily (pool 600), and Weekly (pool 1800) modes with reset countdowns.
- **Profile and Solana wallet** — connect Phantom or paste an address (stored as unverified); prove ownership by signing a challenge nonce, verified with Ed25519 (Web Crypto), to become linked. The username can be changed once.
- **Breeding, traits, and mythic** — in the Breeding Lab, combine two Bulls into a new calf. Traits can be inherited or mutated: Golden Horn, Rage, and Alpha (rare); Swift, Ironhide, and Bloodline (common). There is a small chance of a Mythic Bull (×1.35 stats).
- **King of the Arena** — only one King exists at a time. Beat the King in the Colosseum to take the throne; the longer you hold it, the larger the bounty paid out when you are dethroned.
- **Ranked divisions** — Bronze → Silver → Gold → Platinum → Diamond → Gladiator → Emperor, by rating.
- **Farm Island** — reached through a portal from the main world. Buy plots with gold to claim a pen that stores Bulls (capacity starts at 2, extendable). A Bull must be withdrawn from its pen to fight, and resting Bulls earn gold passively (capped at 8 hours).
- **Charge Clash duel** — three phases over roughly 15 seconds: Lock Horns (timing) → Push (mash) → Final Charge (QTE knockout).
- **Five Bull tiers** — Calf → Young Bull → Bull → Alpha Bull → The Black Bull, each with a stronger silhouette (horns, armor, aura, glowing eyes).
- **Progression** — wins grant XP, gold, and rating; level and tier up; train with gold.
- **Seasonal leaderboard** — the top 100 by rating from MySQL.
- **Gear Shop and Gold Vault** — cosmetic gear (Legendary items gated by tokens) and a simulated Gold → $CHARGE conversion.
- Balance: timing windows widen with tier but stay skill-based — not pay-to-win.

## Controls

| Action | Input |
|---|---|
| Move | `WASD` / arrow keys / click a spot |
| Enter a building | approach, then `E` or tap the building |
| Duel (tap) | `Space` / click / tap |

## Project structure

```
src/domain/     framework-free game rules: stats, progression, combat, economy, breeding, quests
src/engine/     PixiJS renderer, isometric math, scenes
src/bridge/     the seam between the Vue UI and the Pixi canvas
src/ui/         Vue components: menus, HUD, overlays
tests/          Vitest unit tests for the domain layer
api/            PHP + MySQL JSON API
db/schema.sql   database schema and seed data
```

## Database

`db/schema.sql` defines the `players`, `bulls`, `matches`, and `chat_messages` tables,
a `leaderboard` view, and seed bots. Import it via phpMyAdmin or the CLI (see SETUP.md).

## Status

The game is being rebuilt on the new stack. The framework-free domain layer (stats,
combat, economy, breeding, quests) is implemented and unit-tested; the isometric
renderer and the Vue UI are under active development.
