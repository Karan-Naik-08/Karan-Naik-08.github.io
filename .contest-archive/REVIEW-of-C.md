# Hostile review of Design C ("Kinetic editorial")

Tested in Chrome headless (SwiftShader GL) at 1440x900, 1366x657, 1280x640, 2560x1300, 800 and 390 mobile (touch). Also tested with CDNs blocked and with reduced motion. Page console errors: none (only SwiftShader ReadPixels perf warnings). No horizontal overflow at any size tested.

## Content accuracy
I diffed every item against ../../index.html and ../../js/project-modal.js. These all match verbatim:
- 4 metric tiles and 7 role bullets
- 5 certificates: titles, meta, links, images
- skills: 3 groups, 28 items
- 7 projects: Problem/Approach/Result text, tech, and repo links. GameSphere and the multi-agent project correctly have no repo.
- education, CGPA 8.75 and Honors CGPA 7, contact links

I found no invented facts. Differences:
- Case-study "next" cycling shows the correct repo button hide/show.
- The stats show "20000+" without a comma when reduced motion is on, JS is off, or GSAP is blocked. They show "20,000+" once the counter runs. Minor inconsistency.

## BLOCKER
None found.

## MAJOR

1. **Pinned gallery is clipped on common laptop viewports.**
   - Location: css/style.css:130 and :139. `#projects` has `min-height:100svh`, but its content is taller than the viewport at heights of about 700px or less.
   - Repro: at 1366x657, section height is 764px, the progress bar bottom is at y=806 (viewport is 657) and the "Read case study" CTA is at y=721. At 1280x640 the tile is cut off at the bottom the same way.
   - Impact: while pinned, the CTA text, the progress bar and the tile bottom edges are off-screen. This is the most likely bug on a recruiter's MacBook with browser chrome.
   - Fix: make the layout fit `100svh`. For example size `.tile` as `height:clamp(300px,calc(100svh - 330px),520px)` with `min-height:0`, and shrink the padding and `.proj-head` on `max-height:760px`. Alternatively use `height:100svh` on the section with `overflow:hidden`.

2. **About paragraph is not reliably accessible.**
   - Location: js/app.js:157. The code puts `aria-label` on a `<p>` and sets `aria-hidden` on every word span.
   - Impact: `aria-label` is not supported on a generic paragraph element, so VoiceOver/NVDA may announce nothing. The About text is then effectively empty for screen readers.
   - Fix: keep the real text in the DOM and don't use `aria-hidden`. Use `<span class="aw">` without `aria-hidden`, or add a `.sr-only` copy of the sentence and `aria-hidden` the animated copy. Do the same check for `.split` headings; `aria-label` on `<h2>` is fine there.

3. **"Whole tile clickable" is false.**
   - Location: css/style.css:141 and :145. The `::after` overlay is positioned against `.t-body`, which is `position:relative`, not against `.tile`.
   - Repro: click the top-left corner of a tile (over the big numeral). Nothing opens (`open after corner click: False`). Only the title and CTA area works, even though the tile turns orange on hover and promises a click.
   - Fix: remove `position:relative` from `.t-body` so the `::after` anchors to `.tile`, which is already `position:relative`.

## MINOR

4. **No-JS mobile navigation is dead.** css/style.css:49 and :50-52. The Menu button shows at 1000px or less, but `#nav-links` is `display:none` unless JS toggles `.open`. Without JS the user cannot navigate. Fix: only hide links under `.js`, and only show the toggle under `.js`.

5. **Mobile hero is underwhelming.**
   - Location: js/hero.js:63. The name is capped by width and takes about 250px of 390px, bottom-left, with about 55% of the hero empty black above it. The idle virtual cursor keeps the name orange-tinted all the time.
   - Impact: the signature moment is weaker on a phone, and the hero-hint is hidden on touch. Fix: for portrait, stack larger or add touch-drag interaction (`pointermove` already works on touch, so `touch-action` and a visible hint would help).

6. **Hero text is not selectable or findable.**
   - The real h1 is clipped to 1px when `.gl` is set (css:63). In-page find and select do not work on the name. It is acceptable for SEO and a11y, but it is a known cost.
   - Hero name sits about 12px from the right edge at 1440 (N glyph) vs 57px on the left. The right margin is visibly tighter. Fix: reduce `s` by about 3% or account for the tilt.

7. **Projects tiles on mobile.** The native scroller has large empty space inside each tile, because the outline numeral takes about 45% of the height with an `align:space-between` layout. Not broken; just sparse.

8. **Nav has no backdrop.** css/style.css:42 uses `mix-blend-mode:difference` with no background. Nav links overlap headline and marquee text when scrolling (visible in screenshots over "Tools of the trade" and the marquee). It looks messy during scroll. Fix: add a small gradient or backdrop-blur band, or hide the nav on scroll down.

9. **Skills trailing slash.** css/style.css:93 draws "/" after each item including the last item on a wrapped line, so some lines end in a dangling "/". Cosmetic. Fix: use `gap` with a leading separator, or drop the separators and use spacing.

10. **Counter formatting inconsistent** (see Content accuracy) and counters fire `once` with a 2s count, so a recruiter who skims sees "13,839+" mid-count. This is fine but slow. Fix: reduce to about 1.2s.

11. **Fonts depend on jsdelivr.** index.html:13-14 load from the CDN. When blocked, the page falls back to Georgia and the hero GL text is drawn in Georgia. It is graceful (tested), but the look changes a lot. Fix: self-host the two woff2 files.

12. **View Transition quirks.** The title morph stretches (the author admits this). `closeCase()` then calls `revealTile()` which jumps the scroll position instantly, so a viewer who was on tile 7 and went "Next" around to 01 returns focused to tile 01 with no scroll animation. It works (verified: focus returns to `.t-open` and scrollY is restored), only the polish is lacking.

13. **Case dialog focus.** Native `<dialog>` handles the trap. Tab cycles through close, next, repo, as expected, and Escape returns focus. No problem found. Note: there is no focus ring on `.t-open` itself (only on tile via `:focus-within`, whose orange background is the indicator), so the 3px outline does show but is orange on orange. Fix: use a `#000` outline on `.tile:focus-within`.

14. **Cursor.** `cursor:none` only applies after the first pointer move and is removed under `.lock`. Verified no stuck cursor and keyboard users keep native visible focus. The custom cursor loop runs a permanent `requestAnimationFrame` (css/js app.js loop) even when idle. Fix: stop the loop when the cursor settles.

15. **Perf risks.**
   - The SVG `feDisplacementMap` filter on the large cert previews and on `.t-num` hover is CPU-heavy on Safari/Firefox (admitted in NOTES).
   - The hero rAF is paused offscreen and when the tab is hidden, which is good.
   - The marquee uses a Web Animations `playbackRate` change on scroll velocity, which is cheap.

## What is genuinely strong
- The hero is a real WebGL shader (ripple, RGB split, tilt, noise) with the name rasterised from the actual font. It idles on its own and is clearly more interesting than a particle background. At 1440 it looks great.
- Pinned horizontal gallery works end to end: scroll maps to track, the 01 to 07 counter and progress bar update, keyboard focus on a tile scrolls the page to it (verified for tiles 1 to 5), and it falls back to a native scroller below 900px and with reduced motion.
- Case-study dialog: View Transition morph, Next cycling across all 7 with correct repo links, Esc and Close return focus to the tile, body scroll lock released.
- The cert cursor preview with displacement is a nice touch and works. Touch and mobile show inline thumbnails.
- Graceful degradation is real: CDN blocked gives a working page, loader removed, content visible. Reduced motion gives no loader, no GL, no pin, and still opens case studies.
- Typography, palette (dark/light inversion with one orange accent) and metric count-up feel Awwwards-like. Content is identical to the original.

## Scores
- Wow: 8.5/10
- Polish: 7/10 (pinned-gallery clip on short laptops, nav overlapping text, mobile hero)
- Robustness: 7.5/10
- Content accuracy: 10/10
