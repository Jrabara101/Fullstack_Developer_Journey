---
name: Kinetic Social
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#e6bcbd'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#ad8888'
  outline-variant: '#5d3f40'
  surface-tint: '#ffb3b5'
  primary: '#ffb3b5'
  on-primary: '#680019'
  primary-container: '#ff5167'
  on-primary-container: '#5b0015'
  inverse-primary: '#be0036'
  secondary: '#e6bcc5'
  on-secondary: '#442830'
  secondary-container: '#5d3e46'
  on-secondary-container: '#d4abb4'
  tertiary: '#65dcab'
  on-tertiary: '#003826'
  tertiary-container: '#1fa478'
  on-tertiary-container: '#003121'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b5'
  on-primary-fixed: '#40000c'
  on-primary-fixed-variant: '#920027'
  secondary-fixed: '#ffd9e1'
  secondary-fixed-dim: '#e6bcc5'
  on-secondary-fixed: '#2c141b'
  on-secondary-fixed-variant: '#5d3e46'
  tertiary-fixed: '#82f9c6'
  tertiary-fixed-dim: '#65dcab'
  on-tertiary-fixed: '#002115'
  on-tertiary-fixed-variant: '#005139'
  background: '#111317'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
  card-surface: '#161920'
  card-border: '#262A34'
  text-primary: '#F3F4F6'
  text-secondary: '#9CA3AF'
  text-muted: '#6B7280'
  burst-glow: '#FF6482'
  icon-unliked: '#E5E7EB'
typography:
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.015em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-semibold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 0.75rem
  space-xs: 0.375rem
  space-sm: 0.625rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

# Social Feed Double-Tap Interaction Design System

## Colors
- Background Canvas: #0F1115
- Card Surface: #161920
- Card Border Subtle: #262A34
- Primary Text: #F3F4F6
- Secondary Text: #9CA3AF
- Muted Metadata: #6B7280
- Like Accent Primary: #FF2D55
- Like Accent Soft Surface: #2A1219
- Burst Particle Glow: #FF6482
- Unliked Icon Stroke: #E5E7EB

## Typography
- Font Family: Inter, system-ui, -apple-system, sans-serif
- Author Handle: 14px, font-weight 600, line-height 20px, letter-spacing -0.01em
- Location Subtext: 12px, font-weight 400, line-height 16px, color #9CA3AF
- Engagement Counter: 13px, font-weight 600, font-variant-numeric tabular-nums
- Caption Body: 14px, font-weight 400, line-height 20px, color #E5E7EB

## Spacing
- Screen Width: 393px (Mobile iOS Viewport)
- Feed Horizontal Padding: 12px
- Card Internal Padding: 12px
- Section Gap: 10px
- Icon Hit Target: 44px x 44px minimum
- Icon Cluster Gap: 16px

## Components
- Feed Card Container: rounded-2xl (16px radius), bg #161920, border 1px solid #262A34, overflow hidden
- Image Canvas Target: aspect-ratio 4/5, rounded-xl (12px radius), object-fit cover, position relative
- Like Pill Button (Unliked): rounded-full, py-1.5 px-3, bg transparent, stroke #E5E7EB 1.75px, text #F3F4F6
- Like Pill Button (Liked): rounded-full, py-1.5 px-3, bg #2A1219, border 1px solid #FF2D55, icon filled #FF2D55, text #FF2D55 font-semibold
- Double-Tap Burst Overlay: 72px filled heart icon (#FF2D55) with 8px radial particle dots, drop-shadow 0 12px 24px rgba(255,45,85,0.45), anchored at tap coordinate
