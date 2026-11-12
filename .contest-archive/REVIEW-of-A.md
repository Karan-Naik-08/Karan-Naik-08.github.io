# Hostile review of Design A ("Spatial journey")

Method: served `_contest/a/` on :9101, drove it with Playwright and Chrome (SwiftShader GL) at 1440x900 and 390x844 touch. I scrolled all 8 stations, hovered and clicked the monoliths and list, opened all 7 case studies, used the menu, tabbed through the page, blocked the CDNs, and ran with reduced motion. I also diffed text and links against `../index.html` and `../js/project-modal.js`.

Console: 0 errors, 0 page errors. Only SwiftShader "GPU stall ReadPixels" warnings, which are harmless. No horizontal overflow at 1440 or 390 (scrollWidth equals clientWidth).

## Content accuracy: essentially perfect
- Every text node from the original appears in A, apart from `20000+`, which A renders as `20,000+` (an improvement).
- All 7 projects match Problem/Approach/Result/tech, and the repo links are identical. Projects 0 and 1 correctly have no repo link.
- All 5 certs have matching links, images and meta. Contact, education, skills and experience metrics all match. The href set from the original is a subset of A's.
- Added copy is limited to decorative eyebrows ("Portfolio — 2026", "04 — The path", "Signal", "Scroll to travel", the Projects hint line). None of it is factual.

## BLOCKER
None found. Content is complete, the page does not crash, and it degrades to a readable page with no CDN (tested: `no-webgl`, hero is readable, case dialog works).

## MAJOR

1. **The fixed header collides with scrolling content, on mobile and desktop.**
   - `css/style.css:34` (`.bar`) has only a 90%-to-0 gradient and no solid backdrop. Panels scroll under the brand, the "05 / 08" counter and the Menu button.
   - Repro, desktop: scroll the Experience station. "04 — THE PATH" and "Experience" overprint "Karan Naik" at the top left.
   - Repro, mobile (390): "Karan Naik" and "05 / 08" are drawn over body copy in Experience, and over the "05 — Monoliths" eyebrow in Projects.
   - On desktop the Projects panel top (about y=20) sits under the Menu button.
   - Fix: give `.bar` `backdrop-filter:blur(14px)` and a solid-ish `rgba(7,7,10,.8)` background, or hide the brand and counter while the panel intrudes. Cap panel height to `calc(100svh - 96px)` with an inner scroll, or add `scroll-margin-top`.

2. **The signature 3D is mostly invisible on phones.**
   - `css/style.css:154-156`: at <=900px every `.col` is 100% wide with a 72% opaque panel, so stations 2-7 show nothing but grid slivers (see the mobile screenshots of certs, experience and projects).
   - The monoliths and tiltable cert cards, the headline interactions, do not exist for most recruiters on phones. A recruiter on a phone sees a dark page with a faint grid.
   - Fix: on narrow screens use a half-height sticky 3D window above or below the panel, or collapse the panel to a bottom sheet (30-40vh) so the object is visible. The hero already proves the 3D can work there.

3. **The Experience station looks broken and ugly.**
   - `js/world.js:195-216`: the bars use near-black `dark()` material with a flat lime cap. They read as black slabs.
   - The first bar and its label are clipped by the panel edge: the label shows as "000+". On a 900px viewport the bars are cut off at the bottom of the frame.
   - Bar heights are fake data (flagged as decorative in NOTES, but they imply a ranking). The "20,000+" sprite is wider than the bar spacing.
   - Fix: move the group to the empty right 40% (`shift`), give the bars an emissive gradient material, and scale the labels so they stay on screen. Alternatively replace the bars with rings or counters so the decorative data does not imply a ranking.

4. **Neighbour stations leak into each other.**
   - `js/world.js:392-394`: the visibility window `sstep(1.9, 1.0, d)` shows adjacent stations at partial scale.
   - Skills station: a handful of tiny cert cards float inside the node graph.
   - Projects station: the Education disc stack pokes up behind the "ML"/"DS" monoliths (`d-5-projects.png`).
   - Fix: tighten the window to about `sstep(1.35, 0.9, d)`, or set `visible=false` for stations with `|u-i|>1.2`.

5. **Monolith labels are defaced and the monoliths overlap.**
   - `js/world.js:226-231`: the lime `slit` plane (x=0.3, z=0.17) cuts straight through the italic monogram text on every monolith ("TE", "EF", "MA" are struck through).
   - Neighbouring labels clip into each other ("ML DS"). Spacing is `a=(i-3)*0.14` on R=8, about 1.1 units apart for 0.88-wide slabs, so they nearly touch.
   - Fix: move the slit to x=0.38 or drop it. Raise spacing to about 0.19 rad.

6. **Perf risk on a recruiter's laptop or phone.**
   - `js/world.js:40`: HalfFloat render target with MSAA 4x, plus UnrealBloom at half resolution, plus PMREM, plus the `fwidth` floor shader (`js/world.js:77-84`), all at DPR 2. On integrated GPUs and phones that is heavy.
   - Add multiple `backdrop-filter: blur(16px) saturate` panels (`css/style.css:61`) and a full-screen `mix-blend-mode:overlay` noise layer (`css/style.css:23`) over a continuously animating WebGL canvas. Every frame forces a re-blur of the full-screen canvas region and an overlay blend. This is a known scroll-jank source on Safari and low-end Android.
   - The adaptive downgrade (`js/world.js:369`) only drops DPR and bloom after 90 frames, and it never re-enables or lowers MSAA. `resize()` is called on downgrade, but the MSAA target stays at 4 samples.
   - No power throttling for mobile (no `matchMedia` coarse check up front), and nothing caps frames at 30 on battery.
   - Fix: start with `pr=Math.min(dpr,1.5)` and no MSAA or bloom on `(pointer:coarse)`. Drop the `.fx` noise layer. Remove `backdrop-filter` on mobile (the panel is already 72% opaque).

## MINOR

7. **Contact core is a flat lime faceted blob.**
   - `js/world.js:264` uses `accMat(1,1.1)` with an unshaded icosahedron. It reads as a flat yellow-green disc with visible polygon edges and no depth (`d-7-contact.png`). It is the closing shot and looks the cheapest.
   - Fix: increase detail, add a fresnel or noise shader, or reuse the metallic shell look from the hero.

8. **Section numbering is inconsistent.**
   - The header counter says "02 / 08 About" while the eyebrow on the same panel says "01 — About". Eyebrows run 01-07 and the HUD runs 01-08.
   - Hero has no eyebrow number.
   - Fix: use the same numbering in both, or drop one.

9. **Focus handling.**
   - The skip link (`index.html:27`, `app.js:23-29`) calls `preventDefault` and `scrollTo`, but focus never moves to `#about`. Keyboard users stay on the skip link and the next Tab starts back at the top.
   - Fix: add `el.setAttribute('tabindex','-1'); el.focus({preventScroll:true})` in `goTo`.
   - In the case dialog, Tab cycles to BODY and the dialog itself before wrapping (observed: `case-repo, BODY, DIALOG, x, case-repo`). Native dialogs let focus escape to browser UI, and NOTES admits no trap.
   - Fix: a small keydown trap, or make the rest of the page `inert` while a dialog is open.
   - Positive: focus lands on Close on open, and Escape closes and returns focus to the originating button (verified).

10. **Header counter bounces and the menu icon has weak contrast.**
    - `#where` is `aria-hidden` (fine), but `--mute` at .75rem uppercase over the glowing grid is borderline on bright areas (hero grid, contact glow).
    - Fix: raise it to `--ink` at 70% or add a text-shadow.

11. **Touch picking is unreliable.**
    - `js/world.js:322-326`: `mouse.over`/`ndc` are only updated on `pointermove`, and `hover` is only computed in the frame loop. A tap without a preceding move never sets `hover`. NOTES claims taps work; I could not confirm this (I tapped the DOM list instead, which works).
    - Fix: update `ndc` and call `pick()` inside the `pointerdown` handler.

12. **Possible stale-hover mis-click (low confidence).**
    - In one scripted run, a click at x=180 opened "MyLoc" (index 5) instead of "GameSphere" (index 1). A clean sweep of the same positions mapped correctly (x=180 -> proj:1).
    - Likely an artifact of Lenis still settling after a rapid open/close loop, which would make the camera lag behind the mouse. Real users could still see a mis-click right after scrolling.
    - Fix: ignore canvas clicks while `|u-uT|>0.02`, or re-run `pick()` on the click.

13. **Cert thumbnails are too small to read.**
    - 96px on desktop and 72px on mobile (`css/style.css:86-87`). On mobile the NPTEL cert is illegible, and the 3D cards that would show it are hidden (see #2).
    - Fix: tap a card to expand the image, or raise it to 120px+.

14. **Cliché and look.**
    - The perspective grid floor, lime-on-black and glowing wireframe orbs are firmly synthwave/"Three.js template" territory. NOTES admits it. The Instrument Serif type and the case-study view are strong enough to carry the page, but the 3D props (gyroscope, discs, beacon) are generic. Only the monolith/portal idea is really distinctive.
    - Fix: drop the floor grid to about 0.08 alpha, or replace it with a dot field or a subtle height map.

15. **Hero statics.**
    - The wire icosahedron's flat shell is fine, but the glow halo sprite is clipped by the right edge at 1440.
    - The bloomed rings run through the "Naik" "i" glyph (`d-0-hero.png`), which slightly hurts H1 legibility. The line passing between "a" and "i" is cosmetic, not a contrast failure.
    - Fix: lower the ring opacity behind the text column, or shift the camera `shift` slightly further right.

16. **Reduced motion and no-JS.**
    - Works: Lenis off, no portal animation, no count-up, `.rv` forced visible. Experience bars jump to full height.
    - Menu and case-study dialogs still use `animation:enter` (shortened by the global rule, so fine).
    - `rvfail` fallback shows content at 3.5s even if JS dies (good).

17. **External dependencies.**
    - Fonts, three, lenis and the three/addons all load over the network from unpkg and jsdelivr. The brief allows this. With the CDN blocked, the page degrades well (verified), but three modules load from unpkg as many separate files (EffectComposer, passes and so on). First paint of the 3D on a slow network is delayed, and the boot overlay times out at 1.5s, so the page can appear before the world exists. Not a bug, but acceptable.

## Genuinely strong
- Content fidelity is flawless, including links, repo URLs and the metrics. The counters keep the final text `20,000+`.
- The case-study "portal" is excellent: the lime circle expands from the click point, FOV and bloom warp, and a full-screen dialog opens with a giant italic monogram (`modal.png`). Mobile modal layout is clean (1-col).
- Two-way hover between the DOM list and the 3D monoliths (and cert cards) works, and the custom cursor shows "Enter"/"Open".
- Typography (Instrument Serif and Space Grotesk, one accent) is strong and hierarchical. Hero, About, Education and Skills desktop frames look premium.
- Robustness: no console errors, no overflow, boot overlay capped at 1.5s, tab-hidden pause, context-loss handled, a `no-webgl` fallback, native `<dialog>` with Escape, working menu navigation, and the skip link.
- The adaptive quality idea is good, but it is only partly implemented (see #6).

## Scores (/10)
- **Wow: 7.5.** Desktop hero, about, cert wall and portal are great. The Experience and Projects stations undercut it, and on phones it disappears.
- **Polish: 6.** Header overprint, clipped bars, struck-through monolith labels, stage leaks and the flat contact blob.
- **Robustness: 7.** No errors and good fallbacks, but heavy rendering, no focus trap and the mobile 3D invisibility.
- **Content accuracy: 10.**
