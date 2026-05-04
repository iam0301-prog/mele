# AR assets

This folder serves Web AR models.

Current generated GLB files:

- `tarot-card.glb`
- `rune-stone.glb`
- `astral-plate.glb`
- `human-design-bodygraph.glb`

The React components intentionally do not point `ios-src` at missing files.
Without `ios-src`, model-viewer can try to generate an iOS Quick Look asset
from the GLB. This is better than sending iPhone users to a 404.

For a polished production launch, export and add dedicated USDZ or Reality
files:

- `tarot-card.usdz`
- `rune-stone.usdz`
- `astral-plate.usdz`
- `human-design-bodygraph.usdz`
