import { clamp } from './utils.js';

export class Camera {
    constructor(worldWidth, worldHeight) {
        this.x = 0;
        this.y = 0;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.shakeIntensity = 0;
        this.shakeTimer = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    follow(target, canvasWidth, canvasHeight, dt) {
        const targetX = target.x - canvasWidth / 2;
        const targetY = target.y - canvasHeight / 2;

        this.x += (targetX - this.x) * 6 * dt;
        this.y += (targetY - this.y) * 6 * dt;

        this.x = clamp(this.x, 0, Math.max(0, this.worldWidth - canvasWidth));
        this.y = clamp(this.y, 0, Math.max(0, this.worldHeight - canvasHeight));

        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            const factor = this.shakeTimer > 0 ? this.shakeTimer / 0.3 : 0;
            this.offsetX = (Math.random() - 0.5) * this.shakeIntensity * 2 * factor;
            this.offsetY = (Math.random() - 0.5) * this.shakeIntensity * 2 * factor;
        } else {
            this.offsetX = 0;
            this.offsetY = 0;
        }
    }

    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    }

    applyTransform(ctx) {
        ctx.translate(
            Math.round(-this.x + this.offsetX),
            Math.round(-this.y + this.offsetY)
        );
    }
}
