import { dist, normalize, clamp, angle, randomRange } from './utils.js';

// ── Base Enemy ──
export class Enemy {
    constructor(x, y, hp, speed, contactDamage, xpValue, type = 'normal') {
        this.x = x;
        this.y = y;
        this.hp = hp;
        this.maxHp = hp;
        this.speed = speed;
        this.contactDamage = contactDamage;
        this.xpValue = xpValue;
        this.type = type;
        this.radius = clamp(10 + hp * 0.15, 10, 22);
        this.alive = true;
        this.flashTimer = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.fireTimer = randomRange(1.0, 2.5);
        this.fireInterval = 2.2;
        this.preferredDist = 250;
        this.shieldAngle = Math.random() * Math.PI * 2;
        this.shieldArc = Math.PI * 0.7;
        this.shieldSpeed = 1.8;
        this.shieldHits = 0;
    }

    update(dt, playerX, playerY, enemies, enemyProjectiles) {
        const dirToPlayer = normalize(playerX - this.x, playerY - this.y);
        const distToPlayer = dist(this.x, this.y, playerX, playerY);

        if (this.type === 'ranged') {
            this._updateRanged(dt, playerX, playerY, dirToPlayer, distToPlayer, enemyProjectiles);
        } else if (this.type === 'shielded') {
            this._updateShielded(dt, dirToPlayer);
        } else {
            this.x += dirToPlayer.x * this.speed * dt;
            this.y += dirToPlayer.y * this.speed * dt;
        }

        for (const other of enemies) {
            if (other === this || !other.alive) continue;
            const d = dist(this.x, this.y, other.x, other.y);
            const minDist = this.radius + other.radius;
            if (d < minDist && d > 0) {
                const pushX = (this.x - other.x) / d;
                const pushY = (this.y - other.y) / d;
                const overlap = (minDist - d) * 0.5;
                this.x += pushX * overlap;
                this.y += pushY * overlap;
            }
        }

        this.pulsePhase += dt * 3;
        if (this.flashTimer > 0) this.flashTimer -= dt;
    }

    _updateRanged(dt, playerX, playerY, dir, distance, enemyProjectiles) {
        if (distance > this.preferredDist + 40) {
            this.x += dir.x * this.speed * dt;
            this.y += dir.y * this.speed * dt;
        } else if (distance < this.preferredDist - 40) {
            this.x -= dir.x * this.speed * 0.7 * dt;
            this.y -= dir.y * this.speed * 0.7 * dt;
        } else {
            this.x += -dir.y * this.speed * 0.5 * dt;
            this.y += dir.x * this.speed * 0.5 * dt;
        }

        this.fireTimer -= dt;
        if (this.fireTimer <= 0 && enemyProjectiles) {
            this.fireTimer = this.fireInterval;
            const a = angle(this.x, this.y, playerX, playerY);
            const speed = 180;
            enemyProjectiles.push(new EnemyProjectile(
                this.x, this.y,
                Math.cos(a) * speed, Math.sin(a) * speed, 8
            ));
        }
    }

    _updateShielded(dt, dir) {
        this.x += dir.x * this.speed * dt;
        this.y += dir.y * this.speed * dt;
        this.shieldAngle += this.shieldSpeed * dt;
    }

    isShieldBlocking(projX, projY) {
        if (this.type !== 'shielded') return false;
        const hitAngle = Math.atan2(projY - this.y, projX - this.x);
        let diff = hitAngle - this.shieldAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return Math.abs(diff) < this.shieldArc / 2;
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.flashTimer = 0.1;
        if (this.hp <= 0) this.alive = false;
    }
}

// ── Enemy Projectile ──
export class EnemyProjectile {
    constructor(x, y, vx, vy, damage) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.damage = damage;
        this.radius = 4;
        this.alive = true;
        this.life = 4.0;
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
    }
}

// ── XP Orb ──
export class XPOrb {
    constructor(x, y, value) {
        this.x = x; this.y = y;
        this.value = value;
        this.radius = 5;
        this.alive = true;
        this.attractRange = 80;
        this.collectRange = 18;
        this.bobPhase = Math.random() * Math.PI * 2;
    }
    update(dt, playerX, playerY) {
        this.bobPhase += dt * 4;
        const d = dist(this.x, this.y, playerX, playerY);
        if (d < this.attractRange) {
            const dir = normalize(playerX - this.x, playerY - this.y);
            const speed = 300 * (1 - d / this.attractRange);
            this.x += dir.x * speed * dt;
            this.y += dir.y * speed * dt;
        }
        if (d < this.collectRange) {
            this.alive = false;
            return true;
        }
        return false;
    }
}
