# WebAppCap Template Workflow

## Goal
Build new visual references as isolated renderers over stable semantic CMS content. A reference is never pasted over an approved template blindly.

## Rules
1. CMS owns meaning; templates own layout and motion.
2. Shared code is limited to data adapters, leads, media/accessibility utilities and infrastructure.
3. Hero, cards, grids, navigation, typography, tokens and motion stay template-local.
4. Every template has a capability contract in `src/templates/contracts.ts`.
5. Approved templates are not overwritten during exploration. Reference work is treated as a candidate until homologated.
6. A new CMS field is added only when the reference needs genuinely new reusable meaning, not merely a different layout.

## Reference intake
Accepted inputs: URL, screenshots, navigation video, Figma, HTML/CSS, PDF or combinations.

Before implementation, produce a reference map:
- reference section -> existing semantic CMS field/block;
- visual tokens: fonts, colors, radius, spacing, shadows;
- responsive behavior;
- motion/interaction behavior;
- missing semantic data;
- intentional differences from the reference.

Resolve missing data before coding: reuse an existing semantic field, add a reusable field, or omit the element.

## Implementation sequence
1. Audit reference.
2. Map reference to semantic content.
3. Freeze scope and intentional deviations.
4. Implement candidate in its own component/CSS module.
5. Use shared semantic adapter where applicable.
6. Compare with the same project data in Template Lab.
7. Test desktop/mobile, empty/long content, images, links and lead form.
8. Homologate candidate.
9. Only then promote/replace the registry entry.

## Personal Trainer semantic baseline
Identity: name, location, description/tagline.
Content: hero_title, hero_text, trainer_specialty, trainer_cref, primary_offer, proof, trainer_services (`Title|Text` per line), trainer_method (`Title|Text` per line), trainer_results_title, about, trainer_credentials, trainer_schedule_title, trainer_schedule_text.
Media: hero, gallery.
Contact: whatsapp/phone, instagram.
Appearance: template-dependent and declared by contract.

## Template Lab
Route: `/template-lab/[segment]/[slug]`.
It renders ready templates against the exact same draft CMS data without changing `template_key`, publication state or live content. Use it for visual comparison and reference homologation.

## Naming/versioning
Prefer semantic keys for future templates: `trainer-performance-1`, `trainer-editorial-1`, `trainer-velocity-1`. Existing keys remain compatible until an explicit safe migration is performed. Never rename persisted template keys casually.

## Definition of done
A template is ready only after visual, content, responsive, interaction, lead, accessibility and fallback checks pass. Production publication remains an explicit user action.
