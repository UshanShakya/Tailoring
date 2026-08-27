# UI/UX Guidelines

## Design direction

Modern, minimal, understated — the app should feel calm and precise, like
a well-tailored garment: clean lines, generous whitespace, no visual
noise. Inspired by fabric and thread rather than flashy SaaS gradients.

## Brand Palette (proposed)

| Token | Hex | Usage |
|-------|-----|-------|
| `ink` | `#1A1A1A` | Primary text, headings, primary buttons |
| `canvas` | `#FAFAF8` | App background |
| `surface` | `#FFFFFF` | Cards, modals, inputs |
| `teal` (primary) | `#2F6F5E` | Primary actions, links, active states |
| `teal-dark` | `#234F43` | Primary hover/pressed |
| `brass` (secondary) | `#C99A5B` | Secondary accents, highlights, badges |
| `border` | `#E5E3DE` | Dividers, input borders |
| `muted` | `#6B6B66` | Secondary/help text |
| `success` | `#3A7D5C` | Success states, paid invoices |
| `warning` | `#C97A3D` | Due soon, partially paid |
| `error` | `#B3453A` | Errors, overdue, destructive actions |

These are a proposed starting palette — swap the hex values below in one
place (`tailwind.config.js`) if you get real brand colors later; nothing
in components should ever need to change.

## Absolute rule: tokens only, no raw colors

**No component may use a raw hex/rgb/hsl color or an arbitrary Tailwind
color class (`text-blue-500`, `bg-[#123456]`, etc.), ever.** Every color
used in the UI must come from the token set below, exposed as Tailwind
theme colors.

### Tailwind config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: '#1A1A1A',
        canvas: '#FAFAF8',
        surface: '#FFFFFF',
        teal: {
          DEFAULT: '#2F6F5E',
          dark: '#234F43',
        },
        brass: '#C99A5B',
        border: '#E5E3DE',
        muted: '#6B6B66',
        success: '#3A7D5C',
        warning: '#C97A3D',
        error: '#B3453A',
      },
    },
  },
};
```

### Usage examples

```jsx
// Correct
<button className="bg-teal text-canvas hover:bg-teal-dark">Save</button>
<p className="text-muted">Last updated 2 days ago</p>
<div className="border border-border bg-surface">...</div>

// Never do this
<button className="bg-[#2F6F5E]">Save</button>
<button className="bg-blue-600">Save</button>
```

If a design need arises that the current tokens don't cover, add a new
named token to this file and `tailwind.config.js` first — never inline a
one-off color in a component.

## Typography

- Sans-serif system stack for UI: `font-sans` (Tailwind default) is fine
  — keep it simple and legible.
- Headings: `ink`, semibold.
- Body: `ink` at ~90% opacity or `muted` for secondary copy.
- Avoid more than 2 font weights on a single screen.

## Spacing & layout

- Base spacing unit: Tailwind's default 4px scale — don't introduce a
  second spacing system.
- Cards: `bg-surface`, `border border-border`, `rounded-lg`, subtle
  shadow only (`shadow-sm`) — avoid heavy drop shadows.
- Generous whitespace over dense tables where possible; use dense tables
  only for data-heavy views (measurement history, payment history).

## Status color mapping (for consistency across the app)

| State | Token |
|-------|-------|
| Order: Pending | `muted` |
| Order: In Progress | `brass` |
| Order: Ready / Delivered | `success` |
| Invoice: Unpaid | `error` |
| Invoice: Partially Paid | `warning` |
| Invoice: Paid | `success` |

## Components

- Build a small internal design system in `components/ui/` (Button,
  Input, Select, Modal, Badge, Table) that all use tokens internally —
  feature code should compose these, not restyle raw HTML elements.
- Every new shared component must be reviewed against this file before
  being added to `components/ui/`.
