# Mimmi's Beauty — Design Concept

> *"Crafted for the radiant. Made for every girl."*

---

## Brand Identity

| | |
|---|---|
| **Brand name** | MIMMI'S BEAUTY |
| **Tagline** | Crafted for the radiant. Made for every girl. |
| **Contact** | hello@mimmisbeauty.com |
| **Language** | English |
| **Currency** | € EUR |

---

## Color Palette

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   ████████  #0A0A0A   m-black    Primary text, buttons     │
│                                                            │
│   ████████  #FAFAF8   m-white    Background (warm white)   │
│                                                            │
│   ████████  #C9A96E   m-gold     Accent, borders, hover    │
│                                                            │
│   ████████  #7A4F35   m-earth    Deep warm brown           │
│                                                            │
│   ████████  #EDD9C8   m-blush    Warm sand, soft sections  │
│                                                            │
│   ████████  #6B6B6B   m-muted    Secondary text            │
│                                                            │
│   ████████  #A8A39D   m-subtle   Placeholders, captions    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Typography

### Display — Cormorant Garamond
Used for: hero titles, section headings, product names.

```
The Art of Radiant Beauty.      ← 72px / weight 300
Radiance, Refined.              ← 56px / weight 300
New Arrivals                    ← 40px / weight 300
```

> Cormorant Garamond is the defining font of luxury beauty: Chanel, La Mer,
> and Dior all use serif display fonts in this family. Light weight (300)
> gives it elegance without heaviness.

### Body — DM Sans
Used for: navigation, labels, body text, buttons, captions.

```
EXPLORE THE COLLECTION     ← 11px / weight 300 / letter-spacing 0.12em
hello@mimmisbeauty.com     ← 13px / weight 300
Product description text.  ← 14px / weight 400 / line-height 1.6
```

---

## Motion Spec (Apple-inspired)

| Property | Value |
|---|---|
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Standard duration | 300ms |
| Slow (page reveals) | 600ms |
| Fast (micro-interactions) | 150ms |

### Specific animations

| Element | Animation |
|---|---|
| Hero text | `fadeInUp` — slides up 24px + fades in on mount, staggered 100ms per line |
| Navbar | Transparent → frosted glass (`backdrop-blur(16px)`) on scroll past 40px |
| Nav links | Color `white/90` → `m-gold` on hover |
| Buttons | `scale(1.01)` on hover, `scale(0.99)` on press |
| Product cards | `translateY(-4px)` + soft shadow on hover |
| Slider | `translateX` with 900ms ease transition, 5s autoplay interval |

---

## Layout — Page Wireframes

### Homepage
```
┌─────────────────────────────────────────────────────────────┐
│  MIMMI'S BEAUTY        Homepage  Shop  About  Gallery  [🔍] [👤] [🛒] │
│  (transparent navbar → frosted glass on scroll)             │
└─────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────────┐
  │                                                           │
  │         [FULL-BLEED IMAGE — radiant beauty 100vh]         │
  │                                                           │
  │  New Collection                           ← gold label    │
  │                                                           │
  │  The Art of                               ← Cormorant     │
  │  Radiant Beauty.                            72px light     │
  │                                                           │
  │  Luxury skincare made for every           ← DM Sans       │
  │  girl, rooted in nature.                    16px, white/70 │
  │                                                           │
  │  [ EXPLORE THE COLLECTION ]               ← ghost button  │
  │                                             gold border    │
  │                                          ●  ← slide dots  │
  │                                          ○    (vertical,   │
  │                                          ○    right side)  │
  └───────────────────────────────────────────────────────────┘

  CATEGORIES                                 ← gold label
  ─────────────────────                      ← gold 1px line
  ○ Skincare  ○ Body Care  ○ Hair  ○ Fragrance

  New Arrivals                               ← Cormorant 40px
  ─────────────────────                      ← gold 1px underline

  [ Product ]  [ Product ]  [ Product ]  [ Product ]
  cream bg, soft shadow, translateY on hover

  ┌─────────────────────────────────────────────────────────┐
  │  MIMMI'S BEAUTY   |  Subscribe  |  Payments  |  © 2026  │  ← dark bg
  └─────────────────────────────────────────────────────────┘
```

### Product Detail
```
  ┌──────────────────────┬────────────────────────────────┐
  │                      │  SERUM ÉCLAT D'AFRIQUE         │ ← m-title-md
  │  [Product images     │                                │
  │   gallery — sticky   │  Natural extract of marula     │ ← m-label muted
  │   on scroll]         │  and baobab. Dermatologist     │
  │                      │  tested. Cruelty-free.         │
  │                      │                                │
  │                      │  ─────────────────             │ ← hairline
  │                      │  € 84,00                       │ ← m-title-md
  │                      │                                │
  │                      │  [Color options]               │
  │                      │  [Size options]                │
  │                      │  [ ADD TO CART ]               │ ← m-btn--primary
  │                      │                                │
  │                      │  Ingredients  /  Shipping      │ ← m-title-sm
  └──────────────────────┴────────────────────────────────┘

  Related Products
  ─────────────────
  [ ... ]
```

---

## Component Design Details

### Navbar
- Height: `h-14` mobile / `h-20` desktop
- Transparent on hero → `rgba(250,250,248,0.85)` + `backdrop-blur(16px)` on scroll
- Brand: Cormorant Garamond, tracking-widest
- Links: DM Sans uppercase, gold hover

### Footer
- Dark background: `#0A0A0A`
- Two-column: Brand info left / Newsletter right
- Gold hairline divider above bottom row
- Social icons: 60% opacity → 100% on hover

### Buttons
| Variant | Background | Border | Text | Hover |
|---|---|---|---|---|
| Primary | `#0A0A0A` | none | white | `#7A4F35` (earth) |
| Secondary | transparent | `#C9A96E` (gold) | black | gold fill |
| Ghost | transparent | white 70% | white | gold border + gold text |

### Slider dots (vertical, right-side)
- Inactive: `w-1 h-3` white/40
- Active: `w-1 h-6` gold — elongated pill shape

---

## CSS Class Reference (key utilities)

| Class | Description |
|---|---|
| `.m-section-title` | Cormorant Garamond 40px light — section headers |
| `.m-section-title--underline` | + gold 1px bottom border |
| `.m-label` | DM Sans 10px uppercase, letter-spacing 0.12em |
| `.m-title-sm` | DM Sans 13px uppercase |
| `.m-title-md` | DM Sans 16px uppercase medium |
| `.m-btn--primary` | Black CTA button |
| `.m-btn--secondary` | Gold-border transparent button |
| `.m-btn--ghost` | White-border button (for dark backgrounds) |
| `.navbar-glass` | Frosted glass nav (applied on scroll) |
| `.m-product-card` | Hover lift animation |
| `.animate-fadeInUp` | Fade + slide-up animation (600ms) |
| `.slider-hero-title` | Responsive hero title (clamp 2.5–5.5rem) |
| `.slider-hero-subtitle` | Responsive hero subtitle (clamp 0.875–1.125rem) |
| `.about-hero-title` | About page hero (clamp 2.5–5rem) |

---

## Tailwind Custom Tokens

```ts
colors: {
  m: {
    black:  "#0A0A0A",
    white:  "#FAFAF8",
    gold:   "#C9A96E",
    earth:  "#7A4F35",
    blush:  "#EDD9C8",
    muted:  "#6B6B6B",
    subtle: "#A8A39D",
  }
},
fontFamily: {
  display: ["Cormorant Garamond", "Georgia", "serif"],
  body:    ["DM Sans", "Helvetica", "Arial", "sans-serif"],
}
```

---

*Mimmi's Beauty — © 2026*
