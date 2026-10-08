---
name: Groww Beginner Mode
description: Groww's light app, played straight, with beginner guidance built into the money surfaces.
colors:
  ground: "#F8F8F8"
  surface: "#FFFFFF"
  ink: "#44475B"
  ink-secondary: "#696C7C"
  hairline: "#E9E9EB"
  track: "#DDDEE1"
  control: "#C7C8CE"
  disabled: "#B0B2BA"
  chip-neutral: "#F0F0F2"
  groww-green: "#04B488"
  green-text: "#00825C"
  green-tint: "#E9FAF3"
  green-tint-line: "#CDF3E3"
  loss: "#D23A15"
  loss-tint: "#FFF1ED"
  warning-text: "#8A5A00"
  warning-tint: "#FFF7DE"
  warning-line: "#FFE7AA"
  info: "#4452D6"
  info-tint: "#F2F5FF"
  stocks-blue: "#5367FF"
typography:
  display:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  control: "8px"
  card: "12px"
  sheet: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  button-primary:
    backgroundColor: "{colors.green-text}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  button-primary-disabled:
    backgroundColor: "{colors.control}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "16px"
  tag-info:
    backgroundColor: "{colors.info-tint}"
    textColor: "{colors.info}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  tag-green:
    backgroundColor: "{colors.green-tint}"
    textColor: "{colors.green-text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  tag-warning:
    backgroundColor: "{colors.warning-tint}"
    textColor: "{colors.warning-text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  tag-neutral:
    backgroundColor: "{colors.chip-neutral}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  segmented-tab-active:
    backgroundColor: "{colors.green-text}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "8px 0"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "12px 16px"
  monogram-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    size: "40px"
  bottom-nav:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.label}"
---

# Design System: Groww Beginner Mode

## Overview

**Creative North Star: "Groww, Played Straight"**

This is Groww's own light app with Beginner Mode living inside it. Surfaces are white cards on a near-white ground, separated by hairlines rather than shadows; one sans (Figtree, standing in for the proprietary GrowwSans) carries everything; Groww green is the only brand voice. The guidance (next steps, explanations, charge breakdowns, the F&O lock) is the only new thing, and it arrives in the same quiet materials as the rest of the app, never as a separate visual register.

Density is Groww's: compact mobile rows, 14px body, big bold ink figures where money is the headline. Tokens come from groww.in's production palette, with text-bearing greens, greys, reds and ambers taken one step darker on Groww's own scale so every text pairing clears WCAG AA. Numbers are always tabular and in Indian format; gain and loss always carry a sign as well as a colour.

The world rejects the prototype's earlier bespoke forest-and-mint identity and any flourish Groww would not ship.

**Key Characteristics:**
- White bordered cards (12px) on a #F8F8F8 ground; flat, hairline-separated.
- One family, Figtree, bold for figures and headings, tabular numerals for every amount.
- Two greens with split jobs: brand green for fills, bars, dots and icons; darker green for text and white-label buttons.
- Pills only for chips, tags and segmented tabs; 8px for controls.
- Lists inside cards are hairline-divided rows, never nested boxes.

## Colors

A white-and-grey neutral field with one brand green, and tinted semantic pairs for gain, loss, warning and info.

### Primary
- **Groww Green** (groww-green): The brand green (Groww green9). Fills, progress bars, allocation segment, legend dots, active-tab indicator, icons. Never used for text or behind white text; it fails AA there.
- **Deep Groww Green** (green-text): Groww green11. All green text (gains, links, "View holdings", text actions), primary button fills with white labels, active segmented tab, active nav label, focus ring, selection text.
- **Green Mist** (green-tint) with **Green Mist Line** (green-tint-line): tint surfaces for green chips, avatar disc, welcome card, and text selection.

### Secondary
- **Groww Indigo** (info) on **Indigo Mist** (info-tint): secondary accent for informational tags and notes (Groww blue11 on blue2).
- **Stocks Blue** (stocks-blue): data-visualisation only, the stocks segment and dot in the allocation bar. Not a text colour.

### Tertiary
- **Loss Red** (loss) on **Loss Mist** (loss-tint): Groww red11. Loss figures, negative index moves, field error text and error borders.
- **Warning Amber** (warning-text) on **Warning Cream** (warning-tint), bordered by **Warning Line** (warning-line): high-charge warnings, F&O caution, amber tags.

### Neutral
- **Groww Ink** (ink): Groww gray900. Primary text, headings, every large money figure, monogram initials, tooltip fill.
- **Slate Secondary** (ink-secondary): Groww gray800 (one step darker than production gray700 for AA). Labels, helper text, inactive nav, units ("5 shares").
- **Paper Ground** (ground): Groww gray50. Page background behind cards; also the chat input fill.
- **White Surface** (surface): cards, sheets, nav bar, header controls.
- **Hairline** (hairline): Groww gray150. Card borders, row dividers, input borders, top border of nav and sticky footers.
- **Track** (track): progress tracks, connectors, sheet handles, phone-frame border.
- **Control Grey** (control): unselected control borders, inactive dots, disabled button fill.
- **Disabled Glyph** (disabled): disabled icons and text.
- **Chip Grey** (chip-neutral): neutral tag fill ("No plan set").

### Named Rules
**The Two Greens Rule.** Brand green (#04B488) fills shapes; deep green (#00825C) carries text and white labels. If a green is behind or forming letters, it is the deep one.

**The Signed Money Rule.** Gains render in deep green with "+", losses in loss red with the true minus sign "−". Colour never carries the meaning alone.

**The Ink Returns Rule.** Headline values and past-performance return figures are ink; only explicit gain/loss deltas take green or red. Daily moves in dense lists ("−0.6% today") stay secondary grey with their sign.

## Typography

**Display Font:** Figtree (with ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto)
**Body Font:** Figtree
**Label/Mono Font:** Figtree with tabular numerals for all figures

**Character:** A single friendly geometric-humanist sans, Groww's register exactly: bold and slightly tightened for figures and headings, regular and roomy for explanations.

### Hierarchy
- **Display** (700, 36px, line-height 1, -0.01em, tabular): the hero money figure on a screen (portfolio value, net sale amount, SIP amount, F&O fact numbers). One per view. 30px is used for a stock price on its detail page.
- **Headline** (700, 24px, 1.25): page titles ("Invest", greeting on the welcome card, account name) and large amount inputs.
- **Title** (700, 18px, 1.25): card section titles and sub-page header titles.
- **Body** (400 to 600, 14px, 1.625 for explanatory copy): row titles at 500, explanations and detail copy at 400 with relaxed leading, buttons at 600.
- **Label** (500 to 600, 12px): tags, chips, nav labels, field hints and errors, progress captions. Sentence case; no uppercase, no tracking.

### Named Rules
**The Tabular Figures Rule.** Every rupee amount, percentage and count is set with tabular numerals so columns of money align.

**The No Eyebrow Rule.** Headings stand alone; no small label or kicker sits above a section title.

## Layout

A single phone column. On screens 640px and wider the app sits in a phone frame (max 860px tall, 36px corners, track-colour border) centred on a #EEEFF1 desktop ground; below 640px it fills the viewport. Cards inset 16px from the screen edge with 16px internal padding; page titles and free-standing section headings sit at a 20px gutter. Spacing runs on a 4px base, with 8px and 12px the dominant gaps inside rows and 16 to 20px between blocks. Bottom sheets rise from the bottom with 20px side padding and a track-colour handle. Sticky action footers and the bottom nav sit on white with a hairline top border and respect the safe-area inset.

## Elevation & Depth

Flat. Depth comes from white surfaces on the grey ground plus 1px hairline borders, and from the scrim (rgba(18,18,18,.5)) behind sheets. Shadows appear only on things that genuinely float above the page.

### Shadow Vocabulary
- **Tooltip lift** (`box-shadow: 0 8px 20px -8px rgba(68,71,91,.45)`): the one-time Ask AI intro tooltip.
- **Switch knob** (`box-shadow: 0 1px 3px rgba(0,0,0,.2)`): the white knob of a toggle switch.
- **Device frame** (`box-shadow: 0 32px 64px -32px rgba(68,71,91,.28)`): the desktop phone-frame presentation only; not an in-app surface.

### Named Rules
**The Border Not Shadow Rule.** Cards, inputs, tiles and sheets separate with hairlines. A shadow on a resting card is off-world.

## Shapes

Three radii and a pill. Controls (buttons) take gently rounded 8px corners; cards, inputs, monogram tiles and sheet tops take 12px; chips, tags, segmented tabs, the demo toggle, progress bars and icon buttons are full pills. Hairlines are 1px for structure, 1.5px on inputs and the secondary button. Dashed hairlines mark a sub-total or summary break inside a card (the trading P&L line, the sell-charge breakdown).

## Components

### Buttons
Quiet and full-width, the way Groww ships them.
- **Shape:** gently rounded (8px).
- **Primary:** deep green fill, white 14px semibold label, 12px vertical padding, full width. Disabled swaps to control grey.
- **Secondary:** white fill, ink label, 1.5px hairline border.
- **Hover / Focus / Active:** 160ms background and border transitions; press scales to 0.97 (off under reduced motion); focus is a 2px deep-green outline at 2px offset.
- **Text actions:** deep-green semibold text with a chevron ("Add >", "View").

### Chips
- **Style:** pill, 12px medium label, 2px by 8px padding, tint fill with the paired text colour: green mist / deep green, indigo mist / indigo, warning cream / amber, chip grey / secondary.
- **State:** the consistency badge reuses the chip tones by score (green 8+, amber 5 to 7, grey below). The "View holdings" link is a larger green-mist pill.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** white; the welcome card alone uses green mist with a green-mist-line border.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px hairline.
- **Internal Padding:** 16px (20px on the welcome card).
- **Lists inside cards:** rows divided by a 1px hairline top border from the second row on; rows are never boxed inside the card.

### Inputs / Fields
- **Style:** white fill, 1.5px hairline border, 12px radius; label above at 14px medium, hint below at 12px secondary. Amount inputs set the value at 24px bold tabular with a secondary-grey ₹ prefix. The chat input is a pill on the paper ground.
- **Focus:** deep-green caret plus a 2px deep-green outline on keyboard focus (`:focus-visible`), matching buttons.
- **Error:** border and message switch to loss red.

### Navigation
- **Bottom nav:** white bar, hairline top border, four equal tabs with 22px line icons and 12px labels. Inactive is secondary grey at 500 and 1.8 stroke; active is deep green at 600 and 2.2 stroke, with a 2px by 32px brand-green pill indicator at the top edge.
- **Segmented tabs:** white pill track with hairline border and 4px inset; the active segment fills deep green with white text.
- **Header icon buttons:** 40px circular hit areas, ink icons; the AI entry uses green.

### Monogram Tile
Stock identity without logos: a 40px white tile, 12px corners, 1px hairline, ink initials at 14px bold. Never a coloured fill.

### Riskometer
The SEBI-style risk scale on fund pages: six short pills filling from green to red (#5DBB8A, #9CCB64, #D9C24F, #E5A04A, #DE7C45, #C8553D) up to the fund's level, the rest in track grey. A regulated, data-only colour ramp; not a palette for anything else.

## Do's and Don'ts

### Do:
- **Do** put white cards (#FFFFFF) with a 1px #E9E9EB border on the #F8F8F8 ground.
- **Do** use #00825C for any green text or white-label green button, and #04B488 only for fills, bars, dots and icons.
- **Do** sign every gain and loss ("+₹3,250", "−₹1,840") and set all figures in tabular numerals with Indian grouping.
- **Do** keep hero money figures ink, bold, 36px, line-height 1.
- **Do** divide rows inside a card with hairlines.
- **Do** use pills only for chips, tags, segmented tabs and toggles; 8px for buttons; 12px for cards, inputs and tiles.
- **Do** honour reduced motion: entrance animations and the press scale switch off.

### Don't:
- **Don't** set text or white labels on #04B488; it fails AA.
- **Don't** put shadows on resting cards, tiles or inputs.
- **Don't** nest bordered boxes inside a card to separate list items.
- **Don't** fill monogram tiles with brand or random colours.
- **Don't** add eyebrow labels or uppercase kickers above headings.
- **Don't** introduce a second typeface or a bespoke forest-and-mint palette.
- **Don't** convey gain or loss by colour alone.
