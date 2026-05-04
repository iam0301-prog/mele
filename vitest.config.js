import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@mele/data/tarot': fileURLToPath(new URL('./archive/packages-calc-js/data/tarot.js', import.meta.url)),
      '@mele/data/runes': fileURLToPath(new URL('./archive/packages-calc-js/data/runes.js', import.meta.url)),
    },
  },
  test: {
    include: ['archive/packages-calc-js/calc/tests/**/*.test.js'],
    reporters: ['verbose'],
  },
});
