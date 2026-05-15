export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.gridSize = 60;
    }

    drawBackground(camX, camY, canvasW, canvasH, worldW, worldH) {
        const ctx = this.ctx;
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, worldW, worldH);

        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        const startX = Math.floor(camX / this.gridSize) * this.gridSize;
        const startY = Math.floor(camY / this.gridSize) * this.gridSize;

        for (let x = startX; x < camX + canvasW + this.gridSize; x += this.gridSize) {
            ctx.beginPath(); ctx.moveTo(x, camY); ctx.lineTo(x, camY + canvasH); ctx.stroke();
        }
        for (let y = startY; y < camY + canvasH + this.gridSize; y += this.gridSize) {
            ctx.beginPath(); ctx.moveTo(camX, y); ctx.lineTo(camX + canvasW, y); ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(255, 60, 60, 0.3)';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, worldW, worldH);
    }

    drawPlayer(player) {
        const ctx = this.ctx;
        const { x, y, radius, aimAngle, invincible, invTimer, flashAlpha } = player;
        ctx.save();

        if (invincible && Math.floor(invTimer * 15) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#00E5FF';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#005566';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        const eyeX = x + Math.cos(aimAngle) * radius * 0.55;
        const eyeY = y + Math.sin(aimAngle) * radius * 0.55;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (flashAlpha > 0) {
            ctx.globalAlpha = flashAlpha * 0.6;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawEnemy(enemy) {
        switch (enemy.type) {
            case 'ranged': this._drawRangedEnemy(enemy); break;
            case 'shielded': this._drawShieldedEnemy(enemy); break;
            default: this._drawNormalEnemy(enemy); break;
        }
    }

    _drawNormalEnemy(enemy) {
        const ctx = this.ctx;
        const { x, y, radius, hp, maxHp, flashTimer, pulsePhase } = enemy;
        const pulse = 1 + Math.sin(pulsePhase) * 0.06;
        const r = radius * pulse;
        ctx.save();

        if (flashTimer > 0) {
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#FFFFFF';
        } else {
            ctx.shadowColor = '#FF3333';
            ctx.shadowBlur = 10;
            const hpRatio = hp / maxHp;
            ctx.fillStyle = `rgb(255,${Math.round(50 * hpRatio)},${Math.round(50 * hpRatio)})`;
        }

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
        ctx.fill();

        this._drawEnemyHPBar(enemy);
        ctx.restore();
    }

    _drawRangedEnemy(enemy) {
        const ctx = this.ctx;
        const { x, y, radius, flashTimer, pulsePhase } = enemy;
        const pulse = 1 + Math.sin(pulsePhase) * 0.05;
        const r = radius * pulse;
        ctx.save();

        if (flashTimer > 0) {
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#FFFFFF';
        } else {
            ctx.shadowColor = '#FF8800';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#FF8800';
        }

        ctx.beginPath();
        ctx.moveTo(x, y - r * 1.2);
        ctx.lineTo(x + r, y);
        ctx.lineTo(x, y + r * 1.2);
        ctx.lineTo(x - r, y);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = flashTimer > 0 ? '#FFFFFF' : 'rgba(255, 136, 0, 0.5)';
        ctx.lineWidth = 1.5;
        const cr = r * 0.55;
        ctx.beginPath();
        ctx.moveTo(x - cr, y); ctx.lineTo(x + cr, y);
        ctx.moveTo(x, y - cr); ctx.lineTo(x, y + cr);
        ctx.stroke();

        this._drawEnemyHPBar(enemy);
        ctx.restore();
    }

    _drawShieldedEnemy(enemy) {
        const ctx = this.ctx;
        const { x, y, radius, flashTimer, pulsePhase, shieldAngle, shieldArc } = enemy;
        const pulse = 1 + Math.sin(pulsePhase) * 0.04;
        const r = radius * pulse;
        ctx.save();

        if (flashTimer > 0) {
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#FFFFFF';
        } else {
            ctx.shadowColor = '#CC3366';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#CC3366';
        }

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = flashTimer > 0 ? '#FFFFFF' : '#FF4477';
        ctx.beginPath();
        ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
        ctx.fill();

        const shieldR = r + 6;
        ctx.strokeStyle = '#44DDFF';
        ctx.shadowColor = '#44DDFF';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(x, y, shieldR, shieldAngle - shieldArc / 2, shieldAngle + shieldArc / 2);
        ctx.stroke();

        ctx.fillStyle = '#88EEFF';
        ctx.shadowBlur = 6;
        const a1 = shieldAngle - shieldArc / 2;
        const a2 = shieldAngle + shieldArc / 2;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a1) * shieldR, y + Math.sin(a1) * shieldR, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + Math.cos(a2) * shieldR, y + Math.sin(a2) * shieldR, 2.5, 0, Math.PI * 2);
        ctx.fill();

        this._drawEnemyHPBar(enemy);
        ctx.restore();
    }

    _drawEnemyHPBar(enemy) {
        const ctx = this.ctx;
        if (enemy.hp >= enemy.maxHp) return;
        const barW = enemy.radius * 2.5;
        const barH = 3;
        const barX = enemy.x - barW / 2;
        const barY = enemy.y - enemy.radius - 8;
        const hpRatio = enemy.hp / enemy.maxHp;

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = hpRatio > 0.5 ? '#44FF44' : hpRatio > 0.25 ? '#FFAA00' : '#FF3333';
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
    }

    drawProjectile(proj) {
        const ctx = this.ctx;
        ctx.save();
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFCC';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawEnemyProjectile(proj) {
        const ctx = this.ctx;
        ctx.save();
        ctx.shadowColor = '#FF4400';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#FF6622';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFAA66';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawXPOrb(orb) {
        const ctx = this.ctx;
        const bob = Math.sin(orb.bobPhase) * 2;
        const y = orb.y + bob;
        ctx.save();
        ctx.shadowColor = '#44FF88';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#44FF88';
        ctx.beginPath();
        ctx.moveTo(orb.x, y - orb.radius);
        ctx.lineTo(orb.x + orb.radius * 0.7, y);
        ctx.lineTo(orb.x, y + orb.radius);
        ctx.lineTo(orb.x - orb.radius * 0.7, y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawParticle(particle) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * particle.alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
