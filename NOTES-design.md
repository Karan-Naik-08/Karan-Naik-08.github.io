# Contestant C — "Kinetic editorial"

**Concept.** Gigantic Fraunces (variable serif) + Space Grotesk, hard dark/light section inversions, and a single
acid-orange accent. Every section is a typographic set-piece; motion is GSAP ScrollTrigger-driven.

**Signature interactions**
- Hero wordmark is a raw-WebGL (no three.js) fragment shader: the name is rasterised to a texture and warped by
  pointer velocity (ripple, noise flow, RGB split, fake perspective tilt toward the cursor). It idles on its own
  (wandering "virtual cursor"), so touch/no-mouse users still see it move. Real `<h1>` is kept for a11y/SEO and is the visible fallback.
- Pinned horizontal-scroll project gallery (desktop); native snap-scroller on mobile / no-JS / reduced motion.
- Case studies open as a full-screen `<dialog>` with a View Transitions shared-element morph (tile title -> case title);
  CSS fallback animation elsewhere. Next-case button, Esc, focus return to the tile.
- Cert list with cursor-following preview that is displaced by an SVG feTurbulence/feDisplacementMap filter (also on project numerals).
- Custom cursor with context labels, magnetic buttons, word split-reveals, scrubbed word-by-word About, count-up metrics,
  scroll-velocity-driven marquee.

**Run:** `cd _contest/c && python3 -m http.server 8103`

**Degradation:** CDN blocked -> content, native gallery, dialog still work (tested). Reduced motion -> no loader/GL/pin/reveals, static values.
WebGL off -> HTML h1. WebGL paused offscreen/tab hidden, DPR capped at 2. Loader hard-capped at 2.4s.

**Known weaknesses (honest)**
- Hero texture is re-uploaded on resize only; very rapid resizing may show a brief stretch. Hero text is not selectable (canvas).
- View Transition shared-element morph stretches the title snapshot slightly (font-size changes between states); Safari <18 / Firefox use the CSS fallback.
- SVG displacement filter is only enabled on Chromium-based browsers (skipped elsewhere for perf), so Safari/Firefox lose that hover warp.
- Cert floating preview is desktop-hover only; touch gets inline thumbnails.
- Pinned gallery + keyboard: focusing an off-screen tile remaps to a scroll position (tested in Chromium only).
- Fonts are self-hosted (latin subset only, assets/fonts); non-Latin glyphs fall back to system fonts.
- Tested only in Chromium (Playwright, SwiftShader GL); not on real touch devices or Safari/Firefox.
- No deep-linking to a case study URL.

## Round 3 changes
Pinned gallery sized from 100svh (verified 1366x657, 1440x900); whole-tile click anchored to tile; About/heading spans no longer aria-hidden;
no-JS nav is a plain wrapped link row; portrait phones get tall-condensed hero lettering + tap ripple; nav now has a theme-aware blurred
backdrop (replaces blend-difference); skill separators removed; black focus ring on tiles; cursor rAF stops when settled; "20,000+" static
text matches counter; counter 1.3s; fonts self-hosted; 3D pointer tilt on project tiles. Not changed: View Transition morph stretch and
instant scroll-restore on close (kept; low value vs risk).
