# Supplied assets — where they go

Two files are expected from you. Neither is generated, faked or replaced.

---

## 1. The photograph (binocular / single-eye viewer, 90–100%)

```
public/photo/balakrishnan.jpg
```

- Use the exact high-quality photograph you supplied. Nothing is AI-generated
  in its place.
- **The supplied photograph is a wide 16:9 banner** (subject centred, monitors
  either side, name caption along the bottom edge); the lens is already framed
  for it — see "How the lens treats the photo" below.
- Until that file exists the viewer shows a plain `BM` plate with a note. No
  face is ever invented.
- Referenced from `src/components/Binocular.jsx` (`PHOTO_SRC`).

### How the lens treats the photo

```
exact file -> <img> -> optical lens -> subtle magnification
                                    -> subtle lens reflection
```

- The file is never processed, re-encoded, generated or retouched.
- Magnification is a CSS `scale` on the `<img>`. At rest it is **1.5x**, which is
  also the framing for the supplied photograph: that photograph is a wide
  ~16:9 banner with the subject centred and a "BALAKRISHNAN / MERN STACK
  DEVELOPER / www.balakrishnan.dev" caption printed along the bottom edge, so
  1.5x biased to the top third (`object-position: 50% 13%`) frames the head and
  shoulders and leaves the printed caption outside the circle. If the
  photograph is replaced, adjust `PHOTO_ZOOM` and `PHOTO_FOCUS` at the top of
  `src/components/Binocular.jsx`.
- Hovering or touching the glass adds about 0.15x more; `+` / `-` adjust the
  base between 1.0x and 2.0x. The picture magnifies around the point being
  looked at.
- Reflections (rim highlight, soft window glint, faint surface sweep, edge
  falloff) are separate overlay layers above the image. They do not alter the
  image, and the photo has no CSS filter applied once the short focus-in ends.
- Pointer: move across the glass. Touch: press and drag. Keyboard: Tab to the
  lens, arrow keys move it, `+` / `-` magnify, `0` resets, Esc closes.
- With reduced motion the easing is switched off and the lens just sets.

---

## 2. The beach audio

```
public/audio/beach.mp3
```

- Use the exact beach/ocean recording you supplied. It is looped at low gain
  and is never mixed with music.
- Audio never autoplays. It only starts from the user pressing **Sound**, which
  satisfies browser autoplay policy, and the preference is remembered.
- If the file is missing, a quiet procedural surf bed (filtered noise with two
  slow swells) stands in so the control is never dead. It is deliberately not a
  soundtrack.
- Referenced from `src/lib/useAmbientAudio.js` (`SOURCE`).

---

## 3. Beach reference image

The beach is recreated with shaders, not with a photo texture, so no image file
is needed. The composition (horizon at ~45% height, pale cream sand in the
lower third, turquoise shallows, clean sky) is defined in `src/three/env.js`
(terrain profile, palettes, camera path) and in `src/three/SkyDome.jsx`,
`src/three/Ocean.jsx`, `src/three/Sand.jsx`.

The camera path starts at eye height 2.34 m with the waterline 14 m ahead, so
the first frame puts the sand in the lower third and the horizon at roughly 45%
of the frame. Those are estimates against the supplied reference and are the
first thing to check visually — all of the geometry lives in
`src/three/env.js` with comments.

---

## Serving

The build inlines the code into `dist/index.html`, but the photo and the audio
are copied as separate files. **Serve the whole `dist` folder**, not only that
one HTML file.
