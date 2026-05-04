import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'apps', 'web', 'public', 'ar');
mkdirSync(outDir, { recursive: true });

const COMPONENT_TYPE = {
  UNSIGNED_SHORT: 5123,
  FLOAT: 5126,
};

function align4(value) {
  return (value + 3) & ~3;
}

function padBuffer(buffer) {
  const padded = Buffer.alloc(align4(buffer.length));
  buffer.copy(padded);
  return padded;
}

function padJsonBuffer(buffer) {
  const padded = Buffer.alloc(align4(buffer.length), 0x20);
  buffer.copy(padded);
  return padded;
}

function vec3Buffer(values) {
  const buffer = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => buffer.writeFloatLE(value, index * 4));
  return buffer;
}

function indexBuffer(values) {
  const buffer = Buffer.alloc(values.length * 2);
  values.forEach((value, index) => buffer.writeUInt16LE(value, index * 2));
  return buffer;
}

function minMaxVec3(values) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < values.length; i += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], values[i + axis]);
      max[axis] = Math.max(max[axis], values[i + axis]);
    }
  }
  return { min, max };
}

function createBuilder(name) {
  const buffers = [];
  const bufferViews = [];
  const accessors = [];
  const meshes = [];
  const nodes = [];
  const materials = [];

  function addMaterial(label, color, roughness = 0.78, metallic = 0.08) {
    materials.push({
      name: label,
      pbrMetallicRoughness: {
        baseColorFactor: color,
        roughnessFactor: roughness,
        metallicFactor: metallic,
      },
    });
    return materials.length - 1;
  }

  function addAccessor(buffer, descriptor) {
    const byteOffset = buffers.reduce((sum, item) => sum + align4(item.length), 0);
    buffers.push(buffer);
    const viewIndex = bufferViews.length;
    bufferViews.push({
      buffer: 0,
      byteOffset,
      byteLength: buffer.length,
      target: descriptor.target,
    });
    const accessor = {
      bufferView: viewIndex,
      byteOffset: 0,
      componentType: descriptor.componentType,
      count: descriptor.count,
      type: descriptor.type,
    };
    if (descriptor.min) accessor.min = descriptor.min;
    if (descriptor.max) accessor.max = descriptor.max;
    accessors.push(accessor);
    return accessors.length - 1;
  }

  function addMesh(label, geometry, material) {
    const bounds = minMaxVec3(geometry.positions);
    const position = addAccessor(vec3Buffer(geometry.positions), {
      componentType: COMPONENT_TYPE.FLOAT,
      count: geometry.positions.length / 3,
      type: 'VEC3',
      target: 34962,
      min: bounds.min,
      max: bounds.max,
    });
    const normal = addAccessor(vec3Buffer(geometry.normals), {
      componentType: COMPONENT_TYPE.FLOAT,
      count: geometry.normals.length / 3,
      type: 'VEC3',
      target: 34962,
    });
    const indices = addAccessor(indexBuffer(geometry.indices), {
      componentType: COMPONENT_TYPE.UNSIGNED_SHORT,
      count: geometry.indices.length,
      type: 'SCALAR',
      target: 34963,
    });
    meshes.push({
      name: label,
      primitives: [{
        attributes: { POSITION: position, NORMAL: normal },
        indices,
        material,
      }],
    });
    nodes.push({ name: label, mesh: meshes.length - 1 });
  }

  function write(fileName) {
    let binary = Buffer.alloc(0);
    for (const buffer of buffers) {
      binary = Buffer.concat([binary, padBuffer(buffer)]);
    }

    const json = {
      asset: { version: '2.0', generator: 'Mele AR asset builder' },
      scene: 0,
      scenes: [{ nodes: nodes.map((_, index) => index) }],
      nodes,
      meshes,
      materials,
      accessors,
      bufferViews,
      buffers: [{ byteLength: binary.length }],
    };

    const jsonBuffer = padJsonBuffer(Buffer.from(JSON.stringify(json)));
    const totalLength = 12 + 8 + jsonBuffer.length + 8 + binary.length;
    const glb = Buffer.alloc(totalLength);
    let offset = 0;
    glb.writeUInt32LE(0x46546c67, offset); offset += 4;
    glb.writeUInt32LE(2, offset); offset += 4;
    glb.writeUInt32LE(totalLength, offset); offset += 4;
    glb.writeUInt32LE(jsonBuffer.length, offset); offset += 4;
    glb.writeUInt32LE(0x4e4f534a, offset); offset += 4;
    jsonBuffer.copy(glb, offset); offset += jsonBuffer.length;
    glb.writeUInt32LE(binary.length, offset); offset += 4;
    glb.writeUInt32LE(0x004e4942, offset); offset += 4;
    binary.copy(glb, offset);
    writeFileSync(join(outDir, fileName), glb);
  }

  return { addMaterial, addMesh, write, name };
}

function box(cx, cy, cz, sx, sy, sz) {
  const x = sx / 2, y = sy / 2, z = sz / 2;
  const faces = [
    [[-x,-y,z], [x,-y,z], [x,y,z], [-x,y,z], [0,0,1]],
    [[x,-y,-z], [-x,-y,-z], [-x,y,-z], [x,y,-z], [0,0,-1]],
    [[x,-y,z], [x,-y,-z], [x,y,-z], [x,y,z], [1,0,0]],
    [[-x,-y,-z], [-x,-y,z], [-x,y,z], [-x,y,-z], [-1,0,0]],
    [[-x,y,z], [x,y,z], [x,y,-z], [-x,y,-z], [0,1,0]],
    [[-x,-y,-z], [x,-y,-z], [x,-y,z], [-x,-y,z], [0,-1,0]],
  ];
  const positions = [], normals = [], indices = [];
  for (const face of faces) {
    const start = positions.length / 3;
    for (let i = 0; i < 4; i += 1) {
      positions.push(face[i][0] + cx, face[i][1] + cy, face[i][2] + cz);
      normals.push(...face[4]);
    }
    indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  }
  return { positions, normals, indices };
}

function merge(...geometries) {
  const positions = [], normals = [], indices = [];
  for (const geometry of geometries) {
    const offset = positions.length / 3;
    positions.push(...geometry.positions);
    normals.push(...geometry.normals);
    indices.push(...geometry.indices.map((index) => index + offset));
  }
  return { positions, normals, indices };
}

function transformGeometry(geometry, { tx = 0, ty = 0, tz = 0, rz = 0 } = {}) {
  const c = Math.cos(rz);
  const s = Math.sin(rz);
  const positions = [];
  const normals = [];
  for (let i = 0; i < geometry.positions.length; i += 3) {
    const x = geometry.positions[i];
    const y = geometry.positions[i + 1];
    positions.push(x * c - y * s + tx, x * s + y * c + ty, geometry.positions[i + 2] + tz);
  }
  for (let i = 0; i < geometry.normals.length; i += 3) {
    const x = geometry.normals[i];
    const y = geometry.normals[i + 1];
    normals.push(x * c - y * s, x * s + y * c, geometry.normals[i + 2]);
  }
  return { positions, normals, indices: [...geometry.indices] };
}

function transformGeometryY(geometry, { tx = 0, ty = 0, tz = 0, ry = 0 } = {}) {
  const c = Math.cos(ry);
  const s = Math.sin(ry);
  const positions = [];
  const normals = [];
  for (let i = 0; i < geometry.positions.length; i += 3) {
    const x = geometry.positions[i];
    const z = geometry.positions[i + 2];
    positions.push(x * c + z * s + tx, geometry.positions[i + 1] + ty, -x * s + z * c + tz);
  }
  for (let i = 0; i < geometry.normals.length; i += 3) {
    const x = geometry.normals[i];
    const z = geometry.normals[i + 2];
    normals.push(x * c + z * s, geometry.normals[i + 1], -x * s + z * c);
  }
  return { positions, normals, indices: [...geometry.indices] };
}

function boxBetween(x1, y1, x2, y2, z, thickness, depth) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.max(0.001, Math.hypot(dx, dy));
  return transformGeometry(
    box(0, 0, 0, length, thickness, depth),
    { tx: (x1 + x2) / 2, ty: (y1 + y2) / 2, tz: z, rz: Math.atan2(dy, dx) },
  );
}

function boxBetweenXZ(x1, z1, x2, z2, y, thickness, depth) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.max(0.001, Math.hypot(dx, dz));
  return transformGeometryY(
    box(0, 0, 0, length, thickness, depth),
    { tx: (x1 + x2) / 2, ty: y, tz: (z1 + z2) / 2, ry: -Math.atan2(dz, dx) },
  );
}

function polygonZ(points, depth, z = 0, normalScale = 1) {
  const positions = [], normals = [], indices = [];
  const topStart = 0;
  for (const [x, y] of points) {
    positions.push(x, y, z + depth / 2);
    normals.push(0, 0, normalScale);
  }
  const bottomStart = points.length;
  for (const [x, y] of points) {
    positions.push(x, y, z - depth / 2);
    normals.push(0, 0, -normalScale);
  }
  for (let i = 1; i < points.length - 1; i += 1) {
    indices.push(topStart, topStart + i, topStart + i + 1);
    indices.push(bottomStart, bottomStart + i + 1, bottomStart + i);
  }
  for (let i = 0; i < points.length; i += 1) {
    const next = (i + 1) % points.length;
    const [x1, y1] = points[i];
    const [x2, y2] = points[next];
    const edgeX = x2 - x1;
    const edgeY = y2 - y1;
    const len = Math.max(0.0001, Math.hypot(edgeX, edgeY));
    const nx = edgeY / len;
    const ny = -edgeX / len;
    const start = positions.length / 3;
    positions.push(x1, y1, z - depth / 2, x2, y2, z - depth / 2, x2, y2, z + depth / 2, x1, y1, z + depth / 2);
    normals.push(nx, ny, 0, nx, ny, 0, nx, ny, 0, nx, ny, 0);
    indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  }
  return { positions, normals, indices };
}

function starZ(cx, cy, outer, inner, points = 8, depth = 0.03, z = 0) {
  const poly = [];
  for (let i = 0; i < points * 2; i += 1) {
    const a = -Math.PI / 2 + (i / (points * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? outer : inner;
    poly.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return polygonZ(poly, depth, z);
}

function diamondZ(cx, cy, w, h, depth = 0.03, z = 0) {
  return polygonZ([
    [cx, cy + h / 2],
    [cx + w / 2, cy],
    [cx, cy - h / 2],
    [cx - w / 2, cy],
  ], depth, z);
}

function roughStone(rx, ry, rz, rows = 20, cols = 36) {
  const positions = [], normals = [], indices = [];
  const bump = (row, col) => (
    1 + 0.055 * Math.sin(row * 1.9 + col * 0.7)
      + 0.035 * Math.sin(row * 0.8 - col * 1.3)
      + 0.025 * Math.cos(row * 2.7 + col * 1.1)
  );
  for (let row = 0; row <= rows; row += 1) {
    const v = row / rows;
    const theta = v * Math.PI;
    for (let col = 0; col <= cols; col += 1) {
      const u = col / cols;
      const phi = u * Math.PI * 2;
      const nx = Math.sin(theta) * Math.cos(phi);
      const ny = Math.cos(theta);
      const nz = Math.sin(theta) * Math.sin(phi);
      const r = bump(row, col);
      positions.push(nx * rx * r, ny * ry * r, nz * rz * r);
      normals.push(nx, ny, nz);
    }
  }
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const a = row * (cols + 1) + col;
      const b = a + cols + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { positions, normals, indices };
}

function cylinderZ(radius, depth, segments = 40, cx = 0, cy = 0, cz = 0) {
  const positions = [], normals = [], indices = [];
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const x = Math.cos(a) * radius + cx;
    const y = Math.sin(a) * radius + cy;
    positions.push(x, y, cz - depth / 2, x, y, cz + depth / 2);
    normals.push(Math.cos(a), Math.sin(a), 0, Math.cos(a), Math.sin(a), 0);
  }
  for (let i = 0; i < segments; i += 1) {
    const a = i * 2;
    indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const topCenter = positions.length / 3;
  positions.push(cx, cy, cz + depth / 2); normals.push(0, 0, 1);
  const bottomCenter = positions.length / 3;
  positions.push(cx, cy, cz - depth / 2); normals.push(0, 0, -1);
  for (let i = 0; i < segments; i += 1) {
    const a = i * 2;
    indices.push(topCenter, a + 1, a + 3);
    indices.push(bottomCenter, a + 2, a);
  }
  return { positions, normals, indices };
}

function sphere(rx, ry, rz, rows = 18, cols = 32, yOffset = 0) {
  const positions = [], normals = [], indices = [];
  for (let row = 0; row <= rows; row += 1) {
    const v = row / rows;
    const theta = v * Math.PI;
    for (let col = 0; col <= cols; col += 1) {
      const u = col / cols;
      const phi = u * Math.PI * 2;
      const nx = Math.sin(theta) * Math.cos(phi);
      const ny = Math.cos(theta);
      const nz = Math.sin(theta) * Math.sin(phi);
      positions.push(nx * rx, ny * ry + yOffset, nz * rz);
      normals.push(nx, ny, nz);
    }
  }
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const a = row * (cols + 1) + col;
      const b = a + cols + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { positions, normals, indices };
}

function cylinder(radius, height, segments = 64) {
  const positions = [], normals = [], indices = [];
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    positions.push(x, -height / 2, z, x, height / 2, z);
    normals.push(Math.cos(a), 0, Math.sin(a), Math.cos(a), 0, Math.sin(a));
  }
  for (let i = 0; i < segments; i += 1) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const topCenter = positions.length / 3;
  positions.push(0, height / 2, 0); normals.push(0, 1, 0);
  const bottomCenter = positions.length / 3;
  positions.push(0, -height / 2, 0); normals.push(0, -1, 0);
  for (let i = 0; i < segments; i += 1) {
    const a = i * 2;
    indices.push(topCenter, a + 3, a + 1);
    indices.push(bottomCenter, a, a + 2);
  }
  return { positions, normals, indices };
}

function torus(major, minor, rows = 12, cols = 80, y = 0.055) {
  const positions = [], normals = [], indices = [];
  for (let row = 0; row <= rows; row += 1) {
    const v = (row / rows) * Math.PI * 2;
    for (let col = 0; col <= cols; col += 1) {
      const u = (col / cols) * Math.PI * 2;
      const x = (major + minor * Math.cos(v)) * Math.cos(u);
      const z = (major + minor * Math.cos(v)) * Math.sin(u);
      const yy = minor * Math.sin(v) + y;
      positions.push(x, yy, z);
      normals.push(Math.cos(v) * Math.cos(u), Math.sin(v), Math.cos(v) * Math.sin(u));
    }
  }
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const a = row * (cols + 1) + col;
      const b = a + cols + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { positions, normals, indices };
}

function buildTarotCard() {
  const b = createBuilder('tarot-card');
  const card = b.addMaterial('deep lacquered tarot stock', [0.035, 0.027, 0.026, 1], 0.58, 0.02);
  const edge = b.addMaterial('polished gilded card edge', [1.0, 0.76, 0.24, 1], 0.24, 0.82);
  const foil = b.addMaterial('raised antique gold foil', [0.96, 0.68, 0.22, 1], 0.31, 0.68);
  const ivory = b.addMaterial('aged ivory enamel', [0.9, 0.79, 0.58, 1], 0.72, 0.06);
  const wine = b.addMaterial('oxblood enamel inlay', [0.34, 0.03, 0.07, 1], 0.52, 0.08);

  b.addMesh('beveled thick tarot body', merge(
    box(0, 0, 0, 1.36, 2.12, 0.095),
    box(0, 0, 0.012, 1.46, 1.98, 0.08),
    cylinderZ(0.105, 0.075, 32, -0.68, -1.0, 0.012),
    cylinderZ(0.105, 0.075, 32, 0.68, -1.0, 0.012),
    cylinderZ(0.105, 0.075, 32, -0.68, 1.0, 0.012),
    cylinderZ(0.105, 0.075, 32, 0.68, 1.0, 0.012),
  ), card);
  b.addMesh('golden beveled side rails', merge(
    box(0, 1.04, 0.07, 1.24, 0.035, 0.035),
    box(0, -1.04, 0.07, 1.24, 0.035, 0.035),
    box(-0.68, 0, 0.07, 0.035, 1.88, 0.035),
    box(0.68, 0, 0.07, 0.035, 1.88, 0.035),
    cylinderZ(0.058, 0.034, 28, -0.68, -1.04, 0.079),
    cylinderZ(0.058, 0.034, 28, 0.68, -1.04, 0.079),
    cylinderZ(0.058, 0.034, 28, -0.68, 1.04, 0.079),
    cylinderZ(0.058, 0.034, 28, 0.68, 1.04, 0.079),
  ), edge);
  b.addMesh('inner oracle frame and name plate', merge(
    box(0, 0.78, 0.096, 1.0, 0.022, 0.026),
    box(0, -0.78, 0.096, 1.0, 0.022, 0.026),
    box(-0.5, 0, 0.096, 0.022, 1.48, 0.026),
    box(0.5, 0, 0.096, 0.022, 1.48, 0.026),
    box(0, -0.91, 0.11, 0.52, 0.065, 0.025),
  ), foil);
  b.addMesh('central enamel window', merge(
    diamondZ(0, 0.12, 0.55, 0.78, 0.02, 0.104),
    cylinderZ(0.18, 0.018, 48, 0, 0.12, 0.116),
  ), wine);
  b.addMesh('moon and solar oracle sigils', merge(
    torus(0.22, 0.014, 8, 48, 0.132),
    cylinderZ(0.095, 0.018, 40, 0.08, 0.12, 0.145),
    starZ(0, 0.44, 0.105, 0.045, 8, 0.022, 0.128),
    starZ(-0.34, -0.36, 0.055, 0.025, 6, 0.018, 0.126),
    starZ(0.34, -0.36, 0.055, 0.025, 6, 0.018, 0.126),
    starZ(-0.35, 0.58, 0.04, 0.018, 5, 0.015, 0.126),
    starZ(0.35, 0.58, 0.04, 0.018, 5, 0.015, 0.126),
  ), ivory);
  b.addMesh('roman numeral and constellation studs', merge(
    box(-0.14, 0.91, 0.126, 0.028, 0.18, 0.02),
    box(0, 0.91, 0.126, 0.028, 0.18, 0.02),
    box(0.14, 0.91, 0.126, 0.028, 0.18, 0.02),
    ...Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return cylinderZ(0.014, 0.018, 16, Math.cos(a) * 0.38, Math.sin(a) * 0.58, 0.132);
    }),
  ), foil);
  b.write('tarot-card.glb');
}

function buildRuneStone() {
  const b = createBuilder('rune-stone');
  const stone = b.addMaterial('polished volcanic obsidian with uneven surface', [0.022, 0.027, 0.034, 1], 0.88, 0.22);
  const vein = b.addMaterial('subtle graphite mineral veins', [0.17, 0.17, 0.18, 1], 0.94, 0.05);
  const carved = b.addMaterial('gold dust settled into rune cuts', [0.91, 0.68, 0.25, 1], 0.38, 0.52);
  const glow = b.addMaterial('warm ritual ember inside cuts', [0.96, 0.43, 0.12, 1], 0.4, 0.18);
  b.addMesh('hand tumbled asymmetric rune stone', roughStone(0.96, 0.25, 0.68, 24, 42), stone);
  b.addMesh('natural mineral veins across stone', merge(
    boxBetween(-0.62, -0.02, 0.55, 0.08, 0.69, 0.018, 0.012),
    boxBetween(-0.5, 0.08, 0.3, 0.2, 0.69, 0.012, 0.012),
    boxBetween(-0.72, -0.14, 0.1, -0.2, 0.69, 0.012, 0.012),
  ), vein);
  b.addMesh('deep fehu rune engraved channel', merge(
    boxBetween(-0.12, -0.44, -0.12, 0.44, 0.73, 0.075, 0.035),
    boxBetween(-0.08, 0.28, 0.3, 0.46, 0.735, 0.07, 0.035),
    boxBetween(-0.08, 0.04, 0.24, 0.17, 0.735, 0.065, 0.035),
  ), carved);
  b.addMesh('inner amber highlight in rune grooves', merge(
    boxBetween(-0.12, -0.39, -0.12, 0.38, 0.762, 0.025, 0.016),
    boxBetween(-0.08, 0.28, 0.23, 0.42, 0.765, 0.023, 0.016),
    boxBetween(-0.08, 0.04, 0.18, 0.15, 0.765, 0.023, 0.016),
  ), glow);
  b.addMesh('small grounding chips around carved rune', merge(
    cylinderZ(0.025, 0.02, 16, -0.55, 0.22, 0.71),
    cylinderZ(0.018, 0.018, 16, 0.48, -0.18, 0.71),
    cylinderZ(0.016, 0.018, 16, 0.18, -0.42, 0.71),
    cylinderZ(0.02, 0.018, 16, -0.34, -0.24, 0.71),
  ), carved);
  b.write('rune-stone.glb');
}

function buildAstralPlate() {
  const b = createBuilder('astral-plate');
  const bronze = b.addMaterial('aged dark bronze astrolabe body', [0.34, 0.2, 0.08, 1], 0.5, 0.78);
  const gold = b.addMaterial('raised celestial brass engravings', [0.98, 0.73, 0.25, 1], 0.3, 0.7);
  const lapis = b.addMaterial('deep lapis enamel sky inlay', [0.03, 0.08, 0.17, 1], 0.46, 0.12);
  const ruby = b.addMaterial('red cardinal point inlays', [0.44, 0.03, 0.06, 1], 0.5, 0.16);
  b.addMesh('thick astrolabe bronze disk', merge(
    cylinder(1.16, 0.12, 128),
    cylinder(1.02, 0.035, 128),
  ), bronze);
  b.addMesh('lapis night sky recessed center', cylinder(0.68, 0.035, 96), lapis);
  b.addMesh('raised zodiac and house rings', merge(
    torus(0.34, 0.009, 8, 96, 0.083),
    torus(0.54, 0.01, 8, 96, 0.086),
    torus(0.76, 0.012, 8, 96, 0.089),
    torus(0.98, 0.014, 8, 96, 0.092),
    torus(1.12, 0.018, 8, 96, 0.095),
  ), gold);
  const marks = [];
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    marks.push(transformGeometryY(box(0, 0, 0, 0.035, 0.03, 0.22), {
      tx: Math.cos(a) * 0.92,
      ty: 0.1,
      tz: Math.sin(a) * 0.92,
      ry: -a,
    }));
  }
  b.addMesh('twelve raised house markers', merge(...marks), gold);
  const spokes = [];
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    spokes.push(boxBetweenXZ(Math.cos(a) * 0.36, Math.sin(a) * 0.36, Math.cos(a) * 1.02, Math.sin(a) * 1.02, 0.105, 0.01, 0.018));
  }
  b.addMesh('fine radial house lines', merge(...spokes), gold);
  b.addMesh('cardinal gemstone direction points', merge(
    diamondZ(0, 1.03, 0.11, 0.16, 0.028, 0.115),
    diamondZ(1.03, 0, 0.11, 0.16, 0.028, 0.115),
    diamondZ(0, -1.03, 0.11, 0.16, 0.028, 0.115),
    diamondZ(-1.03, 0, 0.11, 0.16, 0.028, 0.115),
  ), ruby);
  b.addMesh('sun moon and star markers', merge(
    cylinderZ(0.075, 0.028, 36, 0, 0, 0.13),
    torus(0.18, 0.01, 8, 48, 0.126),
    starZ(0.33, 0.22, 0.055, 0.026, 7, 0.02, 0.13),
    starZ(-0.28, -0.18, 0.045, 0.02, 6, 0.02, 0.13),
  ), gold);
  b.write('astral-plate.glb');
}

function buildHumanDesignBodygraph() {
  const b = createBuilder('human-design-bodygraph');
  const base = b.addMaterial('matte obsidian bodygraph plate', [0.016, 0.024, 0.036, 1], 0.7, 0.12);
  const backGlow = b.addMaterial('midnight blue aura glass', [0.035, 0.12, 0.18, 0.95], 0.44, 0.22);
  const gold = b.addMaterial('raised gold channels and gates', [0.95, 0.72, 0.24, 1], 0.34, 0.64);
  const glass = b.addMaterial('smoked translucent center inlays', [0.22, 0.33, 0.42, 0.92], 0.5, 0.18);
  const color = b.addMaterial('defined center enamel', [0.69, 0.38, 0.83, 1], 0.46, 0.2);
  const teal = b.addMaterial('teal throat enamel', [0.08, 0.58, 0.65, 1], 0.38, 0.28);
  const amber = b.addMaterial('solar amber enamel', [0.95, 0.55, 0.13, 1], 0.38, 0.26);
  const blue = b.addMaterial('electric blue channel light', [0.17, 0.62, 0.9, 1], 0.3, 0.36);
  const red = b.addMaterial('red definition enamel', [0.72, 0.08, 0.08, 1], 0.42, 0.18);
  const white = b.addMaterial('pearl undefined center enamel', [0.86, 0.82, 0.72, 1], 0.55, 0.08);

  const auraOuter = [];
  const auraInner = [];
  for (let i = 0; i < 84; i += 1) {
    const a1 = (i / 84) * Math.PI * 2;
    const a2 = ((i + 0.72) / 84) * Math.PI * 2;
    auraOuter.push(boxBetween(Math.cos(a1) * 0.72, Math.sin(a1) * 1.1, Math.cos(a2) * 0.72, Math.sin(a2) * 1.1, 0.145, 0.009, 0.026));
    if (i % 2 === 0) {
      auraInner.push(boxBetween(Math.cos(a1) * 0.54, Math.sin(a1) * 0.82, Math.cos(a2) * 0.54, Math.sin(a2) * 0.82, 0.155, 0.006, 0.018));
    }
  }

  b.addMesh('deep beveled bodygraph altar slab', merge(
    box(0, 0, -0.035, 1.5, 2.34, 0.095),
    box(0, 0, 0.02, 1.34, 2.08, 0.055),
    box(0, 1.15, 0.04, 0.82, 0.08, 0.05),
    box(0, -1.15, 0.04, 0.82, 0.08, 0.05),
  ), base);
  b.addMesh('blue glass aura body silhouette', merge(
    box(0, -0.02, 0.05, 0.82, 1.92, 0.028),
    cylinderZ(0.22, 0.03, 44, 0, 0.78, 0.07),
    cylinderZ(0.28, 0.03, 44, 0, -0.28, 0.07),
  ), backGlow);
  b.addMesh('floating golden aura rings', merge(...auraOuter, ...auraInner), gold);
  b.addMesh('outer raised rim', merge(
    box(0, 1.2, 0.105, 1.4, 0.035, 0.055),
    box(0, -1.2, 0.105, 1.4, 0.035, 0.055),
    box(-0.72, 0, 0.105, 0.035, 2.34, 0.055),
    box(0.72, 0, 0.105, 0.035, 2.34, 0.055),
  ), gold);

  const centers = {
    head: [0, 1.02, 0.075],
    ajna: [0, 0.72, 0.075],
    throat: [0, 0.38, 0.085],
    g: [0, 0.02, 0.09],
    heart: [0.36, -0.02, 0.075],
    sacral: [0, -0.38, 0.09],
    solar: [0.42, -0.42, 0.075],
    spleen: [-0.42, -0.42, 0.075],
    root: [0, -0.88, 0.085],
  };
  const channelPairs = [
    ['head', 'ajna'], ['ajna', 'throat'], ['throat', 'g'], ['g', 'sacral'],
    ['throat', 'spleen'], ['throat', 'heart'], ['throat', 'solar'],
    ['g', 'heart'], ['g', 'spleen'], ['g', 'solar'],
    ['heart', 'solar'], ['sacral', 'spleen'], ['sacral', 'solar'],
    ['root', 'sacral'], ['root', 'spleen'], ['root', 'solar'],
  ];
  b.addMesh('raised bodygraph channels', merge(...channelPairs.map(([a, c]) => {
    const [x1, y1] = centers[a];
    const [x2, y2] = centers[c];
    return boxBetween(x1, y1, x2, y2, 0.13, 0.024, 0.038);
  })), gold);
  b.addMesh('active blue definition channels', merge(
    boxBetween(centers.throat[0], centers.throat[1], centers.g[0], centers.g[1], 0.177, 0.014, 0.026),
    boxBetween(centers.g[0], centers.g[1], centers.sacral[0], centers.sacral[1], 0.177, 0.014, 0.026),
    boxBetween(centers.sacral[0], centers.sacral[1], centers.solar[0], centers.solar[1], 0.177, 0.014, 0.026),
    boxBetween(centers.root[0], centers.root[1], centers.sacral[0], centers.sacral[1], 0.177, 0.014, 0.026),
    boxBetween(centers.throat[0], centers.throat[1], centers.heart[0], centers.heart[1], 0.177, 0.014, 0.026),
  ), blue);

  const centerMeshes = Object.values(centers).map(([x, y], index) => {
    const radius = index === 4 ? 0.075 : 0.095;
    if (index === 0) return polygonZ([[x, y + 0.15], [x + 0.14, y - 0.09], [x - 0.14, y - 0.09]], 0.07, 0.18);
    if (index === 1) return polygonZ([[x, y - 0.15], [x + 0.14, y + 0.09], [x - 0.14, y + 0.09]], 0.07, 0.18);
    if (index === 3) return diamondZ(x, y, 0.22, 0.22, 0.07, 0.18);
    if (index === 4) return polygonZ([[x - 0.1, y - 0.07], [x + 0.12, y - 0.06], [x + 0.07, y + 0.1], [x - 0.08, y + 0.11]], 0.07, 0.18);
    return cylinderZ(radius, 0.07, 40, x, y, 0.18);
  });
  b.addMesh('nine sculpted human design centers', merge(...centerMeshes), glass);
  b.addMesh('defined center accents', merge(
    cylinderZ(0.06, 0.04, 36, centers.throat[0], centers.throat[1], 0.235),
    cylinderZ(0.06, 0.04, 36, centers.g[0], centers.g[1], 0.235),
    cylinderZ(0.06, 0.04, 36, centers.sacral[0], centers.sacral[1], 0.235),
  ), color);
  b.addMesh('teal throat and amber solar lights', merge(
    cylinderZ(0.04, 0.045, 32, centers.throat[0], centers.throat[1], 0.275),
    cylinderZ(0.052, 0.045, 32, centers.solar[0], centers.solar[1], 0.235),
  ), teal);
  b.addMesh('sacral golden power core', cylinderZ(0.052, 0.045, 32, centers.sacral[0], centers.sacral[1], 0.28), amber);
  b.addMesh('root and spleen definition enamel', merge(
    cylinderZ(0.052, 0.04, 32, centers.root[0], centers.root[1], 0.235),
    cylinderZ(0.052, 0.04, 32, centers.spleen[0], centers.spleen[1], 0.235),
  ), red);
  b.addMesh('pearl head and ajna highlights', merge(
    cylinderZ(0.044, 0.035, 28, centers.head[0], centers.head[1], 0.235),
    cylinderZ(0.044, 0.035, 28, centers.ajna[0], centers.ajna[1], 0.235),
  ), white);

  const gateDots = [];
  for (const [x, y] of Object.values(centers)) {
    for (let i = 0; i < 7; i += 1) {
      const a = (i / 7) * Math.PI * 2;
      gateDots.push(cylinderZ(0.019, 0.04, 18, x + Math.cos(a) * 0.17, y + Math.sin(a) * 0.17, 0.245));
    }
  }
  gateDots.push(cylinderZ(0.019, 0.04, 18, centers.heart[0] + 0.16, centers.heart[1], 0.245));
  b.addMesh('sixty-four gate studs', merge(...gateDots.slice(0, 64)), gold);
  b.addMesh('incised gate number ticks', merge(
    ...gateDots.slice(0, 64).map((_, i) => {
      const a = (i / 64) * Math.PI * 2;
      return box(Math.cos(a) * 0.64, Math.sin(a) * 1.0, 0.27, 0.02, 0.006, 0.022);
    }),
  ), white);
  b.addMesh('constellation corner stars', merge(
    starZ(-0.52, 0.96, 0.045, 0.018, 7, 0.026, 0.24),
    starZ(0.5, 0.92, 0.035, 0.014, 6, 0.022, 0.24),
    starZ(-0.55, -0.92, 0.034, 0.014, 6, 0.022, 0.24),
    starZ(0.52, -0.94, 0.046, 0.018, 7, 0.026, 0.24),
  ), gold);

  b.write('human-design-bodygraph.glb');
}

buildTarotCard();
buildRuneStone();
buildAstralPlate();
buildHumanDesignBodygraph();
console.log(`AR assets written to ${outDir}`);
