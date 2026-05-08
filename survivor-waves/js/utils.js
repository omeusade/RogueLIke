export function dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

export function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}

export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

export function circleCollision(x1, y1, r1, x2, y2, r2) {
    return dist(x1, y1, x2, y2) < r1 + r2;
}

export function normalize(x, y) {
    const len = Math.sqrt(x * x + y * y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: x / len, y: y / len };
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function randomPointOnScreenEdge(cx, cy, w, h, margin) {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    switch (side) {
        case 0: x = cx - w / 2 - margin; y = randomRange(cy - h / 2, cy + h / 2); break;
        case 1: x = cx + w / 2 + margin; y = randomRange(cy - h / 2, cy + h / 2); break;
        case 2: x = randomRange(cx - w / 2, cx + w / 2); y = cy - h / 2 - margin; break;
        case 3: x = randomRange(cx - w / 2, cx + w / 2); y = cy + h / 2 + margin; break;
    }
    return { x, y };
}
