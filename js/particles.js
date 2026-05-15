import { randomRange } from './utils.js';

export class Particle {
    constructor(x, y, vx, vy, radius, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.alive = true;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
    }

    get alpha() {
        return Math.max(0, this.life / this.maxLife);
    }
}

export function spawnDeathParticles(particles, x, y, color = '#FF3333', count = 12) {
    for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + randomRange(-0.3, 0.3);
        const speed = randomRange(80, 200);
        particles.push(new Particle(
            x, y,
            Math.cos(a) * speed,
            Math.sin(a) * speed,
            randomRange(2, 5),
            color,
            randomRange(0.2, 0.5)
        ));
    }
}

export function spawnHitParticles(particles, x, y, count = 5) {
    for (let i = 0; i < count; i++) {
        const a = randomRange(0, Math.PI * 2);
        const speed = randomRange(40, 120);
        particles.push(new Particle(
            x, y,
            Math.cos(a) * speed,
            Math.sin(a) * speed,
            randomRange(1, 3),
            '#FFFF88',
            randomRange(0.1, 0.25)
        ));
    }
}

export function spawnXPParticles(particles, x, y, count = 6) {
    for (let i = 0; i < count; i++) {
        const a = randomRange(0, Math.PI * 2);
        const speed = randomRange(30, 80);
        particles.push(new Particle(
            x, y,
            Math.cos(a) * speed,
            Math.sin(a) * speed,
            randomRange(1, 3),
            '#44FF88',
            randomRange(0.15, 0.3)
        ));
    }
}
