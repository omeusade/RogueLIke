import { clamp } from './utils.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 14;
        this.hp = 100;
        this.maxHp = 100;
        this.speed = 210;
        this.damage = 10;
        this.fireInterval = 1.0;
        this.fireTimer = 0;
        this.multishot = 1;
        this.xp = 0;
        this.level = 1;
        this.xpToNext = 60;
        this.invincible = false;
        this.invTimer = 0;
        this.invDuration = 0.5;
        this.aimAngle = 0;
        this.flashAlpha = 0;
    }

    update(dt, input, worldW, worldH) {
        const move = input.getMovement();
        this.x += move.x * this.speed * dt;
        this.y += move.y * this.speed * dt;
        this.x = clamp(this.x, this.radius, worldW - this.radius);
        this.y = clamp(this.y, this.radius, worldH - this.radius);
        this.fireTimer -= dt;
        if (this.invTimer > 0) {
            this.invTimer -= dt;
            if (this.invTimer <= 0) this.invincible = false;
        }
        if (this.flashAlpha > 0) this.flashAlpha -= dt * 4;
    }

    takeDamage(amount) {
        if (this.invincible) return false;
        this.hp -= amount;
        this.invincible = true;
        this.invTimer = this.invDuration;
        this.flashAlpha = 1;
        if (this.hp <= 0) this.hp = 0;
        return true;
    }

    addXP(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.level++;
            this.xpToNext = 60 + (this.level - 1) * 30;
            return true;
        }
        return false;
    }

    canFire() { return this.fireTimer <= 0; }
    resetFireTimer() { this.fireTimer = this.fireInterval; }
}
