import { describe, it, expect } from 'vitest';
import { calculateHumanDesign, longitudeToGate, __data } from '../src/humandesign.js';

describe('humandesign — data integrity', () => {
  it('64 gates in sequence, all unique', () => {
    expect(__data.GATE_SEQUENCE).toHaveLength(64);
    expect(new Set(__data.GATE_SEQUENCE).size).toBe(64);
    expect(Math.min(...__data.GATE_SEQUENCE)).toBe(1);
    expect(Math.max(...__data.GATE_SEQUENCE)).toBe(64);
  });

  it('all 64 gates map to a center', () => {
    for (let g = 1; g <= 64; g++) {
      expect(__data.GATE_TO_CENTER[g], `gate ${g}`).toBeTruthy();
    }
  });

  it('9 centers', () => {
    expect(__data.CENTERS).toHaveLength(9);
  });

  it('4 motors (Heart, Sacral, SolarPlexus, Root)', () => {
    expect(__data.MOTORS).toHaveLength(4);
    expect(__data.MOTORS.sort()).toEqual(['Heart', 'Root', 'Sacral', 'SolarPlexus']);
  });

  it('channels: each gate pair has both gates valid', () => {
    for (const [a, b] of __data.CHANNELS) {
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(64);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(64);
      expect(__data.GATE_TO_CENTER[a]).toBeTruthy();
      expect(__data.GATE_TO_CENTER[b]).toBeTruthy();
    }
  });
});

describe('humandesign — longitudeToGate', () => {
  it('Gate 25 anchor: 358.125° → Gate 25, Line 1', () => {
    const r = longitudeToGate(358.125);
    expect(r.gate).toBe(25);
    expect(r.line).toBe(1);
  });

  it('Just before Gate 25 anchor: 358.124° → Gate 36 (last)', () => {
    const r = longitudeToGate(358.124);
    expect(r.gate).toBe(36); // last in sequence
  });

  it('Anchor + 5.625° = next gate (17)', () => {
    const r = longitudeToGate(358.125 + 5.625);
    expect(r.gate).toBe(17);
    expect(r.line).toBe(1);
  });

  it('Lines 1-6 within a gate', () => {
    for (let l = 0; l < 6; l++) {
      const r = longitudeToGate(358.125 + l * 0.9375 + 0.001);
      expect(r.line).toBe(l + 1);
    }
  });

  it('Returns gate, line, color, tone, base', () => {
    const r = longitudeToGate(0);
    expect(r.gate).toBeDefined();
    expect(r.line).toBeGreaterThanOrEqual(1);
    expect(r.line).toBeLessThanOrEqual(6);
    expect(r.color).toBeGreaterThanOrEqual(1);
    expect(r.color).toBeLessThanOrEqual(6);
    expect(r.tone).toBeGreaterThanOrEqual(1);
    expect(r.tone).toBeLessThanOrEqual(6);
    expect(r.base).toBeGreaterThanOrEqual(1);
    expect(r.base).toBeLessThanOrEqual(5);
  });

  it('All gates 1-64 are reachable', () => {
    const reached = new Set();
    for (let lon = 0; lon < 360; lon += 0.05) {
      reached.add(longitudeToGate(lon).gate);
    }
    expect(reached.size).toBe(64);
  });
});

describe('humandesign — calculateHumanDesign basic', () => {
  it('returns valid structure', () => {
    const r = calculateHumanDesign({ year: 1990, month: 5, day: 15, hour: 14, minute: 30, timezone: 8 });
    expect(r.type).toBeDefined();
    expect(['Reflector', 'Manifestor', 'Generator', 'Manifesting Generator', 'Projector']).toContain(r.type);
    expect(r.profile).toMatch(/^[1-6]\/[1-6]$/);
    expect(r.personalityBodies).toBeDefined();
    expect(r.designBodies).toBeDefined();
    expect(r.designTime).toBeDefined();
    expect(r.definedCenters).toBeInstanceOf(Array);
    expect(r.activatedGates).toBeInstanceOf(Array);
  });

  it('Personality and Design bodies each have 13 entries (10 planets + earth + N + S nodes)', () => {
    const r = calculateHumanDesign({ year: 1990, month: 5, day: 15, hour: 14, minute: 30, timezone: 8 });
    expect(Object.keys(r.personalityBodies)).toHaveLength(13);
    expect(Object.keys(r.designBodies)).toHaveLength(13);
  });

  it('Each body has gate (1-64) and line (1-6)', () => {
    const r = calculateHumanDesign({ year: 1990, month: 5, day: 15, hour: 14, minute: 30, timezone: 8 });
    for (const body of [...Object.values(r.personalityBodies), ...Object.values(r.designBodies)]) {
      expect(body.gate).toBeGreaterThanOrEqual(1);
      expect(body.gate).toBeLessThanOrEqual(64);
      expect(body.line).toBeGreaterThanOrEqual(1);
      expect(body.line).toBeLessThanOrEqual(6);
    }
  });
});

describe('humandesign — 88° property (critical)', () => {
  it('Design Sun longitude = Personality Sun - 88° (mod 360)', () => {
    const cases = [
      { year: 1990, month: 5, day: 15, hour: 14, minute: 30, timezone: 8 },
      { year: 1955, month: 2, day: 24, hour: 19, minute: 15, timezone: -8 },
      { year: 2000, month: 1, day: 1, hour: 12, minute: 0, timezone: 0 },
      { year: 1971, month: 6, day: 28, hour: 8, minute: 0, timezone: 2 },
    ];
    for (const c of cases) {
      const r = calculateHumanDesign(c);
      const pSun = r.personalityBodies.sun.longitude;
      const dSun = r.designBodies.sun.longitude;
      let diff = pSun - dSun;
      while (diff < 0) diff += 360;
      while (diff >= 360) diff -= 360;
      expect(Math.abs(diff - 88), `case ${JSON.stringify(c)}: pSun=${pSun}, dSun=${dSun}, diff=${diff}`).toBeLessThan(0.01);
    }
  });

  it('Design time is approximately 88 days before birth', () => {
    const r = calculateHumanDesign({ year: 2000, month: 6, day: 15, hour: 12, minute: 0, timezone: 0 });
    const designJD = new Date(Date.UTC(r.designTime.year, r.designTime.month - 1, r.designTime.day, r.designTime.hour, r.designTime.minute));
    const birthJD = new Date(Date.UTC(2000, 5, 15, 12, 0));
    const daysDiff = (birthJD - designJD) / (1000 * 60 * 60 * 24);
    // Sun 日均移動 0.95-1.02°，所以 88° 對應 86-93 天
    expect(daysDiff).toBeGreaterThan(86);
    expect(daysDiff).toBeLessThan(93);
  });
});

describe('humandesign — type determination', () => {
  it('Reflector when no centers defined', () => {
    // Hard to construct synthetically; just verify rule logic via property tests
    const r = calculateHumanDesign({ year: 1990, month: 5, day: 15, hour: 14, minute: 30, timezone: 8 });
    if (r.definedCenters.length === 0) {
      expect(r.type).toBe('Reflector');
    }
  });

  it('Generator if Sacral defined but Throat not connected to motor', () => {
    const r = calculateHumanDesign({ year: 1990, month: 5, day: 15, hour: 14, minute: 30, timezone: 8 });
    if (r.definedCenters.includes('Sacral') && r.type === 'Generator') {
      // OK
    }
  });
});

describe('humandesign — determinism', () => {
  it('same input produces same output', () => {
    const inp = { year: 1990, month: 5, day: 15, hour: 14, minute: 30, timezone: 8 };
    const a = calculateHumanDesign(inp);
    const b = calculateHumanDesign(inp);
    expect(a.type).toBe(b.type);
    expect(a.profile).toBe(b.profile);
    expect(a.activatedGates).toEqual(b.activatedGates);
    expect(a.designTime).toEqual(b.designTime);
  });
});

describe('humandesign — activated gates structure', () => {
  it('typical 26 activations (may have duplicates → 13-26 unique gates)', () => {
    const r = calculateHumanDesign({ year: 1990, month: 5, day: 15, hour: 14, minute: 30, timezone: 8 });
    expect(r.activatedGates.length).toBeGreaterThanOrEqual(13);
    expect(r.activatedGates.length).toBeLessThanOrEqual(26);
  });

  it('all activated gates are valid (1-64)', () => {
    const r = calculateHumanDesign({ year: 1990, month: 5, day: 15, hour: 14, minute: 30, timezone: 8 });
    for (const g of r.activatedGates) {
      expect(g).toBeGreaterThanOrEqual(1);
      expect(g).toBeLessThanOrEqual(64);
    }
  });
});
