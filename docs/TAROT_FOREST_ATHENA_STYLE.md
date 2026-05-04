# Forest Athena Tarot Style

## Story Core

`forest_athena` is not a generic enchanted forest. It is Athena's moonlit olive sanctuary: a place where intuition is disciplined by wisdom, protection is intelligent, and every action is guided by strategy rather than impulse.

Athena should be felt as an unseen patron, not usually shown as a literal full-body goddess. Her presence appears through sacred olive groves, laurel rings, bronze shield light, carved temple stones, quiet tactical geometry, and a watchful intelligence in the composition.

## Visual Grammar

- World: Athena-guarded moonlit olive forest, half sanctuary and half strategic temple.
- Mood: sacred, calm, vigilant, wise, protective, emotionally precise.
- Palette: deep green, moss shadow, soft gold, olive light, tempered bronze, small moonlit silver accents.
- Materials: olive bark, laurel leaves, moss, roots, carved stone, bronze aegis glow, worn ritual paths.
- Motifs: olive branches, laurel rings, shield arcs, spear-like branches, owl-feather-like wisdom patterns, temple geometry.
- Composition: vertical 2:3 tarot crop, clear central symbol, readable silhouette, no title/number/text because the website overlays text separately.

## Athena Rules

- Show Athena as atmosphere and symbolic intelligence first.
- Use bronze shield glow and olive sacredness to distinguish the deck from a normal woodland fantasy style.
- The forest should feel wise and guarded, not cute, fairy-like, anime, or decorative.
- Violence should be symbolic and restrained. Strategy, discernment, justice, and protection matter more than battle spectacle.
- Animal symbolism may appear as subtle feather-like patterns or shadow logic, but no literal animal should become the main subject unless a specific tarot archetype truly requires it.

## Suit Language

- Wands: living olive branches, oath-fire, growth directed by will.
- Cups: moonlit spring water, reflective bowls, emotional truth held inside the sanctuary.
- Swords: spear-like branch shadows, cold moon air, discernment, law, and tactical clarity.
- Pentacles: moss stones, seeds, soil, golden rings, craft and stewardship.

## Generation Queue

Use `python_api/data/tarot_art_prompts.json` as the source of truth. The active phase is:

```text
style: forest_athena
target: apps/web/public/tarot/cards/forest_athena/{id}.webp
range: 0-77
format: WebP
quality: 92
crop: vertical 2:3
```

Check the real file status with:

```bash
node scripts/tarot-art-phase.mjs --style forest_athena --limit 10
```

Export the next prompt queue with:

```bash
node scripts/tarot-art-phase.mjs --style forest_athena --jsonl tmp/forest_athena_missing.jsonl
```

## QA

- No readable text, title, card number, logo, or watermark inside the image.
- The card must look like a finished collectible tarot illustration, not a UI mockup or flat icon.
- Each card needs its own tarot archetype, not the same forest scene repeated 78 times.
- If an output reads as generic woodland fantasy, regenerate with more Athena: olive sanctuary, bronze aegis glow, tactical geometry, wise protection.
- If an output becomes warlike, soften it back toward discernment, protection, and just action.
