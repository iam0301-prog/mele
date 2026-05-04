# Maya Totem Glyphs Design

## Goal

Add a MELE-specific visual system for the 20 Maya solar seals so members can recognize their Kin totem visually, not only through text.

## Approved Direction

Use a mysterious golden sigil style: deep navy surfaces, gold linework, subtle jade/cyan light, and compact seal-like compositions. The glyphs are abstract MELE emblems inspired by each totem meaning; they do not claim to reproduce historical Maya glyphs.

## Scope

- Provide all 20 totems with Chinese name, English name, keywords, and a short beginner summary.
- Render each totem as code-native SVG so the UI stays fast and responsive.
- Show the active birth totem prominently on the Maya result.
- Show a 20-totem index so members can browse the whole set.
- Use the same glyph in the Maya visual result stage and oracle relationship cards.

## UI Placement

- `ToolResult` shows a 20-totem gallery after the beginner guide for Maya results.
- Maya oracle cards show a mini glyph for self, guide, analog, antipode, and occult Kin.
- `ReadingArStage` uses the current Maya seal as the visual center of the 2D plate.

## Testing

- TypeScript must compile.
- Structure tests must verify the 20-glyph registry and the Maya integrations.
- Existing calculator behavior must not change.
