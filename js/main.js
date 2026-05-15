import { dist, angle, circleCollision } from './utils.js';
import { Input } from './input.js';
import { AudioManager } from './audio.js';
import { Camera } from './camera.js';
import { Player } from './player.js';
import { Projectile } from './projectile.js';
import { XPOrb } from './enemy.js';
import { WaveManager } from './wave.js';
import { UpgradeSystem } from './upgrade.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';
import { spawnDeathParticles, spawnHitParticles, spawnXPParticles } from './particles.js';

const WORLD_W = 2400;
const WORLD_H = 1800;
const PROJECTILE_SPEED = 500;

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.input = new Input(this.canvas);
        this.audio = new AudioManager();
        this.camera = new Camera(WORLD_W, WORLD_H);
        this.renderer = new Renderer(this.ctx);
        this.ui = new UI();
        this.upgradeSystem = new UpgradeSystem();

        this.state = 'MENU';
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.particles = [];
        this.xpOrbs = [];
        this.waveManager = null;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('survivorWavesHS') || '0');
        this.upgradeQueue = 0;
        this.lastTime = 0;

        this.ui.onStart = () => this.startGame();
        this.ui.onRestart = () => this.startGame();
        this.ui.onUpgradeSelect = (upg) => this.selectUpgrade(upg);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.ui.showMenu();
        requestAnimationFrame((t) => this.loop(t));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    startGame() {
        this.audio.init();
        this.state = 'PLAYING';
        this.player = new Player(WORLD_W / 2, WORLD_H / 2);
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.particles = [];
        this.xpOrbs = [];
        this.waveManager = new WaveManager();
        this.upgradeSystem.reset();
        this.score = 0;
        this.upgradeQueue = 0;

        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;

        this.ui.hideMenu();
        this.ui.hideGameOver();
        this.ui.hideUpgrade();

        this.waveManager.intermissionTimer = 1.5;
    }

    selectUpgrade(upgrade) {
        this.upgradeSystem.applyUpgrade(upgrade, this.player);
        this.audio.play('upgrade');
        this.ui.hideUpgrade();
        this.upgradeQueue--;

        if (this.upgradeQueue > 0) {
            setTimeout(() => this.showUpgradeScreen(), 200);
        } else {
            this.state = 'PLAYING';
        }
    }

    showUpgradeScreen() {
        const upgrades = this.upgradeSystem.getRandomUpgrades(3);
        if (upgrades.length === 0) {
            this.upgradeQueue = 0;
            this.state = 'PLAYING';
            return;
        }
        this.state = 'UPGRADE';
        this.ui.showUpgrade(upgrades);
    }

    gameOver() {
        this.state = 'GAME_OVER';
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('survivorWavesHS', this.highScore.toString());
        }
        this.ui.showGameOver(this.waveManager.wave, this.score, this.highScore);
    }

    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        if (this.state === 'PLAYING') {
            this.update(dt);
        }

        for (const p of this.particles) p.update(dt);
        this.particles = this.particles.filter(p => p.alive);

        this.render();
        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        this.player.update(dt, this.input, WORLD_W, WORLD_H);

        // Aim toward mouse cursor
        const worldMouseX = this.input.mouseX + this.camera.x - this.camera.offsetX;
        const worldMouseY = this.input.mouseY + this.camera.y - this.camera.offsetY;
        this.player.aimAngle = angle(this.player.x, this.player.y, worldMouseX, worldMouseY);

        // Manual fire: hold mouse button to shoot
        if (this.input.mouseDown && this.player.canFire()) {
            this.fireProjectiles();
            this.player.resetFireTimer();
        }

        for (const p of this.projectiles) p.update(dt);
        for (const ep of this.enemyProjectiles) ep.update(dt);
        for (const e of this.enemies) {
            e.update(dt, this.player.x, this.player.y, this.enemies, this.enemyProjectiles);
        }

        // XP Orbs
        for (const orb of this.xpOrbs) {
            const collected = orb.update(dt, this.player.x, this.player.y);
            if (collected) {
                spawnXPParticles(this.particles, orb.x, orb.y);
                const leveledUp = this.player.addXP(orb.value);
                this.score += orb.value;
                if (leveledUp) {
                    this.audio.play('levelUp');
                    this.upgradeQueue++;
                }
            }
        }

        // Collision: player projectiles vs enemies
        for (const p of this.projectiles) {
            if (!p.alive) continue;
            for (const e of this.enemies) {
                if (!e.alive) continue;
                if (circleCollision(p.x, p.y, p.radius, e.x, e.y, e.radius)) {
                    if (e.isShieldBlocking(p.x, p.y)) {
                        p.alive = false;
                        spawnHitParticles(this.particles, p.x, p.y);
                        this.audio.play('hit');
                        break;
                    }
                    e.takeDamage(p.damage);
                    p.alive = false;
                    spawnHitParticles(this.particles, p.x, p.y);
                    this.audio.play('hit');

                    if (!e.alive) {
                        const color = e.type === 'ranged' ? '#FF8800' :
                            e.type === 'shielded' ? '#CC3366' : '#FF3333';
                        spawnDeathParticles(this.particles, e.x, e.y, color, 14);
                        this.xpOrbs.push(new XPOrb(e.x, e.y, e.xpValue));
                        this.score += 50;
                        this.audio.play('kill');
                    }
                    break;
                }
            }
        }

        // Collision: enemy projectiles vs player
        for (const ep of this.enemyProjectiles) {
            if (!ep.alive) continue;
            if (circleCollision(ep.x, ep.y, ep.radius, this.player.x, this.player.y, this.player.radius)) {
                ep.alive = false;
                const hit = this.player.takeDamage(ep.damage);
                if (hit) {
                    this.camera.shake(6, 0.2);
                    this.audio.play('playerHit');
                    spawnHitParticles(this.particles, ep.x, ep.y);
                    if (this.player.hp <= 0) {
                        spawnDeathParticles(this.particles, this.player.x, this.player.y, '#00E5FF', 20);
                        this.gameOver();
                        return;
                    }
                }
            }
        }

        // Collision: enemies vs player (contact)
        for (const e of this.enemies) {
            if (!e.alive) continue;
            if (circleCollision(e.x, e.y, e.radius, this.player.x, this.player.y, this.player.radius)) {
                const hit = this.player.takeDamage(e.contactDamage);
                if (hit) {
                    this.camera.shake(8, 0.25);
                    this.audio.play('playerHit');
                    if (this.player.hp <= 0) {
                        spawnDeathParticles(this.particles, this.player.x, this.player.y, '#00E5FF', 20);
                        this.gameOver();
                        return;
                    }
                }
            }
        }

        // Cleanup dead entities
        this.projectiles = this.projectiles.filter(p => p.alive);
        this.enemyProjectiles = this.enemyProjectiles.filter(p => p.alive);
        this.enemies = this.enemies.filter(e => e.alive);
        this.xpOrbs = this.xpOrbs.filter(o => o.alive);

        // Wave management
        const waveEvent = this.waveManager.update(
            dt, this.player.x, this.player.y,
            this.canvas.width, this.canvas.height,
            this.enemies
        );

        if (waveEvent === 'WAVE_START') {
            this.audio.play('waveStart');
            this.ui.announceWave(this.waveManager.wave);
        }

        if (waveEvent === 'WAVE_CLEAR') {
            this.upgradeQueue++;
        }

        // Show upgrade screen if queued
        if (this.upgradeQueue > 0 && this.state === 'PLAYING') {
            this.showUpgradeScreen();
        }

        this.camera.follow(this.player, this.canvas.width, this.canvas.height, dt);
    }

    fireProjectiles() {
        const aimAngle = this.player.aimAngle;
        const count = this.player.multishot;
        const spread = 0.18;
        const startAngle = aimAngle - (count - 1) * spread / 2;

        for (let i = 0; i < count; i++) {
            const a = startAngle + i * spread;
            this.projectiles.push(new Projectile(
                this.player.x + Math.cos(a) * this.player.radius,
                this.player.y + Math.sin(a) * this.player.radius,
                Math.cos(a) * PROJECTILE_SPEED,
                Math.sin(a) * PROJECTILE_SPEED,
                this.player.damage
            ));
        }
        this.audio.play('shoot');
    }

    render() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, W, H);

        if (!this.player && this.state === 'MENU') {
            this.renderMenuBackground(ctx, W, H);
            return;
        }

        ctx.save();
        this.camera.applyTransform(ctx);

        this.renderer.drawBackground(this.camera.x, this.camera.y, W, H, WORLD_W, WORLD_H);

        for (const orb of this.xpOrbs) this.renderer.drawXPOrb(orb);
        for (const p of this.projectiles) this.renderer.drawProjectile(p);
        for (const ep of this.enemyProjectiles) this.renderer.drawEnemyProjectile(ep);
        for (const e of this.enemies) this.renderer.drawEnemy(e);

        if (this.player && this.state !== 'GAME_OVER') {
            this.renderer.drawPlayer(this.player);
        }

        for (const p of this.particles) this.renderer.drawParticle(p);

        ctx.restore();

        if (this.player && (this.state === 'PLAYING' || this.state === 'UPGRADE')) {
            this.ui.drawHUD(ctx, this.player, this.waveManager, this.score, W);
        }
    }

    renderMenuBackground(ctx, W, H) {
        const time = performance.now() / 1000;
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 60) {
            const offset = Math.sin(time + x * 0.01) * 5;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + offset, H);
            ctx.stroke();
        }
        for (let y = 0; y < H; y += 60) {
            const offset = Math.cos(time + y * 0.01) * 5;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y + offset);
            ctx.stroke();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
