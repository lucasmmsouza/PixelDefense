export function getDistance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function getClosestPointOnPath(x, y, path) {
  let minDist = Infinity;
  let closest = {x: x, y: y};

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i+1];
    const pt = getClosestPointOnSegment(x, y, p1.x, p1.y, p2.x, p2.y);
    const dist = getDistance(x, y, pt.x, pt.y);

    if (dist < minDist) {
      minDist = dist;
      closest = pt;
    }
  }
  return closest;
}

function getClosestPointOnSegment(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;
  if (param < 0) { xx = x1; yy = y1; }
  else if (param > 1) { xx = x2; yy = y2; }
  else { xx = x1 + param * C; yy = y1 + param * D; }

  return { x: xx, y: yy };
}
