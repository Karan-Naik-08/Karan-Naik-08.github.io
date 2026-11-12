# Hostile review of Contestant B ("Mission Control")

Tested: Playwright Chromium at 1440x900, 390x844 (touch) and 360 to 2560 widths, with JS disabled and with fonts blocked. Console: 0 errors, 0 failed requests. Horizontal overflow: none at any width tested.

## Content accuracy
Every bullet, metric, cert (title, meta, link, image), all 7 projects (Problem/Approach/Result, tech, repo links), skills, education, and contact details are present and match the original. The automated text diff only flagged the job meta lines, where date and location are reordered ("Nov 2024 – Present · Mumbai" instead of "Mumbai · Nov 2024 – Present"). The facts are the same. All 5 cert images load. There is one fabricated number (see MAJOR 3).

## BLOCKER
None.

## MAJOR
1. **Hero globe draws over the headline copy.** `css/style.css:45-53` and `js/app.js:98` (cx = W*0.66, R up to H*0.4).
   - Repro: load at 1440x900. Globe dots and wires cross "Naik", the lead text ("Big Rattle") and the eyebrow.
   - Worse on mobile 390: the globe sits behind the whole "STATUS / Karan Naik" block, and the eyebrow text is struck through by dots.
   - Fix: add a gradient scrim behind `.hero-copy`, or move the globe lower and right on mobile (cy = H*0.28 and R smaller). Alternatively give the copy a solid backdrop.
2. **Focus is lost after closing a window opened from the palette.** `js/app.js:259, 172-174, 151`.
   - Repro: Ctrl+K, type "multi", Enter, then Esc. `document.activeElement` ends up as BODY.
   - Cause: `runPal` hides the palette without restoring focus, so `openProject` records the just-hidden `#pal-input` as `lastFocus`.
   - Impact: a keyboard user loses their place and the next Tab restarts at the top of the page.
   - Fix: in `runPal`, call `pal.hidden = true; lastFocus?.focus()` before `a.run()`. In `openProject`, only set `lastFocus` if the active element is not inside `#palette`.
3. **Invented stat in the boot screen.** `js/app.js:284`: "loading skills.so (45 modules)". The site lists 28 skills (16+6+6).
   - The same line says "5 certificates verified", which claims verification that does not happen.
   - Fix: change to "28 skills" and "5 certificates linked".
4. **Metric 20000+ overflows its gauge ring.** `css/style.css:93`, `.num` at 1.45rem Unbounded.
   - Repro: at 1440 the text "20000+" is wider than the ring and collides with the stroke.
   - It also lacks a thousands separator, while the bullets say 20,000+.
   - Fix: format as 20,000+ at about 1.1rem, or shrink the font by digit count.
   - Related: the count-up drops the suffix until the animation finishes (`js/app.js:44`). Mobile mid-animation shows "80" and "95" with no %, so it flickers.
5. **Nav links clip at tablet width.** `css/style.css:25`, `.links{overflow-x:auto}` with the clock and kbtn taking the space.
   - Repro: at 820px, "experience" is cut off. At 761-1000px the "projects", "education" and "contact" links are only reachable by scrolling an invisible scrollbar.
   - Mobile (390): the row is scrollable, but "projects" is clipped with no scroll affordance.
   - Fix: hide the clock below 1000px, shrink kbtn to an icon, and add an edge fade or a hamburger menu.

## MINOR
1. **Palette is not a true modal.** `js/app.js:261-266` and `index.html:228`. `aria-modal` is set but the background is not `inert`, and Tab is simply swallowed. Screen-reader virtual cursors can still leave the dialog. Fix: set `inert` on `main`/`header` while open (the notes admit this).
2. **Hover lift on project cards is dead.** `css/style.css:105` vs `162-163`. `.js .reveal.in{transform:none}` (specificity 0,3,0) beats `.proj:hover`, and `.reveal`'s transition overrides `.proj`'s border transition. The `.tile` spotlight still works. Fix: use `.js .reveal.in:not(:hover)`, or a different reveal mechanism such as the `translate` property.
3. **Outlined monograms render with glyph-overlap artifacts.** `css/style.css:110`. `-webkit-text-stroke` on the variable Unbounded font shows inner contour lines (visible on EF, SP, DS, MA). Fix: use `paint-order` with a solid fill, or SVG text, or drop the stroke and use a low-opacity fill.
4. **Project cards: title baselines and grid.**
   - Titles are bottom-anchored via `margin:auto 0 0`, so they sit at uneven heights (P-03 "Tweet Emotion" vs P-04 "Easy Finance"). The empty 8th cell at 4 columns looks unfinished. Fix: put a CTA or "7 case studies" tile in that cell.
   - The mono-mark and "OPEN ▸" pseudo-text are read by screen readers inside the button name, giving "P-01 MA Multi-Agent..." (`css/style.css:112`, `index.html:134`). Fix: `aria-hidden` on `.idx` and `.mono-mark`, and put the title in an `aria-label`.
5. **Touch drag on the globe.** `css/style.css:46` has no `touch-action`. The canvas fills the whole hero, so a vertical swipe starts page scroll and the pointer events are cancelled, which makes spin-drag flaky on phones. Fix: `touch-action:pan-y` plus handling horizontal drag only.
6. **Terminal `hire` auto-navigates to mailto after 600ms.** `js/app.js:208`. It launches the mail client with no confirmation, which is surprising and can navigate away on mobile. Fix: print the link and let the user click it.
7. **Ctrl+K does nothing inside the terminal input.** `js/app.js:216`, `stopPropagation` on every keydown. Fix: let modifier combos bubble.
8. **Terminal and window UX.** Opening a project over the terminal covers it. Windows are cascaded and unresizable. On mobile, bottom sheets have no backdrop, no swipe-to-close and no scroll lock. "Copy email address" in the palette gives no feedback. The "Open terminal (`)" hint and the footer tip show a backtick key that mobile users do not have.
9. **Fonts come from Google Fonts, not the allowed CDN list in the brief.** `index.html:10-12`. It degrades fine: verified with fonts blocked, system fonts are used and layout holds. Fix: self-host or accept the brief deviation.
10. **Paint cost on laptops and phones.** `css/style.css:10-11`.
    - `background-attachment:fixed` plus `background-blend-mode` plus a fixed full-screen `::before` plus `backdrop-filter` on the sticky bar is a repaint hotspot. iOS ignores fixed backgrounds.
    - `js/app.js:17-23` calls `getBoundingClientRect` on every pointermove (layout reads).
    - The globe creates a new radial gradient every frame (`js/app.js:99`).
    - Fix: drop blend-mode, move the grid to a pseudo-element, rAF-throttle the pointermove handler, and cache the gradient.
11. **Skip link target `#hero` is a non-focusable section** (`index.html:17`). Fix: add `tabindex="-1"` to `#hero` and `main`.
12. **Experience gauges are semantically meaningless.** The 20000+ and 900+ gauges are drawn as 100% sweeps (disclosed in small print at `index.html:105`). To a recruiter, "full ring" reads as a score. Fix: replace them with plain large numerals, or make the rings clearly decorative.
13. **Cliché and clutter.** The neon-on-ink terminal/bento look is very 2023 "dev dashboard". The fake ticker (SIM-ALPHA etc.) adds noise, though it is honestly labelled.
14. **Reveal-on-scroll hides tiles until the IntersectionObserver fires.** There is a 2.5s safety net, and no-JS is fine. The risk is low.

## Genuinely strong
- Content fidelity is excellent: nothing omitted, all links and images intact.
- No-JS works: the `.js` class gating shows static case studies and full gauges. Reduced-motion is respected. The boot is skippable, under 2s and shown once per session.
- The command palette (Ctrl/Cmd+K) is a real signature interaction with proper keyboard control (arrows, Enter, Esc) and aria-activedescendant. The working terminal (help, exp, open N, certs, goto, sudo, hire) is delightful and uses the real DOM content, so it cannot drift from the page.
- Draggable, stackable case-study windows with Esc-to-close the top one, and bottom sheets on mobile.
- The globe pauses offscreen and when the tab is hidden, and DPR is capped at 2. Zero console errors and zero horizontal overflow from 360 to 2560.
- High-contrast text (dim `#93a4b8` on near-black is about 7:1), visible focus rings, and decorative data honestly labelled "SIMULATED".
- At 2560 the grid is capped at 1500px and centered, but the left and right margins look empty. This is acceptable.

## Scores
- Wow: 7/10. Polished and coherent, but the concept is familiar, and the 2D canvas globe is overlapped by the headline.
- Polish: 6.5/10. Globe-over-text, the ring overflow, tablet nav clipping and the monogram stroke artifacts are all visible in the first minute.
- Robustness: 8/10. No console errors, no overflow, no-JS and no-font fallbacks work. The focus-loss bug, the non-inert modal and touch drag are the gaps.
- Content-accuracy: 9/10. Page content is identical; the only deduction is the invented "45 modules" and "verified" claim in the boot sequence.
