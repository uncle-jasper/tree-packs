# Tree pack format, version 1

A pack is one JSON file, `<pack-id>.tree-pack.json`, holding a set of themes. Tree, Ginkgo and the Tree Obsidian plugin all read the same file.

A pack file is **data only**. It holds names, colors and effect settings. It never holds code, CSS or HTML. Effects are built into each app, and a pack switches them on by name and tunes them with numbers and colors. That keeps a pack file as safe to import as a custom theme file.

## The pack

```json
{
  "treePack": 1,
  "id": "rain",
  "name": "Rain",
  "version": "1.0.0",
  "description": "From a grey afternoon to a neon night.",
  "everyday": "rain",
  "themes": [ ... ]
}
```

| Field | Required | Meaning |
|---|---|---|
| `treePack` | yes | Format version. Always `1` for now. An app skips a pack whose number is higher than it knows. |
| `id` | yes | Permanent ID. Lowercase letters, digits and hyphens, 2–32 characters. **Never changes**, even if the name does: people's saved settings point at it. |
| `name` | yes | Shown in the pack row. Up to 24 characters. |
| `version` | yes | `major.minor.patch`. Raise it when the pack changes, so apps can offer the update. |
| `description` | no | One line for the Packs screen. Up to 120 characters. |
| `everyday` | yes | The ID of the theme a pack opens on the first time it's chosen. Must be one of its themes. |
| `themes` | yes | 1 to 8 themes, in the order the theme row steps through them. |

## A theme

```json
{
  "id": "downpour",
  "name": "downpour",
  "light": false,
  "colors": {
    "bg": "#0e1517", "surface": "#131b1e", "text": "#b0c3c5",
    "accent": "#66a0a8", "muted": "#42585c", "border": "#1a2729"
  },
  "effects": [ ... ]
}
```

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Permanent, unique within the pack. Same rules as the pack ID. |
| `name` | yes | Shown in the theme row. Lowercase, like Tree's built-in themes. Up to 24 characters. |
| `light` | no | `true` for a light theme, so scrollbars and form controls turn light. Default `false`. |
| `colors` | yes | Tree's six colors, each `#rrggbb`. |
| `colors.selection` | no | Selected-text color, `#rrggbb`. Default: the accent at about 22%. |
| `effects` | no | Up to 6 effects, below. |

The six colors mean the same thing in every app: `bg` the page, `surface` bars and panels, `text` the writing, `accent` links and the cursor, `muted` dimmed text and markdown marks, `border` lines and dividers.

## Effects

Every effect has a `type`. Any effect can also have:

| Field | Meaning |
|---|---|
| `switch` | A label such as `"falling rain"`. The effect gets an on/off switch under the theme, in the quick panel and in settings. Effects sharing a label share one switch. Without a `switch`, the effect is always on. |
| `on` | With a `switch`: whether it starts on. Default `false`. |

Every animated effect pauses while the app is in the background and holds still when the device asks for reduced motion. That's the app's job, not the pack's.

Numbers outside their range are clamped to it. An effect type an app doesn't know is skipped, and the theme still loads with its colors.

### `particles`: falling streaks behind the page (rain)

```json
{ "type": "particles", "switch": "falling rain", "on": true,
  "color": "#91bec3", "opacity": 1, "density": 1, "speed": 1, "length": 1, "slant": 0.12 }
```

| Field | Range | Default | Meaning |
|---|---|---|---|
| `color` | `#rrggbb` | the theme's `muted` | Streak color |
| `opacity` | 0.2–3 | 1 | Multiplies the built-in faintness. Light themes need more. |
| `density` | 0.2–3 | 1 | How many streaks. 1 is Downpour. |
| `speed` | 0.2–3 | 1 | How fast they fall |
| `length` | 0.2–3 | 1 | How long each streak is |
| `slant` | -0.5–0.5 | 0.12 | Sideways lean. Positive leans left as it falls, like Tree's rain. |
| `regions` | up to 8 | none | Areas where streaks take on another color (below) |

**Regions** light the rain. Each is a rectangle in fractions of the page (`x`, `y`, `w`, `h`, 0–1), a `color`, and a `chance` (0–1): the share of streaks starting above it that pick up its light. A lit streak takes the color of whichever region it's falling through at that moment, so it can change color on the way down; outside every region it's its normal color. Wet Neon's crossing light is four regions.

When the switch turns off, streaks already falling finish their fall. When it turns on, new streaks start at the top.

### `light`: colored light in the page (signs, lamps, heat)

```json
{ "type": "light", "flicker": true,
  "spots":   [ { "x": 0.14, "y": 0, "w": 0.34, "h": 0.7, "color": "#ff3ca5", "strength": 0.22 } ],
  "streaks": [ { "x": 0.10, "w": 0.09, "h": 0.45, "color": "#32d7f0", "strength": 0.14 } ] }
```

| Field | Meaning |
|---|---|
| `spots` | Up to 6 soft ellipses. `x`, `y` are the center in fractions of the page; `w`, `h` the size; `strength` 0–0.4 is how strong the color is. |
| `streaks` | Up to 6 soft vertical smears rising from the bottom edge, like reflections on wet pavement. `x` center, `w` width, `h` height, `strength` 0–0.4. |
| `flicker` | `true` gives the spots an occasional neon-tube flicker. |
| `pulse` | `true` makes the streaks breathe slowly. |

Light sits behind the text, never over it.

### `overlay`: a screen in front of the page (CRT, HUD)

```json
{ "type": "overlay", "scanlines": 0.22, "vignette": { "color": "#3c0000", "strength": 0.55 } }
```

| Field | Range | Meaning |
|---|---|---|
| `scanlines` | 0–0.5 | Darkness of horizontal scanlines. 0 for none. |
| `vignette.color` | `#rrggbb` | Color the edges darken toward |
| `vignette.strength` | 0–0.8 | How strong the edge darkening is |

### `glow`: glowing text

```json
{ "type": "glow", "target": "text", "strength": 0.45 }
```

| Field | Meaning |
|---|---|
| `target` | `text` (the writing), `links` (links only) or `cursor` |
| `strength` | 0–1. The glow always follows the color of what it's on, so dim text never gets a bright glow. |

### `sheen`: light sliding across headings (chrome)

```json
{ "type": "sheen", "switch": "chrome sheen", "on": true,
  "colors": ["#8d969e", "#eef3f6", "#9aa4ac", "#f4f8fa", "#7f8991", "#dfe6eb"], "seconds": 7 }
```

| Field | Meaning |
|---|---|
| `colors` | 2–8 colors the headings are painted with, as a band that slides across them |
| `seconds` | 3–20, how long one slide takes |

## The shelf index

The shelf is this repo, published as a web page. Apps read `index.json` at its root to list the packs:

```json
{
  "treePacks": 1,
  "packs": [
    { "id": "rain", "name": "Rain", "version": "1.0.0",
      "file": "packs/rain.tree-pack.json",
      "description": "From a grey afternoon to a neon night.",
      "swatches": ["#ccd4d6", "#192125", "#0e1517", "#141a1d", "#0b1115"] }
  ]
}
```

`swatches` are the themes' background colors, in order, for the little color strip on the Packs screen. The pack file itself stays the source of truth; the index only lists it.

## Checks an app makes before installing

- `treePack` is a number it knows.
- IDs follow the rules, and theme IDs are unique within the pack.
- `everyday` names one of the pack's themes.
- Every color is `#rrggbb`. Every number is clamped to its range. Text fields are cut to their length and shown as plain text, never as HTML.
- Anything else is ignored.

A pack that fails a check isn't installed, and the app says why in one line.

## What's left out on purpose

- **Fonts.** Packs don't choose fonts; that stays your setting.
- **Code of any kind.** No scripts, CSS, HTML or links in a pack.
- **Secret codes.** Every theme is visible in its pack.
- **Status-line text** (like HUD's "ANALYSIS:"). Fun, but not worth the extra field.
