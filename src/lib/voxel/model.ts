/**
 * VoxelModel — a dense block grid with a builder API.
 * All structures in Kalpana are authored through these ops (procedural,
 * seeded, deterministic) — the "voxel kit" composes them.
 */
export class VoxelModel {
  readonly nx: number;
  readonly ny: number;
  readonly nz: number;
  readonly data: Uint8Array;

  constructor(nx: number, ny: number, nz: number) {
    this.nx = nx;
    this.ny = ny;
    this.nz = nz;
    this.data = new Uint8Array(nx * ny * nz);
  }

  idx(x: number, y: number, z: number): number {
    return x + this.nx * (y + this.ny * z);
  }

  inBounds(x: number, y: number, z: number): boolean {
    return (
      x >= 0 && x < this.nx && y >= 0 && y < this.ny && z >= 0 && z < this.nz
    );
  }

  get(x: number, y: number, z: number): number {
    return this.inBounds(x, y, z) ? this.data[this.idx(x, y, z)] : 0;
  }

  set(x: number, y: number, z: number, b: number): void {
    if (this.inBounds(x, y, z)) this.data[this.idx(x, y, z)] = b;
  }

  /** solid box, inclusive coords */
  fill(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, b: number): void {
    const [xa, xb] = x0 <= x1 ? [x0, x1] : [x1, x0];
    const [ya, yb] = y0 <= y1 ? [y0, y1] : [y1, y0];
    const [za, zb] = z0 <= z1 ? [z0, z1] : [z1, z0];
    for (let z = za; z <= zb; z++)
      for (let y = ya; y <= yb; y++)
        for (let x = xa; x <= xb; x++) this.set(x, y, z, b);
  }

  /** hollow box shell (walls only, no top/bottom unless flagged) */
  walls(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, b: number): void {
    for (let y = y0; y <= y1; y++)
      for (let z = z0; z <= z1; z++)
        for (let x = x0; x <= x1; x++)
          if (x === x0 || x === x1 || z === z0 || z === z1) this.set(x, y, z, b);
  }

  /** filled ellipsoid centered at (cx,cy,cz) with radii */
  ellipsoid(cx: number, cy: number, cz: number, rx: number, ry: number, rz: number, b: number): void {
    for (let z = Math.floor(cz - rz); z <= Math.ceil(cz + rz); z++)
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
        for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
          const dx = (x - cx) / rx;
          const dy = (y - cy) / ry;
          const dz = (z - cz) / rz;
          if (dx * dx + dy * dy + dz * dz <= 1) this.set(x, y, z, b);
        }
  }

  sphere(cx: number, cy: number, cz: number, r: number, b: number): void {
    this.ellipsoid(cx, cy, cz, r, r, r, b);
  }

  /** vertical cylinder */
  cylinder(cx: number, y0: number, y1: number, cz: number, r: number, b: number): void {
    for (let y = y0; y <= y1; y++)
      for (let z = Math.floor(cz - r); z <= Math.ceil(cz + r); z++)
        for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
          const dx = x - cx;
          const dz = z - cz;
          if (dx * dx + dz * dz <= r * r + 0.3) this.set(x, y, z, b);
        }
  }

  /** cylinder ring (hollow) */
  ring(cx: number, y: number, cz: number, r: number, b: number): void {
    for (let z = Math.floor(cz - r - 1); z <= Math.ceil(cz + r + 1); z++)
      for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++) {
        const d = Math.sqrt((x - cx) ** 2 + (z - cz) ** 2);
        if (d <= r + 0.45 && d >= r - 0.45) this.set(x, y, z, b);
      }
  }

  /** upward cone (for roofs/spires): radius shrinks from rBase at y0 to 0 at y1 */
  cone(cx: number, y0: number, y1: number, cz: number, rBase: number, b: number): void {
    const h = y1 - y0;
    for (let y = y0; y <= y1; y++) {
      const r = rBase * (1 - (y - y0) / Math.max(1, h));
      for (let z = Math.floor(cz - r); z <= Math.ceil(cz + r); z++)
        for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
          const dx = x - cx;
          const dz = z - cz;
          if (dx * dx + dz * dz <= r * r + 0.3) this.set(x, y, z, b);
        }
    }
  }

  /** 3D voxel line (Bresenham-ish via stepping) */
  line(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, b: number): void {
    const steps = Math.max(
      Math.abs(x1 - x0),
      Math.abs(y1 - y0),
      Math.abs(z1 - z0),
      1
    );
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.set(
        Math.round(x0 + (x1 - x0) * t),
        Math.round(y0 + (y1 - y0) * t),
        Math.round(z0 + (z1 - z0) * t),
        b
      );
    }
  }

  /** gabled roof over a rect footprint, ridge along x */
  gableRoof(x0: number, z0: number, x1: number, z1: number, yBase: number, b: number, overhang = 1): void {
    const zc = (z0 + z1) / 2;
    const half = (z1 - z0) / 2 + overhang;
    for (let step = 0; step <= half; step++) {
      const y = yBase + step;
      const za = Math.round(zc - (half - step));
      const zb = Math.round(zc + (half - step));
      for (let x = x0 - overhang; x <= x1 + overhang; x++) {
        this.set(x, y, za, b);
        this.set(x, y, zb, b);
        if (za === zb || zb - za <= 1) this.set(x, y, Math.round(zc), b);
      }
    }
  }
}
