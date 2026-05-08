export class UI {
    constructor() {
        this.menuScreen = document.getElementById('menuScreen');
        this.upgradeScreen = document.getElementById('upgradeScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.upgradeCards = document.getElementById('upgradeCards');
        this.waveAnnounce = document.getElementById('waveAnnounce');

        this.onStart = null;
        this.onRestart = null;
        this.onUpgradeSelect = null;

        document.getElementById('startBtn').addEventListener('click', () => {
            if (this.onStart) this.onStart();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            if (this.onRestart) this.onRestart();
        });
    }

    showMenu() {
        this.menuScreen.classList.add('active');
        this.upgradeScreen.classList.remove('active');
        this.gameOverScreen.classList.remove('active');
    }

    hideMenu() { this.menuScreen.classList.remove('active'); }

    showUpgrade(upgrades) {
        this.upgradeCards.innerHTML = '';
        upgrades.forEach((upg, i) => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.style.setProperty('--accent', upg.color);
            card.style.animationDelay = `${i * 0.1}s`;
            card.innerHTML = `
                <div class="upgrade-icon">${upg.icon}</div>
                <div class="upgrade-name">${upg.name}</div>
                <div class="upgrade-desc">${upg.description}</div>
            `;
            card.addEventListener('click', () => {
                if (this.onUpgradeSelect) this.onUpgradeSelect(upg);
            });
            this.upgradeCards.appendChild(card);
        });
        this.upgradeScreen.classList.add('active');
    }

    hideUpgrade() { this.upgradeScreen.classList.remove('active'); }

    showGameOver(wave, score, highScore) {
        document.getElementById('finalWave').textContent = wave;
        document.getElementById('finalScore').textContent = score.toLocaleString();
        document.getElementById('highScoreVal').textContent = highScore.toLocaleString();
        this.gameOverScreen.classList.add('active');
    }

    hideGameOver() { this.gameOverScreen.classList.remove('active'); }

    announceWave(waveNum) {
        this.waveAnnounce.textContent = `ONDA ${waveNum}`;
        this.waveAnnounce.classList.add('active');
        setTimeout(() => { this.waveAnnounce.classList.remove('active'); }, 1500);
    }

    drawHUD(ctx, player, waveManager, score, canvasW) {
        ctx.save();
        const barW = 200, barH = 16, barX = 20, barY = 20;
        const hpRatio = player.hp / player.maxHp;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this._roundRect(ctx, barX - 2, barY - 2, barW + 4, barH + 4, 4);
        ctx.fill();

        const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        if (hpRatio > 0.5) {
            grad.addColorStop(0, '#44FF44'); grad.addColorStop(1, '#22CC22');
        } else if (hpRatio > 0.25) {
            grad.addColorStop(0, '#FFAA00'); grad.addColorStop(1, '#FF8800');
        } else {
            grad.addColorStop(0, '#FF4444'); grad.addColorStop(1, '#CC2222');
        }
        ctx.fillStyle = grad;
        this._roundRect(ctx, barX, barY, barW * hpRatio, barH, 3);
        ctx.fill();

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${player.hp} / ${player.maxHp}`, barX + barW / 2, barY + barH - 3);

        const xpBarY = barY + barH + 8;
        const xpRatio = player.xp / player.xpToNext;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this._roundRect(ctx, barX - 2, xpBarY - 2, barW + 4, 10, 3);
        ctx.fill();
        ctx.fillStyle = '#AA88FF';
        this._roundRect(ctx, barX, xpBarY, barW * xpRatio, 6, 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`LV ${player.level}`, barX + barW + 8, xpBarY + 6);

        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 16px Orbitron, sans-serif';
        ctx.fillText(`ONDA ${waveManager.wave}`, canvasW / 2, 30);

        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(`Inimigos: ${waveManager.enemiesRemaining}`, canvasW / 2, 50);

        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = 'bold 14px Orbitron, sans-serif';
        ctx.fillText(score.toLocaleString(), canvasW - 20, 30);
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('SCORE', canvasW - 20, 44);

        ctx.restore();
    }

    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
    }
}
