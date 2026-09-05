# Performance 1 — Full-page Blueprint

Status: approved direction / pre-renderer blueprint
Design family: Athletic Editorial / Training System
Primary reference project: Fabio Ferrari

## A. Experience thesis

Performance 1 should feel like entering a private high-performance training program, not browsing a personal-trainer landing page.

The visual narrative is:

**IDENTITY → DIAGNOSIS → SYSTEM → EVIDENCE → PROGRESSION → TRAINER → ACTION**

The page should alternate cinematic photography, editorial whitespace and technical performance information. Cards are secondary tools, never the main composition system.

---

## B. Desktop master composition

### 01 — PERFORMANCE HEADER

Height: 72–84px, visually light.

Left:
- `FABIO FERRARI` as the primary wordmark when no logo exists.
- `PERSONAL TRAINER · CREF ...` as technical sublabel.

Center/right:
- Método
- Resultados
- Treinador

Far right:
- compact status/action: `AGENDA / CONSULTAR →`

Behavior:
- transparent over hero initially;
- becomes solid/blurred only after scroll;
- thin progress line at the top uses accent color;
- no large pill navigation.

### 02 — CINEMATIC IDENTITY HERO

Desktop height: 88–100svh.
Composition: asymmetric 5/7 or 6/6 grid with photography breaking the grid.

Left editorial field:
- utility line: `PERSONAL TRAINER / IBITINGA — SP`
- large identity: `FABIO` then `FERRARI`, not hidden in a brand bar;
- positioning statement below, smaller than the name;
- short supporting copy;
- primary CTA `COMEÇAR AVALIAÇÃO →`;
- secondary text action `VER MÉTODO`.

Right photographic field:
- hero image takes 52–60% of viewport width;
- crop favors body/posture/action rather than headshot-card composition;
- image can touch top/bottom/right viewport edges;
- dark-to-transparent overlay only where needed for readability.

Technical annotations attached to image/grid:
- `01 / PERFORMANCE`
- CREF
- specialty
- small vertical measurement scale
- optional `RPE 08` / `PROGRESSÃO` visual notation used decoratively, never as a false client metric.

Motion:
- slow 1–2% image drift;
- name reveals by line;
- measurement line grows vertically;
- CTA appears after identity, not simultaneously.

No glass cards inside hero.

### 03 — PERFORMANCE TAPE

Height: 58–76px.
Full width, high contrast accent or near-black.

Continuous horizontal tape with real content:
- individualized training
- technique
- progression
- consistency
- schedule/format
- proof text if available

Visual separators: `+`, `×`, small measurement ticks.

Motion: continuous slow horizontal movement. Pauses only when accessibility requires it.

Purpose: bridge cinematic hero to explanatory content while establishing the training-system language.

### 04 — DIAGNOSIS / WHAT WE TRAIN

Background: warm/off-white.
Large editorial split.

Left 40%:
- `01 / DIAGNÓSTICO`
- title: `O treino começa antes da primeira repetição.`
- short explanatory paragraph.

Right 60%:
services are NOT cards.
Use a vertical training prescription list:

`01`  Hipertrofia                  `FOCO`
`02`  Emagrecimento               `META`
`03`  Condicionamento             `RITMO`
...

Each row:
- large service title;
- description expands/reveals on hover desktop;
- permanent description on mobile;
- thin horizontal rule;
- numeric/technical annotation.

One oversized faded notation in background: `03 × 12`.

### 05 — TRAINING SYSTEM / METHOD

Background: deep graphite/green-black.
Purpose: communicate process as progression.

Top:
- `02 / SISTEMA`
- title `Progressão que você consegue enxergar.`

Main composition:
A horizontal progression line on desktop with 3–5 method stages. It is not a set of boxes.

Example:
`AVALIAÇÃO ━━━━━ PLANO ━━━━━ EXECUÇÃO ━━━━━ AJUSTE ━━━━━ EVOLUÇÃO`

Each stage has:
- step number;
- title from CMS;
- short text;
- a small technical marker.

Motion:
- central line draws as section enters viewport;
- stage markers activate sequentially;
- text remains visible without JS.

Mobile:
- becomes a vertical progression rail.

### 06 — RESULTS / EVIDENCE EDITORIAL

This is the most visual section after hero.
Background: neutral light or near-black depending actual gallery images.

Header is intentionally small compared with media:
- `03 / EVIDÊNCIA`
- CMS result title
- proof statement.

Gallery behavior:
- first result occupies a large 7/12 column;
- second/third stagger in smaller columns;
- later images continue as editorial mosaic;
- never equal card thumbnails.

Each image:
- controlled aspect ratio;
- index `RESULTADO / 01`;
- optional minimal caption;
- subtle scale/parallax on hover/scroll.

If gallery has only one image, it becomes a single full editorial statement rather than leaving empty grid slots.

If gallery is empty, section becomes proof typography, not an image placeholder.

### 07 — TRAINER PROFILE / AUTHORITY

Background: off-white.
Composition: photography crosses grid; text has strong negative space.

Image left or center, 45–55% width.
Image should be distinct from hero when possible.

Text field:
- `04 / TREINADOR`
- `FABIO FERRARI`
- about copy;
- credentials as editorial lines;
- CREF in utility typography.

Authority details become a compact technical dossier:
`REGISTRO` / CREF
`ESPECIALIDADE` / specialty
`ATENDIMENTO` / location

Do not repeat generic authority cards from hero.

### 08 — AVAILABILITY / CONVERSION EXPERIENCE

Merge schedule + lead capture. Remove the current separate schedule strip + later contact form duplication.

Background: accent color or dark field depending contrast.

Left 45%:
- `05 / PRÓXIMO TREINO`
- schedule title
- schedule copy
- direct WhatsApp option
- small response expectation text if product later supports it.

Right 55%:
Lead form styled as a training intake sheet.

Form visual language:
- numbered fields `01`, `02`, `03`;
- underlined/technical inputs rather than floating generic white card;
- labels in utility font;
- objective textarea treated as `OBJETIVO PRINCIPAL`;
- submit `SOLICITAR CONTATO →`.

Success state:
- form transforms into confirmation panel in place;
- no generic toast as primary feedback.

### 09 — FINAL STATEMENT

Short, not another full CTA section.
Near-black background.

Huge display line:
`SEU PRÓXIMO
NÍVEL COMEÇA
NO PRÓXIMO TREINO.`

Below:
- WhatsApp
- Instagram
- city
- CREF

Large low-opacity `FF` or name typographic crop may become the footer background.

### 10 — FOOTER

Minimal technical footer.
`FABIO FERRARI / PERSONAL TRAINER`
`WEBAPPCAP`
legal/contact links if needed.

No redundant CTA.

---

## C. Rhythm map

1. Hero — immersive / photographic
2. Tape — kinetic / data
3. Diagnosis — editorial / light
4. System — technical / dark
5. Results — visual / evidence
6. Trainer — editorial / authority
7. Intake — conversion / action
8. Final — typographic / emotional

This deliberately avoids two consecutive `heading + cards` sections.

---

## D. Typography blueprint

### Display
Purpose: name, hero statement, giant section statements, large numerals.
Desired character: assertive, athletic, compact enough for dramatic scale.

### Reading
Purpose: paragraphs, service descriptions, about text, form support copy.
Desired character: highly legible contemporary sans.

### Utility
Purpose: CREF, section indexes, labels, schedule, measurements, gallery indexes, form field numbers.
Desired character: mono/technical or compact grotesk.

CMS rule: Performance 1 owns its approved font system. Arbitrary user-selected font families must not replace it.

---

## E. Color blueprint

Base palette is structural:
- near-black / graphite: performance/system sections;
- warm off-white: editorial/readability sections;
- accent: action, progression, technical markers;
- muted gray: metadata.

CMS accent is allowed only through a contrast-safe normalization layer. The accent does not recolor every section.

Avoid broad decorative gradients. Gradients are permitted only for image readability or very subtle depth.

---

## F. Photography blueprint

Required media roles:
1. hero portrait/action image;
2. trainer/about image — may fall back to hero but uses a different crop;
3. results gallery.

Hero focal behavior:
- desktop: configurable center/left/right focal position;
- mobile: separate safe crop logic;
- no forced square/carded crop.

Results:
- preserve subject visibility;
- use editorial aspect ratios (portrait 4:5, landscape 3:2, feature 4:3) based on mosaic slot.

---

## G. Motion blueprint

### Always-on / ambient
- performance tape moves slowly;
- optional subtle hero image drift.

### Scroll
- top progress line;
- method progression line draw;
- section index/label reveal;
- restrained image parallax.

### Interaction
- service prescription row expands/reveals detail;
- CTA arrow travels slightly;
- gallery image scale 1–2%;
- navigation active state.

### Safety
All content is visible by default. JavaScript adds motion state; it never gates visibility.

`prefers-reduced-motion` disables tape movement, parallax, line drawing animation and stagger while retaining final visual state.

---

## H. Mobile recomposition

Mobile is a separate composition pass.

Hero:
- name and positioning first;
- image becomes a wide/portrait cinematic block, not a tiny right column;
- CTA full width or two deliberate rows;
- technical annotations reduced to essentials.

Tape:
- single-line overflow movement or static clipped phrase in reduced motion.

Diagnosis:
- service rows stay rows, not cards.

System:
- horizontal progression becomes vertical rail.

Results:
- feature image first, then alternating full-width/offset media;
- no cramped multi-column gallery.

Trainer:
- image, name/dossier, then about copy.

Conversion:
- copy above form;
- technical field numbering retained;
- mobile sticky CTA may appear only before conversion section and disappear when form enters viewport.

---

## I. Current renderer mapping

Current → new:

- `nav` → Performance Header
- `hero` → Cinematic Identity Hero
- `authorityBar + proofStrip` → Performance Tape (duplicates removed)
- `services/cardGrid` → Diagnosis prescription list
- `methodGrid` → Training System progression
- `gallery` → Results editorial mosaic
- `about` → Trainer Profile / technical dossier
- `schedule + leadSection` → single Availability / Intake experience
- `finalCta + footer` → Final Statement + minimal footer

Existing CMS fields are sufficient for the first redesign pass. No database migration is required for this blueprint.

Potential future optional fields:
- hero focal point;
- dedicated about image;
- result captions;
- service short marker/category;
- response-time promise.

These are enhancements, not blockers.

---

## J. Acceptance criteria for visual prototype

The visual prototype is accepted only if:
- Fabio Ferrari is unmistakably the subject in the first viewport;
- screenshotting any three major sections produces visibly different compositions;
- the site still feels like the same brand across those sections;
- there is no authority/proof duplication above the fold;
- services and method do not use generic card grids;
- photography is compositionally important;
- the contact form feels like part of the training concept;
- mobile does not look like desktop stacked vertically;
- motion enhances the training/progression concept rather than decorating it.

Next implementation step after this blueprint: replace the current renderer structure with the new composition in one coherent visual block, preserving CMS data contracts and public lead behavior.
