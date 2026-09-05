# Trilemma Design Contract — 1.1.0

Canonical owner: `TrilemmaFoundation/website_v2`. Other repositories vendor this
contract and build independently. `contract.json` records the reference revision
and SHA-256 checksums. Run `npm run check:design`; compare release copies with
`node scripts/check-design-contract.mjs --peers /path/to/data /path/to/microproduct-lab`.
Update all copies together for a coordinated design release. No runtime sibling
imports or network dependency is needed.

## Reference

Match the rendered Foundation landing: Roboto, ghost-white content, navy feature
surfaces, periwinkle primary actions, peach secondary actions, amber emphasis,
10px controls, 16px cards, and 44px minimum targets. Body copy is 16px; compact
metadata may be 14px. Reading, content, and wide measures are 48rem, 74rem, and
80rem with responsive 16/24/32px gutters. Marketing sections use viewport minimums,
never heights that clip content. Preserve the existing appearance of the map,
illustrations, hero, and carousel, except decorative glow effects. The Foundation
website has no portrait halos, blurred background glows, or glowing SVG/map
accents. Keep standard elevation shadows and visible keyboard focus indicators.

Primary hover pairs azure with ghost-white (5.13:1). Quiet links use azure on
ghost-white. On navy, focus uses amber; on light surfaces it uses azure. Status
messages include text; color alone never carries meaning. Use semantic surface
and foreground pairs. The old Tailwind 3 opacity modifiers were ineffective;
do not activate them wholesale when mapping tokens into another framework.

## Navigation and interaction

The Foundation website uses its centered symbol and grouped global navigation.
Subdomains render only their own local header: Data navigation, or Playbook
navigation with documentation tools and search. Do not import or stack the
Foundation global header in a subdomain. Retain the common navy footer.
Active routes are origin-aware. Internal links use local routing. External new-tab
links have an accessible cue. Legal destinations resolve against the Foundation
origin. Mobile page navigation isolates covered content, locks scrolling, traps
focus, closes with Escape, and restores trigger focus. Only one overlay is open
at once. Sticky offsets use the actual local header height, including wrapping.

Keep search controls mounted and visible while filtering; recommendations follow
results. Preserve URL state, Back/Forward, validation inputs, and retry context.
Code remains monospace and independently scrollable. Tables reflow to cards where
already supported. Respect reduced motion and preserve lazy-loaded heavy widgets.

## Validation

Smoke-check every router/generated-manifest route. Visually inspect each page
family at 320, 390, 768, 1023, 1024, 1280, and 1536px, short desktop/landscape,
200% zoom, normal/reduced motion, and keyboard focus. Exercise populated, empty,
loading, failure/retry, validation, success, disabled, and long-content states.
Mock application endpoints: no real submissions. Preserve data schemas, URLs,
anchors, raw/agent endpoints, generation semantics, and existing performance budgets.
