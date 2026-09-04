# WebAppCap Design Standard v1

Status: active design gate for new templates
Benchmark: current Gabriel Capellari portfolio

## 1. Principle

WebAppCap templates are not arrangements of reusable sections. Each template is an authored visual language for a specific market and positioning.

CMS data is reusable. Art direction is not.

A template may share infrastructure, accessibility primitives and data contracts with another template, but it must not look like the same page with a different palette.

## 2. What the portfolio benchmark teaches us

### 2.1 Semantic art direction
The portfolio connects visual language to subject matter: felt/poker palette, serif editorial headlines, mono metadata, suit marks, chips, live-board rows, hand-history-like experience and WSOP imagery.

Rule: every template needs at least three recurring visual motifs that belong to its subject/positioning, not to generic SaaS design.

### 2.2 Typography is a system
Use distinct typographic jobs:
- Display: personality and large statements.
- Reading: long-form clarity.
- Utility/data: labels, metrics, metadata, controls.

Two fonts are acceptable only when one family can convincingly perform two roles. Typography must be chosen during art direction, never as a late appearance setting.

### 2.3 Composition before components
Premium perception comes from page-level composition: image scale, asymmetry, negative space, overlap, section contrast and intentional changes in density.

Rule: avoid a repetitive `heading + cards` cadence. No more than two consecutive sections may use the same structural rhythm.

### 2.4 Photography is structural
Images must participate in composition rather than decorate cards. Templates should define crop behavior, preferred aspect ratios, overlays, focal positioning and empty-state strategy.

At least one key image treatment must be signature to the template.

### 2.5 Motion has hierarchy
Motion is divided into:
1. ambient motion — ticker, parallax, slow background movement;
2. navigational motion — scroll progress, active-section cues;
3. reveal motion — content entering the viewport;
4. response motion — hover/focus/press feedback;
5. narrative motion — transitions that reinforce the template concept.

A premium template should use motion from at least three categories. Motion must respect `prefers-reduced-motion` and content must remain visible if JavaScript fails.

### 2.6 Details repeat a language
Small details create coherence: labels, borders, counters, iconography, arrows, dividers, pills, hover behavior and background marks must come from the same art direction.

Do not add isolated effects merely because they look premium.

## 3. Page composition rules

### Hero
- Must establish identity in the first viewport.
- Person/business name cannot depend on navigation alone.
- One dominant visual idea, not a collection of cards.
- Primary CTA must be obvious without overpowering identity.
- Hero may be full viewport, split, editorial or cinematic according to template direction.

### Rhythm
Each page should deliberately alternate at least three of these states:
- immersive / full bleed;
- editorial / text-led;
- proof / data-led;
- visual / image-led;
- conversion / action-led.

Section height must follow content importance, not a universal padding value.

### Grid
- Desktop composition starts from a consistent page grid, but sections may break out of it intentionally.
- Asymmetry is encouraged when it improves hierarchy.
- Mobile is recomposed, not merely stacked.

### Conversion
Conversion components belong to the art direction. A lead form should look native to the template, not like a generic form embedded in a designed page.

## 4. Visual hierarchy gate

Every template must visibly distinguish:
- identity;
- primary statement;
- section title;
- supporting copy;
- metadata;
- proof/data;
- primary action;
- secondary action.

If two adjacent hierarchy levels are visually interchangeable, the design fails the gate.

## 5. Template identity card

Before implementation, every template must define:

- Name
- Market/segment
- Positioning
- Three adjectives
- Visual metaphor
- Display typeface role
- Reading typeface role
- Utility/data typeface role
- Palette logic
- Photography direction
- Grid/composition behavior
- Three signature motifs
- Motion language
- Hero concept
- Proof concept
- Conversion concept
- Mobile concept
- Things this template must never do

No renderer work begins before this card is coherent.

## 6. Quality gate

A template can be marked `ready` only when all are true:

### Art direction
- Recognizable without logo or brand name.
- Visual language relates to the segment/positioning.
- Does not resemble another WebAppCap template with colors swapped.

### Typography
- Clear three-level role system.
- Good line breaks at common desktop/mobile widths.
- No orphaned single words in major display headings where avoidable.

### Composition
- First viewport has a dominant focal point.
- At least one memorable composition beyond conventional cards.
- Section rhythm varies intentionally.
- Negative space is purposeful.

### Media
- Image crops are controlled.
- Missing media does not collapse the design.
- Mobile crop behavior is authored.

### Motion
- At least three useful motion categories.
- Reduced-motion mode supported.
- No-JS content remains visible.
- Animation does not delay primary content comprehension.

### Interaction
- Hover, focus and press states are coherent.
- Primary CTA hierarchy remains clear.
- Form and validation states match the template.

### Responsive
- Desktop checked at 1440 and 1280 widths.
- Tablet checked around 768–1024.
- Mobile checked around 390 and 430.
- Mobile is intentionally recomposed.

### Performance
- Decorative effects do not create avoidable layout shift.
- Images use sensible loading behavior.
- Effects degrade gracefully on low-capability/mobile devices.

## 7. CMS boundary

The CMS controls content and safe appearance variables. It must not be allowed to destroy the art direction.

Safe user controls may include:
- approved accent variants;
- content density within bounded options;
- predefined image focal position;
- selected compatible module variants;
- approved type pair, only when the template was designed for it.

Unsafe generic controls should not be exposed merely for flexibility:
- arbitrary font families;
- arbitrary section widths;
- arbitrary border radii;
- unrestricted color combinations;
- arbitrary animation types.

Design quality takes priority over unlimited customization.

## 8. Performance 1 redesign brief

The current Performance renderer is considered a functional prototype, not the final design benchmark.

New direction: **Athletic Editorial / Training System**.

Positioning: premium personal trainer focused on individual performance and disciplined progression.

Three adjectives: precise, physical, confident.

Visual metaphor: a premium training log / performance dashboard translated into an editorial website.

Typography roles:
- Display: condensed/athletic or assertive grotesk for impact.
- Reading: neutral contemporary sans.
- Utility/data: technical mono or compact grotesk for reps, schedule, CREF, metrics and labels.

Signature motifs:
1. training notation (`03 × 12`, `RPE 8`, time, progression marks);
2. measurement/progress lines and oversized numeric typography;
3. cinematic athlete photography with controlled crops and editorial annotations.

Composition direction:
- cinematic identity-first hero;
- narrow moving performance tape rather than generic proof cards;
- asymmetric service/training block;
- results as an image-led editorial sequence;
- method as progression, not ordinary cards;
- trainer profile with photography crossing the grid;
- schedule/contact integrated as one conversion experience.

Motion language:
- subtle hero image drift;
- performance tape movement;
- progressive line/counter reveals;
- restrained image parallax;
- responsive hover states on interactive items.

Never:
- generic glassmorphism as the main visual identity;
- repeated white cards;
- equal-height section rhythm throughout the page;
- decorative glows without semantic purpose;
- arbitrary gradients added to make a section look premium.

## 9. Workflow from now on

1. Audit/reference.
2. Identity card.
3. Full-page blueprint.
4. Visual prototype.
5. Design review.
6. CMS mapping.
7. Renderer implementation.
8. Responsive/motion pass.
9. Quality gate.
10. `ready` status.
