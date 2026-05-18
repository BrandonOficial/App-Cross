---
name: High-Energy Fitness System
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e8bcb8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#af8784'
  outline-variant: '#5e3f3c'
  surface-tint: '#ffb3ad'
  primary: '#ffb3ad'
  on-primary: '#68000a'
  primary-container: '#e60023'
  on-primary-container: '#fff7f6'
  inverse-primary: '#c0001b'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#c7c6c6'
  on-tertiary: '#303031'
  tertiary-container: '#727272'
  on-tertiary-container: '#faf8f8'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3ad'
  on-primary-fixed: '#410004'
  on-primary-fixed-variant: '#930012'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Lexend
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Lexend
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
  data-display:
    fontFamily: Lexend
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  safe-margin: 20px
  gutter: 16px
---

## Brand & Style

This design system is engineered for a high-performance fitness environment, prioritizing momentum, precision, and depth. The aesthetic merges the structural clarity of **Flat Design** with the immersive layering of **Glassmorphism**. 

The brand personality is "Sophisticated Velocity"—it is professional enough for serious athletes while maintaining the vibrant energy required to motivate casual users. By utilizing fluid curves and translucent surfaces, the UI mimics the look of modern athletic wear and high-end gym equipment. The primary focus is on a high-energy dark mode that reduces visual noise and directs focus toward performance metrics and biometric data.

## Colors

The color palette is anchored by a deep, monochromatic foundation to emphasize depth. 

- **Primary (#E60023):** An aggressive, high-energy red used exclusively for primary actions, progress indicators, and critical performance data.
- **Neutral (#111111):** The core background color, providing a sophisticated "void" that allows glassmorphic layers to pop.
- **Secondary (#FFFFFF):** Used for high-contrast typography and subtle glass borders.
- **Muted (#767676):** Employed for secondary information, de-emphasized labels, and background tracks for progress bars.

Transparency is a functional pillar of this system. Glass surfaces should utilize a 10-15% white overlay with a heavy backdrop blur to maintain legibility against dynamic background content or fluid gradients.

## Typography

**Lexend** is the exclusive typeface for this design system. Chosen for its origins in reading proficiency and its inherently athletic, geometric structure, it provides the "active" feel necessary for a fitness application.

- **Headlines:** Use heavy weights (700+) with tight letter-spacing to evoke strength and urgency.
- **Data Display:** Numerical values (heart rate, calories, pace) should use the "data-display" style to ensure maximum glanceability during high-intensity movement.
- **Labels:** Small labels use an uppercase transformation with increased letter-spacing to differentiate meta-data from body content.

## Layout & Spacing

This design system utilizes a **fluid grid** model designed for mobile-first consumption. The spacing rhythm is built on an 8px base unit, ensuring mathematical harmony across all screen sizes.

- **Horizontal Rhythm:** A standard 20px safe-margin on the X-axis prevents content from crowding the edges of modern rounded device displays.
- **Fluid Curves:** Layout sections should transition using large, sweeping radii rather than jagged breaks.
- **Vertical Rhythm:** Generous padding (40px+) is used between major content groups to facilitate a "breathable" high-end feel, contrasting with the dense data points found within individual cards.

## Elevation & Depth

Depth in this design system is achieved through **Glassmorphism** and **Tonal Layering** rather than traditional drop shadows.

1.  **The Base:** The #111111 background serves as the deepest layer.
2.  **The Glass Layer:** Elevated cards use a semi-transparent background (`rgba(255, 255, 255, 0.08)`) with a 20px to 40px Backdrop Blur. 
3.  **The Stroke:** To define edges without using shadows, a 1px "ghost border" is applied to glass elements. Use a linear gradient stroke from top-left to bottom-right (`rgba(255,255,255, 0.2)` to `rgba(255,255,255, 0.05)`).
4.  **Fluid Glows:** Background "blobs" of blurred primary color (#E60023) should sit behind the glass layers to create a sense of vibrant energy and light occlusion.

## Shapes

The shape language is defined by **Rounded (Level 2)** containers. This provides a balance between the precision of flat design and the organic nature of human movement.

- **Standard Containers:** 16px (1rem) corner radius.
- **Buttons & Large Cards:** 24px (1.5rem) or 32px (2rem) for "rounded-xl" elements to emphasize the fluid, athletic aesthetic.
- **Interactive Triggers:** All touch targets must maintain a minimum height of 48px, utilizing fully pill-shaped (rounded-full) geometry for secondary chips and tags.

## Components

- **Primary Buttons:** High-energy #E60023 background with white bold text. No shadow; use a subtle inner-glow to provide a tactile "pressed" feel.
- **Glass Cards:** The primary container for workouts and stats. Features the backdrop blur and ghost border. Content inside should follow a strict hierarchy: Label-caps at the top, Headline-md for the title, and Data-display for the metric.
- **Activity Chips:** Small, pill-shaped elements with a 15% opacity white fill. Used for tagging workout types (e.g., "HIIT", "Strength").
- **Segmented Controls:** Flat #111111 track with a glassmorphic sliding indicator to highlight the active state.
- **Input Fields:** Minimalist design with only a bottom stroke in #767676, which transitions to a 2px #E60023 stroke upon focus.
- **Progress Rings:** Large-scale circular indicators using a #767676 track and a #E60023 active stroke with rounded caps.
- **Biometric Graphs:** Vector-based fluid lines with a gradient fill that fades into the background, emphasizing the "fluid curve" brand pillar.