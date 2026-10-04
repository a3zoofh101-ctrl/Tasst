# Ziyad (زياد) — Character Bible

Arabic version: [`ziyad.ar.md`](./ziyad.ar.md).

Use this sheet as the single source of truth whenever Ziyad appears in an image,
video, or voice-over. Every prompt for Ziyad should start from the **Locked
Identity Block** below, word for word. Only the scene, action, camera and
lighting parts change between shots.

---

## 1. Locked identity (never change)

| Attribute | Value |
| --- | --- |
| Name | Ziyad (زياد) |
| Nationality | Saudi |
| Age | 30 |
| Height / build | ~178 cm, average masculine build, natural proportions |
| Face shape | Masculine, oval-to-rectangular face, defined jawline, straight strong nose with a slight natural Arabian bridge |
| Skin | Medium tan, warm olive undertone, natural texture with visible pores, no airbrushing |
| Eyes | Dark brown, almond-shaped, calm steady gaze |
| Eyebrows | Thick, natural, dark black, softly arched, not over-groomed |
| Hair | Short, black, neatly styled; tapered sides (mostly hidden under the shemagh) |
| Beard | Short, well-groomed, full black beard with a clean cheek line and neat connected moustache |
| Default expression | Calm, confident, subtle natural smile — never a wide grin |
| Outfit | Clean, crisp white Saudi thobe; red-and-white shemagh (checkered *shmagh*) with black *agal*, worn naturally in a modern Saudi style |

### Locked Identity Block (copy into every prompt)

```
Ziyad, a 30-year-old Saudi man with authentic Arabian facial features, medium tan
skin with warm olive undertones and natural skin texture, short neatly styled black
hair, dark brown almond-shaped eyes, thick natural black eyebrows, short
well-groomed full black beard with a clean cheek line, masculine face with a
defined jawline and a straight strong nose, calm confident expression with a
subtle natural smile, average masculine build, about 178 cm tall, wearing a clean
crisp white Saudi thobe and a red-and-white shemagh with a black agal worn
naturally in a modern Saudi style
```

### Style Block (copy into every prompt)

```
ultra-realistic cinematic photography, photorealistic, natural skin texture with
visible pores, realistic facial details, professional soft lighting, natural
proportions, shot on a full-frame camera with a 50mm or 85mm lens, shallow depth
of field, true-to-life colors, subtle film grain, not AI-looking
```

### Negative prompt (use wherever the tool supports it)

```
cartoon, anime, illustration, 3D render, CGI, plastic skin, airbrushed, waxy skin,
overly smooth face, beauty filter, exaggerated expression, wide grin, open-mouth
laugh, distorted face, asymmetrical eyes, extra fingers, deformed hands, long hair,
grey hair, blond hair, light eyes, blue eyes, green eyes, clean-shaven, stubble only,
long beard, goatee, overweight, bodybuilder, skinny, teenager, old man, wrong
headwear, all-white ghutra, turban, dirty or wrinkled thobe, watermark, text, logo
```

---

## 2. Personality & performance

- **Traits:** calm, confident, mature, slightly serious, quick-witted, charismatic.
- **Energy:** low-key and grounded. He lets the line land instead of selling it.
- **Expressions:** small and real — a slight smile, a raised eyebrow, a short
  knowing look. No exaggerated reactions.
- **Gestures:** subtle and realistic — a light open-palm gesture, adjusting the
  shemagh, a slow nod, hand resting on the chest when greeting.
- **Posture:** upright, relaxed shoulders, steady head; moves at an unhurried pace.

Performance direction to add to video prompts:

```
he moves naturally and calmly, subtle realistic gestures, minimal facial movement,
relaxed confident body language, no theatrical acting
```

---

## 3. Voice & speaking style

| Attribute | Value |
| --- | --- |
| Voice | Deep, calm, warm Saudi male voice |
| Accent | Authentic Najdi / central Saudi |
| Register | Natural casual Saudi Arabic (not Modern Standard Arabic) |
| Pace | Relaxed, unhurried, short natural pauses |
| Delivery | Clear pronunciation, conversational, no theatrical acting, no shouting |

Voice prompt for TTS / voice-design tools:

```
Deep, calm Saudi male voice, 30 years old, authentic Najdi accent, natural casual
Saudi Arabic dialect, relaxed pace, clear pronunciation, warm and confident,
conversational, no theatrical acting
```

Najdi/Saudi expressions that fit his voice:

- «هلا والله، وش لونك؟» — Hello, how are you?
- «وش السالفة؟» — What's the story?
- «أبشر، تم.» — Consider it done.
- «على هونك، كل شي بيمشي.» — Take it easy, it'll all work out.
- «يا رجال، الموضوع أبسط من كذا.» — Come on, man, it's simpler than that.
- «إيه والله، كلامك صح.» — Yeah, you're right.
- «الحين نشوف.» — We'll see now.

Sample line (for testing the voice):

> «هلا والله. أنا زياد. خلّنا نختصر عليك الطريق — الشغل الزين ما يبي كثرة كلام، يبي نتيجة.»

---

## 4. Ready-to-use prompt templates

Build every prompt as: **Locked Identity Block + Scene + Action + Camera +
Lighting + Style Block**, then add the negative prompt.

### 4.1 Master reference portrait (generate this first)

```
[Locked Identity Block], front-facing head-and-shoulders portrait, looking directly
at the camera, neutral plain light-grey studio background, even soft key light with
gentle fill, 85mm lens, eye level, [Style Block]
```

Then generate a **character turnaround** from the chosen portrait:

```
[Locked Identity Block], character reference sheet, same person shown front view,
three-quarter view and side profile, plus one full-body standing shot, neutral
light-grey background, consistent soft studio lighting, [Style Block]
```

### 4.2 Scene examples

**Riyadh office / business**
```
[Locked Identity Block], sitting at a modern office desk with a laptop, the Riyadh
skyline visible through floor-to-ceiling windows behind him, looking up from the
screen with a calm subtle smile, medium shot, 50mm lens, soft natural daylight,
[Style Block]
```

**Majlis / coffee**
```
[Locked Identity Block], sitting in a traditional Saudi majlis, holding a small
finjan of Saudi coffee, dallah on the low table, relaxed posture, warm ambient
lamp light, medium close-up, 85mm lens, [Style Block]
```

**Street / evening walk**
```
[Locked Identity Block], walking calmly along a modern Riyadh street at golden hour,
slight smile, looking off-camera, full-body tracking shot, 35mm lens, warm sunset
light, [Style Block]
```

**Desert**
```
[Locked Identity Block], standing on a sand dune in the Najd desert, the shemagh
moving slightly in the wind, calm confident look toward the horizon, wide
cinematic shot, late-afternoon light, [Style Block]
```

### 4.3 Talking-to-camera video

```
[Locked Identity Block], medium close-up, talking directly to the camera in natural
casual Saudi Arabic, deep calm voice with a Najdi accent, [performance direction
from section 2], subtle head movement, natural blinking, accurate lip-sync,
static tripod camera with a very slow push-in, soft key light from the left,
[Style Block]
```

---

## 5. Consistency workflow

1. **Lock the face once.** Generate the master reference portrait (4.1), pick the
   single best result, and save it as `ziyad-reference-front.png`. Generate the
   turnaround sheet from it and save it as `ziyad-reference-sheet.png`.
2. **Always attach the reference.** In every new image or video, pass the reference
   portrait to the tool's image-reference / character-reference / face-reference
   input at high strength. Use the turnaround sheet for side or full-body shots.
3. **Reuse settings.** Keep the same model/version, aspect-ratio family, and — if the
   tool exposes it — the same seed for related shots.
4. **Never paraphrase the identity.** Paste the Locked Identity Block verbatim.
   Change only scene, action, camera and lighting.
5. **Video from stills.** For video, start from an approved still of Ziyad
   (image-to-video) rather than text-to-video, so the face stays anchored.
6. **Same voice every time.** Create one voice preset from section 3 and reuse
   that saved voice for all clips instead of regenerating it.
7. **Reject drift.** Discard any output where the face shape, beard length, skin
   tone, eye colour, age or headwear differs from the reference — fix with the
   reference image rather than accepting a "close enough" shot.

### Quick QA checklist

- [ ] Same face and facial structure as the reference portrait
- [ ] Medium tan skin, natural texture (not plastic or airbrushed)
- [ ] Dark brown eyes, thick natural black eyebrows
- [ ] Short, neat, full black beard — same length as the reference
- [ ] Looks 30 — not younger, not older
- [ ] Clean white thobe; red-and-white shemagh with black agal
- [ ] Average build, natural proportions, ~178 cm relative to surroundings
- [ ] Calm, subtle expression and gestures
- [ ] Voice: deep, calm, Najdi Saudi dialect, relaxed pace

---

## 6. More scene templates

**Driving (car interior)**
```
[Locked Identity Block], sitting in the driver's seat of a modern car, one hand on
the steering wheel, glancing at the camera with a slight knowing smile, Riyadh
street softly blurred through the window, medium close-up from the passenger seat,
35mm lens, natural daylight, [Style Block]
```

**Specialty café**
```
[Locked Identity Block], sitting at a minimalist specialty coffee shop table,
holding a cup of coffee, phone on the table, relaxed posture, looking slightly
off-camera, medium shot, 50mm lens, soft window light, warm neutral tones,
[Style Block]
```

**Business meeting**
```
[Locked Identity Block], standing at the head of a modern meeting table, explaining
calmly with a light open-palm gesture, colleagues softly out of focus in the
foreground, medium shot, 50mm lens, clean soft office lighting, [Style Block]
```

**Ramadan night**
```
[Locked Identity Block], sitting on a rooftop at night decorated with warm lanterns,
dates and Saudi coffee in front of him, calm peaceful expression, medium shot,
85mm lens, warm lantern light with a soft blue night sky, [Style Block]
```

**Holding a product / phone (ads)**
```
[Locked Identity Block], holding [PRODUCT] at chest height and showing it to the
camera, subtle confident smile, plain softly lit background, medium close-up,
85mm lens, clean commercial lighting, product in sharp focus, [Style Block]
```

**Tight close-up (emotion shot)**
```
[Locked Identity Block], extreme close-up of his face, slight smile forming slowly,
eyes looking directly into the lens, natural skin texture clearly visible,
100mm macro-style framing, soft side light, [Style Block]
```

---

## 7. Approved wardrobe variations

The face, beard, hair, skin and build never change. Only use these outfit swaps
when a scene needs it — replace the outfit part of the Locked Identity Block:

| Variation | Replace outfit text with |
| --- | --- |
| Default | clean crisp white Saudi thobe, red-and-white shemagh with black agal |
| Winter | white Saudi thobe with a dark brown wool bisht-style winter coat (farwa) over the shoulders, red-and-white shemagh with black agal |
| Formal / occasion | white Saudi thobe with a black bisht with thin gold trim, red-and-white shemagh with black agal |
| Casual (no headwear) | simple navy crew-neck t-shirt and beige chinos, short neatly styled black hair visible |

---

## 8. Short video scripts (Najdi dialect)

Each script is 15–30 seconds. Use the talking-to-camera prompt (4.3) for every
shot, with the scene swapped in.

### Script 1 — Introduction (≈15s)

| Shot | Scene | Line |
| --- | --- | --- |
| 1 | Office, medium close-up | «هلا والله. أنا زياد.» |
| 2 | Same, slow push-in | «ما أحب اللف والدوران — أعطيك الزبدة على طول.» |
| 3 | Tight close-up, slight smile | «تابعني، وبتشوف.» |

### Script 2 — Product / service ad (≈25s)

| Shot | Scene | Line |
| --- | --- | --- |
| 1 | Café, looking at phone, then up to camera | «تعرف وش أكثر شي يضيّع وقتك؟» |
| 2 | Medium close-up | «إنك تدوّر على حل وأنت عندك [المنتج] قدامك.» |
| 3 | Holding product to camera | «سهل، سريع، ويخلّص شغلك بدون وجع راس.» |
| 4 | Close-up, calm nod | «جرّبه… وبعدين قلّي وش رايك.» |

### Script 3 — Quick advice (≈20s)

| Shot | Scene | Line |
| --- | --- | --- |
| 1 | Majlis, finjan in hand | «نصيحة من القلب.» |
| 2 | Medium shot, light hand gesture | «لا تستعجل على النتيجة. الشغل الزين ياخذ وقته.» |
| 3 | Sip of coffee, then look at camera | «بس الأهم… لا توقف.» |

### Script 4 — Comedic beat (≈15s)

| Shot | Scene | Line |
| --- | --- | --- |
| 1 | Car, phone ringing, he glances at it | (silence, slight raised eyebrow) |
| 2 | Looks at camera, deadpan | «هذا ثالث مرة يتصل يقول "بس دقيقة".» |
| 3 | Small smile, ignores the call | «أبشر… بس مو الحين.» |

The humour comes from his calm, deadpan reaction — never from exaggerated faces.
