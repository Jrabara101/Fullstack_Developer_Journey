---
name: Modern Retail Banking
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#410002'
  on-tertiary-container: '#f63a35'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000b'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  metric-display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system embodies institutional trust, modern precision, and functional clarity. Designed for a forward-thinking retail banking platform, it eliminates decorative excess in favor of crisp utility, predictable affordances, and razor-sharp data readability.

The visual style blends modern corporate minimalism with the disciplined utility of Shadcn UI and Tailwind CSS. The interface relies on deliberate structure: slate-toned micro-surfaces, subtle 1px structural dividing lines, micro-elevations, and strict semantic color discipline. The emotional goal is immediate confidence, institutional stability, and calm control over complex personal balance sheets.

## Colors
The palette utilizes a strict hierarchy derived from neutral slate tones, ensuring financial figures remain the focal point.

- **Canvas & Surfaces:** Base application background uses Slate 50 (`#f8fafc`). Elevated cards, modals, and sheets use pure white (`#ffffff`) framed by delicate Slate 200 borders (`#e2e8f0`).
- **Primary Brand & Actions:** Deep Slate 900 (`#0f172a`) anchors high-priority interactions, active tab states, and primary CTAs, with Slate 800 (`#1e293b`) serving as hover states.
- **Financial Balance & Inflow:** Emerald 600 (`#059669`) strictly represents money in, positive yields, asset growth, and success states, paired with Emerald 50 (`#ecfdf5`) for soft badge fills.
- **Outflows & Standard Values:** Standard transaction outflows and everyday debit activities remain in primary Slate 900 (`#0f172a`) or Slate 700 (`#334155`). Red is explicitly prohibited for standard expenses.
- **Alert & Critical States:** Rose/Red 600 (`#dc2626`) is reserved strictly for overdrawn balances, security alerts, blocking validation errors, and irreversible destructive actions.
- **Typography & Tonal Contrast:** Slate 900 for high-emphasis headlines and ledger amounts; Slate 600 (`#475569`) for table headers and body labels; Slate 500 (`#64748b`) for timestamps, account numbers, and metadata.

## Typography
The system employs `Inter` universally to ensure visual cohesion across desktop and mobile platforms.

- **Tabular Figures:** All financial amounts, currency indicators, table columns, account numbers, and percentage deltas must enforce CSS `font-variant-numeric: tabular-nums` (or `font-feature-settings: "tnum"`). This prevents jitter when balances update and preserves vertical alignment across ledger columns.
- **Hierarchy & Tracking:** Large figures utilize slight negative tracking (`-0.02em` to `-0.025em`) to compact numbers visually without sacrificing clarity. Micro-labels and table column headers utilize medium weight (`500`) with subtle uppercase tracking to distinguish field titles from content values.

## Layout & Spacing
The layout follows an 8-point baseline rhythm with 4-point micro-adjustments for data density.

- **Grid Architecture:** Desktop views operate on a 12-column fluid responsive grid capped at a maximum width of 1440px. Gutters maintain a strict 24px (`1.5rem`) on desktop and scale down to 16px (`1rem`) on mobile viewports.
- **Canvas Margins:** Section gutters and outer application frames preserve 32px (`2rem`) horizontal clearance on desktop screens, tightening to 16px (`1rem`) on mobile devices.
- **High-Density Data Grids:** Data tables compress vertical cell padding down to 8px-12px (`space-sm` to `0.75rem`) to maximize visible records on single viewports while maintaining accessible 36px to 40px row heights.

## Elevation & Depth
Depth is established primarily through 1px hairline borders complemented by faint, crisp ambient drop shadows rather than deep diffuse blurs.

- **Base Cards & Modules:** Pure white surfaces resting on the Slate 50 canvas employ a 1px solid border of Slate 200 (`#e2e8f0`) alongside a feather-light ambient shadow: `box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.05)`.
- **Active & Hover States:** Interactive cards and active list items lift using a subtle dual shadow: `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Flyouts, Dropdowns & Popovers:** Floating menus, custom account switchers, and select dropdowns use `box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)` enclosed with a Slate 200 perimeter border.
- **Dialog & Modal Overlays:** Modals sit above a 40% opacity Slate 900 backdrop (`rgba(15, 23, 42, 0.4)`) with backdrop blur set to `4px`.

## Shapes
The structural visual envelope favors calibrated, modern curves without appearing playful or juvenile.

- **Primary Containers & Modals:** Standard structural surfaces, account balance cards, and chart containers use `rounded-xl` (12px to 16px border-radius).
- **Controls & Form Inputs:** Buttons, text fields, search bars, and selects employ `rounded-lg` (8px border-radius), creating nested visual harmony inside `rounded-xl` parent cards.
- **Micro-Elements & Badges:** Status chips, transaction flags, and inline tags feature either `rounded-md` (6px) or fully rounded pill styles (`rounded-full`) depending on semantic purpose.

## Components

### Buttons
- **Primary:** Background Slate 900 (`#0f172a`), foreground White (`#ffffff`), border transparent. On hover: Slate 800 (`#1e293b`). 8px radius, height 40px (default) / 36px (compact table action).
- **Secondary / Outline:** Background White (`#ffffff`), 1px border Slate 200 (`#e2e8f0`), foreground Slate 900. On hover: Background Slate 50 (`#f8fafc`).
- **Destructive:** Background Red 50 (`#fef2f2`), foreground Red 600 (`#dc2626`), border 1px solid Red 200 (`#fecaca`). On hover: Background Red 100 (`#fee2e2`).

### Input Fields & Search Bars
- Pure white background, 1px border Slate 200. Text in Slate 900 with Slate 400 placeholder. Height 40px, padding 0 12px.
- **Focus Ring:** 2px ring offset by 2px using Slate 900 (`ring-2 ring-slate-900 ring-offset-2`).
- **Monetary Inputs:** Currency symbol fixed left in Slate 500; numerical input set to bold tabular-nums.

### Data Tables & Transaction Ledgers
- Table container wrapped in White card with Slate 200 border and `rounded-xl` clipping.
- **Header:** Background Slate 50, border-bottom 1px Slate 200. Label typography `11px`, Slate 500, uppercase, font-weight 600.
- **Rows:** Alternate or clean white rows separated by 1px Slate 100 borders (`#f1f5f9`). Row height 44px for high density. On hover: Slate 50/50 fill.
- **Amounts:** Standard debit/charge transactions display as `-$42.50` in Slate 900. Positive credits/inflows display as `+$1,250.00` in Emerald 600 with accompanying Emerald icon arrow.

### Badges & Status Chips
- **Inflow / Active / Verified:** Emerald 50 fill, Emerald 700 text, border 1px Emerald 200.
- **Pending / In Review:** Amber 50 fill, Amber 700 text, border 1px Amber 200.
- **Critical Alert / Overdrawn:** Red 50 fill, Red 700 text, border 1px Red 200.
- **Neutral Category (e.g., "Utilities", "Payroll"):** Slate 100 fill, Slate 700 text, border 1px Slate 200.

### Checkboxes & Radios
- Size 16px by 16px with `rounded` (4px for checkbox, full circle for radio).
- Unchecked: White surface with 1px border Slate 300 (`#cbd5e1`).
- Checked: Slate 900 fill with crisp white vector check icon. Focus state emits Slate 900 focus ring.

### Cards & Summary Modules
- Built using White background with 1px Slate 200 borders, `rounded-xl`, and `shadow-sm`.
- Inner spacing: 20px padding (`1.25rem`). Top row features small uppercase label alongside category icon; middle section hosts 32px metric display; bottom section holds contextual delta comparison badge.