# Task: "Atlas" — the atls. home screen becomes an interactive 3D Earth

Turn the **Home tab** of the atls. app (React Native 0.86 / Expo SDK 57 / Expo Router / Skia 2.6 / Reanimated 4 / zustand) into a full-screen, physically-lit, tappable globe that shows *the user's own world*: countries they visited / lived in / want to visit glow on it permanently. The existing home content moves into a draggable bottom sheet over the globe. Replace the flat map on Home with this.

Read `CLAUDE.md` and `AGENTS.md` first and follow them (lint + typecheck before declaring done, `npx expo install` for deps, TR/EN via inline `lang === 'tr' ?`, Turkish code comments are fine).

**Do not commit, push or open a PR. Leave changes in the working tree.**

The look and feel come from a web/Three.js prototype. Its *interaction feel and numbers* are the spec; its web stack is **not**. §0 replaces the web stack.

## Scope

**In this task (phase 1):**
1. The globe (lit sphere, drag + momentum, starfield, tap-to-pick every country, ocean ripples).
2. Permanent per-status tinting of the user's countries (visited / lived / wishlist).
3. Home integration: globe is the Home screen; existing Home content lives in a bottom sheet; country details open in the same sheet.
4. Opening cinematic and the "new country added" celebration on the globe.

**Not in this task (phase 2) — do not build, but don't make them hard to add:** travel routes drawn as arcs between countries from `useTripStore`; shareable globe card for `PassportShareModal`. Keep globe state (rotation, projection helpers, `lonLatToScreen`) importable so an overlay layer can be added later.

**Work in two stages and stop to verify between them:**
- **Stage A** — build the globe as a standalone component, mount it temporarily in a throwaway modal/route, and verify look + performance in the simulator (§9). Do not touch HomeScreen yet.
- **Stage B** — integrate into Home (§1) only after Stage A looks right (bright, picks correctly, smooth). Remove the temporary mount.

---

## 0. Stack translation (web → this app)

| Web prototype | Here |
|---|---|
| Three.js + `ShaderMaterial` + Raycaster | **One `@shopify/react-native-skia` runtime shader (SkSL)** that ray-traces the sphere analytically per pixel. No `three`, no `expo-gl`. |
| GSAP | Reanimated 4 shared values (`withTiming`, `withDecay`, `Easing`) |
| `requestAnimationFrame` loop | Skia `useClock` / Reanimated `useFrameCallback`; uniforms from `useDerivedValue` so **no JS work per frame** |
| Pointer events, wheel, hover | `react-native-gesture-handler` (`Gesture.Pan`, `Gesture.Tap`). Not installed → `npx expo install react-native-gesture-handler` and wrap the app in `GestureHandlerRootView` if not already. No wheel, no keyboard, no hover. |
| DOM overlays + CSS keyframes | RN views + Reanimated; glass via `expo-blur` / existing `GlassCard` |
| Remote CDN textures | **Bundled assets** (`assets/globe/…`) — the app is offline-first. Load with Skia `useImage(require(...))`. |
| Desktop vs mobile | **iPhone only.** Support 375×667 (SE), 393×852, 430×932; respect safe-area insets. |
| Poppins + Geist | The app's existing `fonts` (`src/theme/typography.ts`, Instrument Serif display). No new font families. |
| Blue stage, red hover | App theme tokens (`src/theme/*`, dark + gold accent). Gold = selection; per-status tints (§5). |

## 1. Home integration (Stage B)

First read `App.tsx`, `src/components/HomeScreen.tsx` (~1100 lines, a `ScrollView` containing the current `WorldMap` section + `InteractiveMapModal`), `AppHeader`, `BottomNav`, and grep for every use of `WorldMap` / `InteractiveMapModal` before changing anything.

- **Globe = background of Home.** Full-bleed Skia canvas on the dark stage behind everything on the Home tab.
- **Overlay (top, over the globe):** minimal. Greeting/avatar from the existing header and *one* stat line, e.g. `23 countries · 11% of the world` (counts from `useCountryStore`; denominator = the app's own country catalog length, not a hardcoded 195). Nothing else floats over the globe — no HUD chrome.
- **Bottom sheet** (hand-rolled with Reanimated + gesture-handler unless `@gorhom/bottom-sheet` is already a dependency; don't add a new library just for this). Three snap points: **peek** (~16% of height, shows a handle + the first row of summary), **half** (~55%), **full**. The sheet *hosts the existing Home content* (level, achievements, journeys, plans, etc.). Move that content out of the old `ScrollView` into the sheet's scroll area with minimal edits — keep its components and store wiring as they are; remove only the old map section.
- **Gesture ownership (the hard part):** horizontal-dominant pan on the globe region rotates the globe; vertical drag on the sheet handle/header moves the sheet; the sheet's inner `ScrollView` scrolls only when the sheet is at **full** and its scroll offset is 0 → otherwise vertical drags move the sheet. Use `activeOffsetX/failOffsetY` and `simultaneousWithExternalGesture` / `Gesture.Native` as needed. Verify there is no state where the user can't scroll the content or can't rotate the globe.
- **Country selection** swaps the sheet content *in place* to the country view (§6), snaps the sheet to **half**, and flies/raises the globe so the country is visible above it. Closing returns to the Home content at its previous snap point.
- **Bottom tab bar** (`BottomNav`) stays where it is; the sheet sits above it.
- **Lifecycle:** `App.tsx` keeps all three tabs mounted with `display: none`. The globe canvas must **render only while the Home tab is active and the app is `active`**; otherwise stop the clock (and keep the last frame). Modals opened over Home may keep it rendering at idle, but stop it for full-screen modals that cover it.
- **Old map code:** delete the `WorldMap` / `InteractiveMapModal` usage *from HomeScreen*. Delete the files themselves only if nothing else imports them; otherwise leave them.

## 2. The beats

1. **Opening cinematic (every cold start of Home).** Dark veil over the stage while day + night + id textures decode (reuse the loading-state pattern of `warmMapShapes` in `App.tsx`; no flash of untextured sphere). Veil fades up, globe scales `0.001 → 1` (1.8 s, ease-out-cubic), then eases from a neutral view to rest **centred on the user's home country** (`useProfileStore` nationality/location; fall back to Türkiye, then to yaw ≈ 4.0 rad = Middle East). Stars fade in. Slow idle auto-spin afterwards (0.028 rad/s). The overlay stat line and sheet peek rise in as a delayed second beat. Keep it ≤ 2.5 s total and skippable by touch (touching cancels remaining easing).
2. **Spin.** One-finger pan rotates (yaw + pitch, pitch clamped ±1.2 rad) with momentum (`withDecay`, feels like ×0.94/frame). Auto-spin pauses while a country is open or the sheet is above peek. Starting a drag cancels any running fly-to.
3. **Tap a country** → gold selection + light haptic → globe **flies it to face the camera** (shortest path, 1.3 s ease in-out) and moves up so it clears the sheet → sheet switches to the country view (§6).
4. **Tap open water** → concentric **ripples** spread from the touch point and a dimmed ocean name (Pacific/Atlantic/Indian/Southern/Arctic from a coarse lon/lat classifier) shows near the finger for ~1.2 s. No selection.
5. **Switch country** while one is open → details transition **in place** (§6). Never re-open from blank, never overlap two titles.
6. **Close** (swipe sheet down to peek / ✕ in the country header) → sheet eases back, globe glides home (tilt → 0, y → 0, ~1 s). Nothing snaps.
7. **Celebration — country newly marked visited or lived** (from `AddCountryModal`, `CountryStatusModal`, or anywhere that writes `useCountryStore`):
   - Detect by diffing store statuses (subscribe in the globe component; ignore the initial hydration and cloud-sync loads — only user-initiated transitions into visited/lived).
   - If Home is not visible (modal over it), **queue** and play when Home is visible again.
   - Play: globe flies to the country (1.3 s) → the country *fills* with its status colour over ~0.9 s as a radial/linear sweep from the label point plus a brief brighter pulse (driven by `celebrateId` + `celebrateT` uniforms) → success haptic → trigger the existing confetti/celebration system (`useCelebrationStore` / `CelebrationLayer`) and let existing achievement toasts keep working. Then settle back to idle. Don't open the country sheet automatically.
8. Wishlist additions get a smaller version: fly-to + soft pulse, light haptic, no confetti.

## 3. Assets (bundle them; do not hotlink)

Create `scripts/build-globe-assets.mjs` (the repo has `scripts/build-country-facts.mjs` and devDeps `d3-geo`, `topojson-client`, `world-atlas` — reuse them) and commit the outputs under `assets/globe/`:

| File | Spec |
|---|---|
| `earth-day.jpg` | NASA Blue Marble "land & oceans", equirectangular 2:1, **4096×2048**, JPEG q≈80, snow-minimal/green. Also produce a 1024×512 version for an instant first frame, then swap to the 4096 one when decoded. |
| `earth-night.jpg` | City lights, 2048×1024 |
| `earth-clouds.png` | Optional. Skip in v1 if it costs frame time; the effect is an ~8%-alpha whisper. |
| `country-id.png` | **4096×2048**, R = country index (1…N, 0 = ocean), G=B=0, A=255 |
| `country-index.json` | `{ [id:number]: { iso2, labelLon, labelLat } }` + sorted name list for search |

Sources (public domain / permissive): NASA day map via Wikimedia (`Whole_world_-_land_and_oceans.jpg`), `earth_lights_2048.png` from the three.js examples repo. Document the sources and licences in the script header. Drop the specular map: **ocean mask = `id == 0`**.

**ID map generation (offline; replaces runtime canvas rasterisation and its antialiasing hacks):**
- Rasterise countries with `d3-geo` `geoEquirectangular` onto a 4096×2048 buffer with **antialiasing off** (`canvas`/`@napi-rs/canvas`, `antialias: 'none'`, `imageSmoothingEnabled = false`, even-odd fill). No AA ⇒ no garbage border ids ⇒ no runtime 3×3 vote needed.
- Map world-atlas numeric ISO codes → ISO alpha-2 using the same dataset `build-country-facts.mjs` uses, so ids match `Country.id`. Assert `N ≤ 254`.
- Tiny nations (Singapore, Malta, Monaco, Liechtenstein, Vatican, Maldives, …) must survive at 4096 px; if any vanish, draw a minimum-size dot at the label point or list them in your final report.
- Skia must sample the ID map with **nearest** filtering, no mipmaps, no colour management.

## 4. The globe — one SkSL shader

One Skia `<Canvas>` with a `<Rect>` filled by `<Shader source={…}>` and `<ImageShader>` children for the textures. Orthographic ray–sphere is fine on a phone. Radius in px ≈ `min(width*0.41, height*0.31)`; centre it in the area above the sheet's peek.

**Skia-specific traps (differ from GLSL — handle explicitly):**
1. **Texture coords are pixels, not 0–1.** `tex.eval(float2(u*W, v*H))`; give each `ImageShader` a rect equal to the image size and pass `W,H` as uniforms. Wrap longitude manually with `fract(u)`.
2. **Colour space is inverted vs. the prototype.** Skia returns sRGB-encoded texels as-is; the prototype's final `pow(col, 0.4545)` assumed linear texels. Either decode (`pow(tex, 2.2)`) → light in linear → encode at the end, or light in gamma space and retune constants. **Verify against the target look: "bright, not dark" is an acceptance criterion.** Don't copy the pow blindly.
3. Linear filtering for day/night/clouds (try mipmaps to avoid shimmer on the rotating globe), **nearest** for ID map and status LUT.
4. Every `smoothstep(a,b,x)` must have `a < b`.
5. Edge antialiasing via alpha `1 - smoothstep(1 - 1.5/radius, 1, sqrt(r2))`, premultiplied output; no hard discard.

**Reference translation to start from (compile it, then tune against the simulator):**

```glsl
uniform shader dayTex; uniform shader nightTex; uniform shader idMap; uniform shader statusLut; // 256x1
uniform float2 dayRes; uniform float2 nightRes; uniform float2 idRes;
uniform float2 center; uniform float radius;
uniform float3x3 toLocal;      // inverse of Rx(tiltX)·Rz(-0.409)·Ry(spinY)
uniform float3 sunDir;         // normalize(0.32, 0.18, 0.95), WORLD-fixed → terminator sweeps
uniform float selectId; uniform float3 selectColor;      // theme gold
uniform float celebrateId; uniform float celebrateT; uniform float2 celebrateOrigin; // lon/lat rad
uniform float3 oceanDir; uniform float oceanActive; uniform float oceanTime;

half4 main(float2 xy) {
  float2 p = (xy - center) / radius;
  float r2 = dot(p, p);
  if (r2 > 1.0) return half4(0.0);
  float3 nW = float3(p.x, -p.y, sqrt(1.0 - r2));        // world normal, +z toward camera
  float3 nL = toLocal * nW;                              // geometry-local direction
  float u = fract(atan(nL.z, -nL.x) / 6.2831853 + 1.0);  // matches SphereGeometry UVs
  float v = acos(clamp(nL.y, -1.0, 1.0)) / 3.14159265;   // 0 = north pole (image row from top)
  float3 s = normalize(sunDir);
  float day = smoothstep(-0.32, 0.18, dot(nW, s));       // soft terminator
  float3 dayCol = dayTex.eval(float2(u * dayRes.x, v * dayRes.y)).rgb;
  float3 nightCol = nightTex.eval(float2(u * nightRes.x, v * nightRes.y)).rgb;
  float sid = floor(idMap.eval(float2(u * idRes.x, v * idRes.y)).r * 255.0 + 0.5);
  float ocean = 1.0 - step(0.5, sid);

  float3 viewDir = float3(0.0, 0.0, 1.0);
  float3 col = dayCol * (0.48 + 1.05 * day);
  col += nightCol * (1.0 - day) * 0.5;
  float spec = pow(max(dot(nW, normalize(s + viewDir)), 0.0), 42.0) * ocean * day;
  col += spec * float3(0.7, 0.82, 1.0) * 0.28;
  col = mix(col, col * float3(0.72, 0.86, 1.12), ocean * 0.5);   // deepen oceans
  float facing = max(nW.z, 0.0);
  col *= mix(0.86, 1.0, smoothstep(0.0, 0.5, facing));           // limb darkening

  // permanent user-status tint from a 256x1 LUT keyed by id (§5)
  half4 st = statusLut.eval(float2(sid + 0.5, 0.5));
  float tintAmt = st.a * 0.42;
  // celebration: the celebrated id is filled progressively from its label point outward
  if (abs(sid - celebrateId) < 0.5 && celebrateId > 0.5) {
    float lon = atan(nL.z, -nL.x); float lat = asin(clamp(nL.y, -1.0, 1.0));
    float d = length(float2(lon - celebrateOrigin.x, lat - celebrateOrigin.y));
    float fill = 1.0 - smoothstep(celebrateT * 0.5 - 0.06, celebrateT * 0.5, d);   // a < b
    tintAmt = max(tintAmt * fill, 0.0);
    col += st.rgb * fill * (1.0 - celebrateT) * 0.5;                                 // brief pulse
  }
  col = mix(col, st.rgb, tintAmt);

  float sel = step(0.5, selectId) * (1.0 - step(0.5, abs(sid - selectId)));
  col = mix(col, selectColor, sel * 0.62);
  col += sel * pow(1.0 - facing, 3.0) * selectColor * 0.4;       // rim

  if (oceanActive > 0.001) {                                       // ripples = geodesic circles
    float d = acos(clamp(dot(normalize(nL), oceanDir), -1.0, 1.0));
    float env = 1.0 - smoothstep(0.0, 0.16, d);
    float crest = pow(max(sin(d * 78.0 - oceanTime * 3.0), 0.0), 3.2) * smoothstep(0.014, 0.05, d);
    float touch = 1.0 - smoothstep(0.0, 0.02, d);
    col += (crest * env * 0.72 + touch * 0.32) * ocean * oceanActive * float3(0.52, 0.8, 1.0);
  }
  float edge = 1.0 - smoothstep(1.0 - 1.5 / radius, 1.0, sqrt(r2));
  return half4(half3(col) * half(edge), half(edge));               // premultiplied
}
```
(The celebration block is a sketch — the lon/lat distance needs longitude wrap handling; fix it. For the celebration the LUT must already contain the new country's colour while `celebrateT` animates 0→1.)

**Scene math** (`globeMath.ts`, pure functions, unit-tested): axial tilt fixed `-0.409`; transform `Rx(tiltX)·Rz(-0.409)·Ry(spinY)`; pass its inverse as 9 floats. Also expose `lonLatToScreen` and `screenToLonLat` for phase 2.

**Starfield:** separate light Skia layer behind the globe (≈ 400–600 points on a seeded shell, size `1.8 + pow(rand, 2.6) * 4.4`, subtle twinkle from the clock), fixed on screen as the globe spins. **Stage:** dark radial gradient from theme tokens + vignette; add a faint noise/dither overlay if gradient banding shows. No atmosphere rim by default.

## 5. Picking and status tint

1. **One ID map serves GPU and CPU.** Decode `country-id.png` once, keep its R channel as an 8 MB `Uint8Array` (`image.readPixels`) for CPU lookups, keep the `SkImage` for the shader.
2. **Pick on tap only** (no per-move hover): `p = (xy - center)/radius`, reject if `|p| > 1`, `nW = (px, -py, sqrt(1-r²))`, `nL = toLocal·nW`, `u = fract(atan2(z,-x)/2π + 1)`, `v = acos(y)/π`, read `ids[floor(v*H)*W + floor(u*W)]`; run via `runOnJS` from the tap handler. Share the math with the shader's definition and unit-test a round trip (lon/lat → rotation → screen → pick returns the same lon/lat).
3. id 0 → ocean → classify name from lon/lat, set `oceanDir = nL`, start ripple.
4. **Status LUT:** 256×1 RGBA `SkImage` built from `useCountryStore` — visited / lived / wishlist get distinct theme colours with alpha ≈ 1, everything else alpha 0. Rebuild when the store's countries change. Use the same colours `WorldMap`/`PassportScreen` already use for these statuses so the app stays consistent. Wishlist may pulse gently via a time-based alpha modulation.
5. **Fly-to:** from the country's label lon/lat, solve `spinY` and `tiltX` that put it on +z (account for the axial tilt), shortest angular path, animate both with `withTiming(1300, Easing.inOut(Easing.cubic))`, plus a `centerYOffset` shared value so the globe sits above the sheet. Clamp tilt ±1.2.

## 6. Sheet content, country view, search

- **Home mode** = existing Home content (§1).
- **Country mode** (swaps in place; sheet snaps to half):
  1. Big name (display font, uppercase, shadowed) + continent in tracked small caps; ✕ to close. Name slides: outgoing up + fade (0.22 s), incoming rises + fades in (0.32 s).
  2. **Status row** — current status (visited / lived / wishlist / none) with the main call-to-action opening the existing `CountryStatusModal`. Globe tint updates immediately on change, and the celebration (§2.7) plays on return.
  3. Quick facts from `countryFacts.ts`: capital, currency, language, visa for TR passport, driving side, area — compact chips, TR/EN.
  4. **Highlights** if the country has photos in `curatedDestinations` / `routePhotos`: 16:10 featured card (radius 16) paging horizontally with dots and a numbered list under it (active row full opacity, others 50%, 0.85 s glide). Tapping the card opens a full-screen viewer (zoom 1.15 → 1, `COUNTRY · PLACE` eyebrow + title + blurb rising in at 0.3 / 0.4 / 0.52 s, ✕ below the safe-area inset, eases out on close). Countries without photos show `"Highlights for <name> are on the way."` / TR equivalent — never an empty card.
  5. Trivia line from `countryTrivia.ts` if present.
- **Switching country** with the sheet in country mode: keep `shown` and `outgoing` (outgoing held ~560 ms, then dropped). Old details lift + fade (0.32 s); new details rise in after a 0.24 s delay (0.58 s) so two lists never overlap. Drive the swap from a ref + an effect that depends **only on the selection** (depending on `shown` too re-runs the effect and its cleanup kills the drop timer → ghost layer).
- **Search:** a magnifier in the overlay expands into a minimal underline field (glyph + placeholder on a hairline that brightens on focus; quiet glass results list). Matches `name`, `nameTr`, and aliases (`usa/us/america → United States`, `uk/britain/england → United Kingdom`, `uae/dubai → UAE`, `holland → Netherlands`, `czech republic → Czechia`, `burma → Myanmar`, `macedonia → North Macedonia`, `swaziland → Eswatini`, `drc → DR Congo`, `korea → South Korea`, TR: `almanya`, `ingiltere`, `abd`, …). Selecting flies there and opens country mode.
- **Display shortener** for long names in the big title (`United States of America → United States`, `Democratic Republic of the Congo → DR Congo`, `Central African Republic → Central African Rep.`, `United Arab Emirates → UAE`, `Bosnia and Herzegovina → Bosnia & Herz.`, …). Alias + shortener tables live in a pure module with tests.
- Haptics: selection tick on country change, light impact on open, success on celebration, nothing on drag.

## 7. Tunables

| Constant | Value |
|---|---|
| Auto-spin | 0.028 rad/s |
| Axial tilt | −0.409 rad |
| Pitch clamp | ±1.2 rad |
| Sun dir | normalize(0.32, 0.18, 0.95), world-fixed |
| Drag sensitivity | ≈ 0.005 rad/px; momentum via `withDecay` tuned to the ×0.94 feel |
| Terminator | smoothstep(−0.32, 0.18) |
| Fly-to / scale-in / close glide | 1.3 s / 1.8 s / ~1.0 s |
| Celebration fill | ~0.9 s |
| ID map | 4096×2048 |
| Sheet snaps | peek ~16%, half ~55%, full |

## 8. Performance and lifecycle

- Target **60 fps on an iPhone 12-class device** idle-spinning, dragging, and while the sheet moves. All per-frame work on the UI thread (uniforms from `useDerivedValue`). If heavy, cap the canvas pixel ratio (~2) rather than lowering texture quality; drop clouds first.
- Home is the app's first screen, so keep first paint fast: show the 1024 day texture immediately, upgrade to 4096 when decoded; decode off the critical path.
- Stop the clock when Home is not the active tab, when `AppState !== 'active'`, and when a full-screen modal covers it. Dispose images/LUT on unmount.
- Check that existing JS-thread animations on Home (`AnimatedCounter`, confetti, skeletons) don't make the globe drop frames; if they do, move them or pause the globe under them.

## 9. Tests and verification

- Jest (`jest-expo`) next to the code: rotation solver (fly-to lands the label point on +z within 1e-3), screen↔lonlat↔pick round trip, search aliases (EN + TR), display shortener, ocean classifier, status-LUT builder, store-diff celebration detector (ignores hydration; queues while hidden).
- `npx tsc --noEmit` and `npx expo lint` clean.
- **Stage A check in the iOS Simulator** (SE-size and Pro-Max-size) with screenshots: globe bright (not dark), terminator visible, tap Nigeria → "Nigeria" (not Niger), tap Türkiye → selection + fly-to, ocean tap ripples, momentum feels right, no frame drops. Report fps/CPU observations honestly; say if you could not measure on a real device.
- **Stage B check:** Home looks right at all three snap points; globe rotation and sheet scrolling never conflict; tab switching stops/starts the clock; marking a new country as visited plays the celebration; switching countries leaves no ghost layer; nothing clips under the notch, tab bar or home indicator.

## 10. Acceptance checklist

- [ ] Home tab is the globe; old flat map removed from Home; existing Home content intact inside a 3-snap bottom sheet.
- [ ] Opening cinematic: veil fades up, globe scales in and settles on the user's home country, stars fade in, stat line + sheet peek rise in; ≤ 2.5 s; no untextured flash.
- [ ] Lit sphere: sweeping terminator, ocean glint, limb darkening — bright, green day map, clean on dark.
- [ ] Drag spins with momentum, pitch clamped; drag cancels fly-to; globe rotation and sheet/content scroll never conflict.
- [ ] Tap any country (incl. small ones) → correct name, gold selection, haptic, fly-to, sheet switches to country view; ocean tap → ripples + dimmed ocean name, no selection.
- [ ] Visited / lived / wishlist countries are permanently tinted from `useCountryStore` in colours consistent with the rest of the app.
- [ ] Marking a country visited/lived plays the celebration (fly-to, fill sweep, success haptic, existing confetti/toasts); queued if Home is hidden; not triggered by hydration/sync.
- [ ] Country view: name, status CTA → `CountryStatusModal`, facts, highlights or the graceful empty state; TR/EN correct; switching countries transitions in place with no ghost layer.
- [ ] Search (EN + TR + aliases) flies to and opens the country.
- [ ] Clock stops when Home isn't visible or the app is backgrounded.
- [ ] Looks right on 375×667 and 430×932; safe areas respected; light/dark system theme doesn't break the always-dark stage.
- [ ] Tests, `tsc`, lint pass; no new fonts; assets bundled; nothing hotlinked at runtime; routes and share card explicitly left for phase 2.
