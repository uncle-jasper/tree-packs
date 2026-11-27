# tree-packs: notes for Claude

This repo is Dan's pack studio and the shelf the apps install from. Theme packs for **Tree**, **Ginkgo** and the **Tree Obsidian plugin** live here as data files. Sessions in this repo are for designing and publishing packs, nothing else.

## Rules

- **Never touch the app repos from here** (`tree`, `ginkgo`, `tree-obsidian`). A pack must never need an app change. If a pack idea needs an effect the apps don't have, write it under "Effect requests" below and tell Dan. Don't build it here.
- **A pack file is data only.** Colors, names and effect settings, exactly as `FORMAT.md` describes. Never code, CSS, HTML or links.
- **IDs never change.** Pack and theme IDs are what people's saved settings point at. Rename the `name`, never the `id`. Removing a theme from a published pack breaks anyone using it, so retire themes only with Dan's say-so.
- **Run `node scripts/check.mjs` before every commit.** It must say "All good." Treat its warnings as real: text should be 7:1 against the background for long writing, links 4.5:1. Loud themes may stay below 7:1 if Dan accepts it: HUD's red (`#ff5a48`, 6.5:1) is his choice, after comparing it with a brighter `#ff6a56`. Its checker warning is expected.
- **Show before you publish.** Dan decides by looking. Build a preview (an Artifact page with Tree-style windows, like the Rain and Judgment Day study pages) and iterate there. The pack file is written once the look is agreed.
- Dan isn't a programmer. Talk about looks and choices, not code. He has strong aesthetic instincts: treat "this feels off" as a requirement.

## Files

| Path | What |
|---|---|
| `FORMAT.md` | The pack format, version 1. The contract with the apps. Changing it means changing the apps, so don't, without Dan and an app plan. |
| `packs/<id>.tree-pack.json` | One file per pack |
| `index.json` | The shelf listing the apps read. Every pack in `packs/` is listed, with matching name, version, description and swatches. |
| `scripts/check.mjs` | Checks every pack and the index against the format. No dependencies. |
| `drafts/` | Packs in progress. Not on the shelf: `index.json` and the apps never see this folder. Move a pack to `packs/` when Dan approves it. |

## Making a pack

1. Talk it through with Dan: the mood, the source, 2–6 themes, which one is the everyday theme (first opened, and the one most people would write in).
   Also its description: one short line naming what's in it, like Judgment Day's "Cold steel blue, chrome, molten iron and machine vision." Every pack needs one.
2. Preview it as an Artifact page. Every theme shown as a Tree window (editor and preview side by side), with working effects and switches.
3. Iterate until Dan is happy.
4. Write `packs/<id>.tree-pack.json`, add the pack to `index.json` (swatches = each theme's `bg`, in order).
5. `node scripts/check.mjs`. Fix every problem; raise warnings with Dan.
6. Commit on a branch, push, and open a pull request for Dan. Merging it to `main` publishes the pack; the apps see it the next time their Packs screen is opened.

## Updating a pack

Change the file, raise `version` (patch for color tweaks, minor for new themes or effects, major only if Dan accepts that something visibly changes for people), update `index.json` to match, check, and publish the same way. The apps offer the update to anyone who has the pack.

## Design notes from Dan

- **Readable first.** Effects sit behind the text or at the edges, never over the writing. The writing area stays calm.
- **One accent per theme.** Two accent colors in the text got busy (tried in Wet Neon). Put a second color in the light, not the text.
- **Subtle motion.** Rain and light should feel ambient. Dan loves falling rain; he also wanted a way to turn it off for others, which is why motion goes behind a `switch` unless it's part of the theme's identity.
- **The teal shift.** The Rain pack's greys all lean slightly toward sea-grey/teal. Dan liked it; a pack's themes should share a family tint like that.
- Inspired by films and places is fine: palettes and moods. No logos, characters, artwork or quoted dialogue in packs.

## Packs

| Pack | Themes (everyday first in bold) | Effects | Status |
|---|---|---|---|
| Rain `rain` | overcast, **rain**, downpour, wet street, wet neon | falling rain on all five (on for downpour, wet neon); wet neon: crossed magenta and cyan light, lit rain, link glow | 1.0.0, launch pack |
| Judgment Day `judgment-day` | **cyberdyne**, liquid metal, steel mill, hud | cyberdyne: cold light from above; liquid metal: chrome sheen on headings; steel mill: heat glow (12%, raised from 7% in 1.0.1), glowing cursor and links; hud: red glow, scanlines, red vignette | 1.0.1, launch pack |

**In progress:** Yokosuka '86 `yokosuka-86` (`drafts/`), Dan's Shenmue pack, set aside to pick up again. See "Drafts" below.

Built into the apps, not here: **Classic** (parchment, paper, ash, sage, dark, moss, slate, custom 1–3) and, for now, **Retro** (game boy, moonwalker, terminal with crt, amber crt, doogie journal). Retro moves here once the effects can do everything its themes need.

## Effect requests

Effects the apps don't have yet. Each needs one app update, after which any pack can use it.

Retro's looks are drawn by each app's own code today. These effects would let Retro move here as an ordinary pack (PACKS-PLAN.md, phase 6), and any other pack use them too. Each must match the Retro themes exactly against the baseline screenshots in Tree's `baseline/` before Retro moves.

- **Screen flicker**: the CRT's flicker over the whole screen or the text, not only colored light behind it (`light` already has `flicker`). For terminal with crt, amber crt and doogie journal.
- **CRT screen shape**: the curved-screen edges and brighter rim of the CRT look.
- **Phosphor bloom**: a softer, wider glow than `glow`, for moonwalker and the CRT themes. May turn out to be `glow` with a larger range.

Not an effect, but an app setting Dan wants:

- **Background light switch**: one switch in each app's settings that turns off every `light` effect (spots and streaks) in every pack, whatever the pack says. Backgrounds only: text glow, particles, sheen and overlays stay as they are, since the distracting ones already have their own switches. No pack or format change needed.

## Drafts

### Yokosuka '86 (`drafts/yokosuka-86.tree-pack.json`)

Dan's favourite game, Shenmue (Dreamcast): the mood of a 1986 December in a harbor town, not the story. No characters, quotes or the game's title (Dan's rules for film and game packs). Description: "Paper walls, grey skies, shop signs, first snow."

Themes and where they stand with Dan:
- **sakuragaoka**: the house's paper walls. Rebuilt from his stills of the interior (grey-taupe plaster, near-black beams, red-lacquer window frames, light through shoji). Not yet reviewed after the rebuild.
- **leather**: the earlier, browner sakuragaoka. Dan liked it for looking like the jacket, so it stayed under this name.
- **dobuita**: the shopping street at dusk. Dan liked it.
- **harbor**: three tries. Too green twice; Dan wants grey. Latest: neutral warehouse greys, grey-violet sky light above, a faint dark-green sea band at the bottom, forklift orange accent, falling rain switch. Not yet reviewed; the sea band may need to go.
- **neon night**: jazz-bar red and convenience-store white-green signs. From memory, not stills.
- **arcade**: Dan liked it.
- **first snow**: snow is ready (`style: "snow"` on `particles`, in all three apps once the 2.0.2 / Just Write pull requests are merged). From memory, not stills.

Dan's picture of Shenmue: a lot of grey, old quaint shops, grey skies; at night, neon from the jazz bar and convenience store signs. His stills (house interior, harbor by day and in rain) helped far more than memory: ask for stills of Dobuita by day and night, and of snow, before tuning those. Everyday theme is still open: sakuragaoka is dark now; dobuita, or a light paper theme, are the options to put to him.

